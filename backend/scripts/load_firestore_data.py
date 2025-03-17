import os
import sys
import django
import json
from datetime import datetime
from pathlib import Path

# Add the parent directory to Python path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from food_detection.models import Food

# Sample food data
FOODS = [
    {
        "name": "Chicken Breast",
        "category": "Protein",
        "calories": 165,
        "protein": 31,
        "carbs": 0,
        "fat": 3.6,
        "image_url": "https://example.com/chicken-breast.jpg",
        "food_class": "chicken_breast"
    },
    {
        "name": "Broccoli",
        "category": "Vegetables",
        "calories": 55,
        "protein": 3.7,
        "carbs": 11.2,
        "fat": 0.6,
        "image_url": "https://example.com/broccoli.jpg",
        "food_class": "broccoli"
    },
    {
        "name": "Brown Rice",
        "category": "Carbs",
        "calories": 216,
        "protein": 5,
        "carbs": 45,
        "fat": 1.8,
        "image_url": "https://example.com/brown-rice.jpg",
        "food_class": "brown_rice"
    },
    {
        "name": "Apple",
        "category": "Fruits",
        "calories": 95,
        "protein": 0.5,
        "carbs": 25,
        "fat": 0.3,
        "image_url": "https://example.com/apple.jpg",
        "food_class": "apple"
    },
    {
        "name": "Greek Yogurt",
        "category": "Dairy",
        "calories": 133,
        "protein": 10,
        "carbs": 9,
        "fat": 5,
        "image_url": "https://example.com/greek-yogurt.jpg",
        "food_class": "greek_yogurt"
    }
]

async def load_food_data():
    for food_data in FOODS:
        food = Food(**food_data)
        await food.save()
        print(f"Loaded food: {food.name}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(load_food_data()) 