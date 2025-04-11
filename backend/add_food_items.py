import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from food_detection.models import Food

# List of food items to add
food_items = [
    {
        'name': 'Orange',
        'category': 'Fruit',
        'calories': 62,
        'protein': 1.2,
        'carbs': 15.4,
        'fat': 0.2,
        'food_class': 'orange'
    },
    {
        'name': 'Sandwich',
        'category': 'Fast Food',
        'calories': 350,
        'protein': 15,
        'carbs': 45,
        'fat': 12,
        'food_class': 'sandwich'
    },
    {
        'name': 'Pizza',
        'category': 'Fast Food',
        'calories': 266,
        'protein': 11,
        'carbs': 33,
        'fat': 10,
        'food_class': 'pizza'
    },
    {
        'name': 'Burger',
        'category': 'Fast Food',
        'calories': 354,
        'protein': 20,
        'carbs': 29,
        'fat': 17,
        'food_class': 'burger'
    },
    {
        'name': 'Hotdog',
        'category': 'Fast Food',
        'calories': 290,
        'protein': 12,
        'carbs': 18,
        'fat': 18,
        'food_class': 'hotdog'
    },
    {
        'name': 'Rice',
        'category': 'Grain',
        'calories': 130,
        'protein': 2.7,
        'carbs': 28,
        'fat': 0.3,
        'food_class': 'rice'
    },
    {
        'name': 'Noodles',
        'category': 'Grain',
        'calories': 138,
        'protein': 4.5,
        'carbs': 25,
        'fat': 0.5,
        'food_class': 'noodles'
    },
    {
        'name': 'Salad',
        'category': 'Vegetable',
        'calories': 20,
        'protein': 1.2,
        'carbs': 3.8,
        'fat': 0.2,
        'food_class': 'salad'
    },
    {
        'name': 'Bread',
        'category': 'Grain',
        'calories': 265,
        'protein': 9,
        'carbs': 49,
        'fat': 3.2,
        'food_class': 'bread'
    },
    {
        'name': 'Cake',
        'category': 'Dessert',
        'calories': 257,
        'protein': 3,
        'carbs': 38,
        'fat': 10,
        'food_class': 'cake'
    },
    {
        'name': 'Donut',
        'category': 'Dessert',
        'calories': 300,
        'protein': 4,
        'carbs': 36,
        'fat': 16,
        'food_class': 'donut'
    },
    {
        'name': 'Coffee',
        'category': 'Beverage',
        'calories': 2,
        'protein': 0.3,
        'carbs': 0,
        'fat': 0,
        'food_class': 'coffee'
    },
    {
        'name': 'Juice',
        'category': 'Beverage',
        'calories': 120,
        'protein': 1,
        'carbs': 28,
        'fat': 0,
        'food_class': 'juice'
    }
]

# Add food items to database
for item in food_items:
    # Check if food item already exists
    if not Food.objects.filter(name=item['name']).exists():
        Food.objects.create(**item)
        print(f"Added {item['name']} to database")
    else:
        print(f"{item['name']} already exists in database")

print("Food items added successfully!") 