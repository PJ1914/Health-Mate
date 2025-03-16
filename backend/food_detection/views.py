import base64
import io
import json
from PIL import Image
import numpy as np
from django.conf import settings
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from django.shortcuts import get_object_or_404
from .models import DetectionHistory, Food
from .serializers import (
    DetectionHistorySerializer,
    FoodDetectionRequestSerializer,
    FoodSerializer
)
import cv2

class FoodDetectionViewSet(viewsets.ModelViewSet):
    queryset = DetectionHistory.objects.all()
    serializer_class = DetectionHistorySerializer

    @action(detail=False, methods=['post'])
    def detect_food(self, request):
        serializer = FoodDetectionRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            # For demo purposes, return dummy results
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
    queryset = Food.objects.all()
    serializer_class = FoodSerializer

    def get_queryset(self):
        queryset = Food.objects.all()
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)

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

        # For now, return dummy detection results
        dummy_results = [
            get_object_or_404(Food, food_class='chicken_breast').to_dict(),
            get_object_or_404(Food, food_class='broccoli').to_dict(),
        ]

        return Response({
            'detected_foods': dummy_results,
            'message': 'Food detected successfully'
        })

    except Exception as e:
        return Response(
            {'error': f'Error processing image: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 