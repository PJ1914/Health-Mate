from django.urls import path
from . import views

urlpatterns = [
    path('food/', views.food_list),
    path('food/<str:pk>/', views.food_delete),
    path('summary/', views.food_summary),
]
