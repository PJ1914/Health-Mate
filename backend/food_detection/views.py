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
            # For demo purposes, return dummy results
            # In production, this would use a trained model
            dummy_results = [
                {"food_name": "Apple", "calories": 95, "confidence": 0.85},
                {"food_name": "Banana", "calories": 105, "confidence": 0.75}
            ]

            return Response({"results": dummy_results}, status=status.HTTP_200_OK)

        except Exception as e:
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

        # For testing, return all foods from database
        foods = Food.objects.all()
        if not foods.exists():
            return Response({'error': 'No food items in database'}, status=status.HTTP_404_NOT_FOUND)

        detected_foods = []
        for food in foods:
            detected_food = {
                "name": food.name,
                "calories": food.calories,
                "protein": food.protein,
                "carbs": food.carbs,
                "fat": food.fat,
                "confidence": 0.95  # Example confidence score
            }
            detected_foods.append(detected_food)

            # Create detection history
            DetectionHistory.objects.create(
                food=food,
                confidence=0.95
            )

        return Response({
            'detected_foods': detected_foods,
            'message': 'Food detected successfully'
        })

    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        return Response(
            {'error': f'Error processing image: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 