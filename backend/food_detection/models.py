from django.db import models

class Food(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    calories = models.IntegerField()
    protein = models.FloatField()
    carbs = models.FloatField()
    fat = models.FloatField()
    image_url = models.URLField()
    food_class = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class DetectionHistory(models.Model):
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    image_url = models.URLField()
    confidence = models.FloatField()
    detected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Detection of {self.food.name} at {self.detected_at}" 