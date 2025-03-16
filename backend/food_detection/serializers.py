from rest_framework import serializers
from .models import Food, DetectionHistory

class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = ['id', 'name', 'category', 'calories', 'protein', 'carbs', 'fat', 'image_url', 'food_class']

class DetectionHistorySerializer(serializers.ModelSerializer):
    food = FoodSerializer(read_only=True)

    class Meta:
        model = DetectionHistory
        fields = ['id', 'food', 'image', 'confidence', 'detected_at']

class FoodDetectionRequestSerializer(serializers.Serializer):
    image = serializers.CharField(required=True)  # Base64 encoded image 