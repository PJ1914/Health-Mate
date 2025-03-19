from django.contrib import admin
from .models import Food, DetectionHistory

@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'calories', 'protein', 'carbs', 'fat')
    list_filter = ('category',)
    search_fields = ('name', 'category')
    ordering = ('name',)

@admin.register(DetectionHistory)
class DetectionHistoryAdmin(admin.ModelAdmin):
    list_display = ('food', 'confidence', 'detected_at')
    list_filter = ('detected_at', 'food__category')
    search_fields = ('food__name',)
    ordering = ('-detected_at',) 