from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import requests

@api_view(['GET'])
def food_item_list(request):
    search = request.query_params.get('search', '')
    category = request.query_params.get('category', 'all')
    
    if not search:
        return Response({"error": "Search term is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    url = 'https://world.openfoodfacts.org/cgi/search.pl'
    params = {
        'search_terms': search,
        'search_simple': 1,
        'json': 1,
        'fields': 'product_name,nutriments,image_front_url',
        'page_size': 10
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        
        food_items = []
        for product in data.get('products', []):
            name = product.get('product_name', '')
            if not name:
                continue
            nutriments = product.get('nutriments', {})
            item = {
                'id': name.lower().replace(' ', '_'),
                'name': name,
                'calories': nutriments.get('energy-kcal_100g', 0),
                'protein': nutriments.get('proteins_100g', 0),
                'carbs': nutriments.get('carbohydrates_100g', 0),
                'fat': nutriments.get('fat_100g', 0),
                'category': category if category != 'all' else 'General',
                'image': product.get('image_front_url', f'https://source.unsplash.com/featured/?{search.replace(" ", ",")}')
            }
            food_items.append(item)
        
        return Response(food_items)
    except requests.RequestException as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)