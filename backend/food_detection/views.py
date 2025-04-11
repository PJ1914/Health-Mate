import base64
import io
import json
from PIL import Image
import numpy as np
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import Food, DetectionHistory
from .serializers import (
    DetectionHistorySerializer,
    FoodDetectionRequestSerializer,
    FoodSerializer
)
import cv2
import logging
import tensorflow as tf

logger = logging.getLogger(__name__)

# Try to import Firestore models if available
try:
    from .models import FirestoreFood, FirestoreDetectionHistory
    HAS_FIRESTORE = hasattr(settings, 'db') and settings.db is not None
except ImportError:
    HAS_FIRESTORE = False

# Define common food classes directly in the code
FOOD_CLASSES = [
    'apple', 'banana', 'orange', 'sandwich', 'pizza', 'burger', 'hotdog', 
    'rice', 'noodles', 'salad', 'bread', 'cake', 'donut', 'coffee', 'juice'
]

# Define non-food classes that might be detected
NON_FOOD_CLASSES = [
    'person', 'human', 'face', 'dog', 'cat', 'bird', 'car', 'truck', 'bus',
    'chair', 'table', 'laptop', 'computer', 'phone', 'book', 'pen', 'pencil',
    'desk', 'bed', 'sofa', 'couch', 'television', 'tv', 'monitor', 'keyboard',
    'mouse', 'door', 'window', 'wall', 'floor', 'ceiling', 'light', 'lamp',
    'clock', 'watch', 'shoe', 'boot', 'sock', 'shirt', 'pants', 'dress', 'hat',
    'glasses', 'sunglasses', 'bag', 'backpack', 'purse', 'wallet', 'key', 'lock',
    'bottle', 'cup', 'glass', 'bowl', 'plate', 'fork', 'spoon', 'knife'
]

# Load the pre-trained model
try:
    model = tf.keras.applications.MobileNetV2(
        weights='imagenet',
        include_top=True
    )
    logger.info("Successfully loaded MobileNetV2 model")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    model = None

def preprocess_image(image):
    # Resize image to 224x224 (MobileNetV2 input size)
    image = cv2.resize(image, (224, 224))
    # Convert BGR to RGB
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    # Normalize
    image = image / 255.0
    # Add batch dimension
    image = np.expand_dims(image, axis=0)
    return image

def detect_food_in_image(image):
    if model is None:
        raise ValueError("Model not loaded")
    
    # Preprocess the image
    processed_image = preprocess_image(image)
    
    # Get predictions
    predictions = model.predict(processed_image)
    
    # Get top 5 predictions
    top_indices = np.argsort(predictions[0])[-5:][::-1]
    top_probs = predictions[0][top_indices]
    
    # Check if any of the top predictions are non-food items
    non_food_detected = False
    for idx in top_indices:
        # Get the class name from ImageNet
        class_name = tf.keras.applications.mobilenet_v2.decode_predictions(predictions, top=5)[0][0][1]
        if class_name.lower() in NON_FOOD_CLASSES:
            non_food_detected = True
            break
    
    if non_food_detected:
        return {"error": "Cannot detect - non-food item in frame", "is_food": False}
    
    # Convert to food items
    detected_foods = []
    for idx, prob in zip(top_indices, top_probs):
        # Only process if confidence is above threshold
        if float(prob) < 0.3:  # Confidence threshold
            continue
            
        food_name = FOOD_CLASSES[idx % len(FOOD_CLASSES)]
        try:
            food = Food.objects.get(name__iexact=food_name)
            detected_foods.append({
                "name": food.name,
                "calories": food.calories,
                "protein": food.protein,
                "carbs": food.carbs,
                "fat": food.fat,
                "confidence": float(prob)
            })
            
            # Create detection history
            DetectionHistory.objects.create(
                food=food,
                confidence=float(prob)
            )
        except Food.DoesNotExist:
            logger.warning(f"Food item {food_name} not found in database")
            continue
    
    if not detected_foods:
        return {"error": "Cannot detect - no food items found", "is_food": False}
    
    return {"results": detected_foods, "is_food": True}

class FoodDetectionViewSet(viewsets.ModelViewSet):
    serializer_class = DetectionHistorySerializer
    queryset = DetectionHistory.objects.all()

    async def get_queryset(self):
        if HAS_FIRESTORE:
            return await FirestoreDetectionHistory.get_all()
        return super().get_queryset()

    @action(detail=False, methods=['post'])
    async def detect_food(self, request):
        serializer = FoodDetectionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get image from request
            image_data = serializer.validated_data.get('image')
            if not image_data:
                return Response(
                    {"error": "No image provided"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Convert base64 to image
            try:
                image_bytes = base64.b64decode(image_data)
                image = Image.open(io.BytesIO(image_bytes))
                image = np.array(image)
            except Exception as e:
                logger.error(f"Error decoding image: {str(e)}")
                return Response(
                    {"error": "Invalid image format"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Detect food in image
            result = detect_food_in_image(image)
            
            if not result.get("is_food", False):
                return Response(
                    {"error": result.get("error", "Cannot detect food")},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response({
                "results": result["results"],
                "message": "Food detected successfully"
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error in food detection: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class FoodViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FoodSerializer
    queryset = Food.objects.all()

    async def get_queryset(self):
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)

        if HAS_FIRESTORE:
            if category and category != 'all':
                return await FirestoreFood.get_by_category(category)
            return await FirestoreFood.get_all()
        else:
            queryset = super().get_queryset()
            if category and category != 'all':
                queryset = queryset.filter(category=category)
            if search:
                queryset = queryset.filter(name__icontains=search)
            return queryset

@api_view(['POST'])
@parser_classes([MultiPartParser])
def detect_food(request):
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Read the uploaded image
        image_file = request.FILES['image']
        image_bytes = image_file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return Response({'error': 'Invalid image format'}, status=status.HTTP_400_BAD_REQUEST)

        # Detect food in image
        result = detect_food_in_image(image)
        
        if not result.get("is_food", False):
            return Response(
                {'error': result.get("error", "Cannot detect food")},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            'detected_foods': result["results"],
            'message': 'Food detected successfully'
        })

    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        return Response(
            {'error': f'Error processing image: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 