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
from .models import (
    Food, DetectionHistory,
    FirestoreFood, FirestoreDetectionHistory
)
from .serializers import (
    DetectionHistorySerializer,
    FoodDetectionRequestSerializer,
    FoodSerializer
)
import cv2
import logging

logger = logging.getLogger(__name__)

class FoodDetectionViewSet(viewsets.ModelViewSet):
    serializer_class = DetectionHistorySerializer

    async def get_queryset(self):
        if settings.db is not None:
            return await FirestoreDetectionHistory.get_all()
        return DetectionHistory.objects.all()

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

    async def get_queryset(self):
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)

        if settings.db is not None:
            if category and category != 'all':
                return await FirestoreFood.get_by_category(category)
            return await FirestoreFood.get_all()
        else:
            queryset = Food.objects.all()
            if category and category != 'all':
                queryset = queryset.filter(category=category)
            if search:
                queryset = queryset.filter(name__icontains=search)
            return queryset

@api_view(['POST'])
@parser_classes([MultiPartParser])
async def detect_food(request):
    logger.info("Received food detection request")
    
    if 'image' not in request.FILES:
        logger.error("No image file in request")
        return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Read the uploaded image
        image_file = request.FILES['image']
        logger.info(f"Received image file: {image_file.name}, size: {image_file.size} bytes")
        
        # Read image data
        image_bytes = image_file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            logger.error("Failed to decode image")
            return Response({'error': 'Invalid image format'}, status=status.HTTP_400_BAD_REQUEST)
            
        logger.info(f"Successfully decoded image with shape: {image.shape}")

        # In production, this would use a trained model to detect food
        # For now, we'll return some sample foods from the database
        if settings.db is not None:
            detected_foods = await FirestoreFood.get_all()
        else:
            detected_foods = Food.objects.all()
        
        detected_foods = detected_foods[:2]  # Get first two foods as example
        
        results = [
            {
                "name": food.name,
                "calories": food.calories,
                "protein": food.protein,
                "carbs": food.carbs,
                "fat": food.fat,
                "image_url": food.image_url
            }
            for food in detected_foods
        ]

        # Save detection history
        for food in detected_foods:
            if settings.db is not None:
                detection = FirestoreDetectionHistory(
                    food_id=food.id,
                    image_url=request.build_absolute_uri(image_file.url) if hasattr(image_file, 'url') else '',
                    confidence=0.85  # This would come from the ML model in production
                )
                await detection.save()
            else:
                DetectionHistory.objects.create(
                    food=food,
                    image_url=request.build_absolute_uri(image_file.url) if hasattr(image_file, 'url') else '',
                    confidence=0.85  # This would come from the ML model in production
                )

        logger.info(f"Returning detection results: {results}")
        return Response({
            'detected_foods': results,
            'message': 'Food detected successfully'
        })

    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        return Response(
            {'error': f'Error processing image: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 