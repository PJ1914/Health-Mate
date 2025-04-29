from django.db import models

class FoodItem(models.Model):
    name = models.CharField(max_length=100)
    calories = models.FloatField()
    protein = models.FloatField()
    carbs = models.FloatField()
    fat = models.FloatField()
    category = models.CharField(max_length=50)
    image = models.URLField(max_length=500, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']