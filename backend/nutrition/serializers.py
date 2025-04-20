from rest_framework import serializers
from .models import FoodEntry

class FoodEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodEntry
        fields = '__all__'
