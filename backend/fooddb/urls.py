from django.urls import path
from . import views

urlpatterns = [
    path('', views.food_item_list, name='food_item_list'),
]