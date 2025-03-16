from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'foods', views.FoodViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('detect/', views.detect_food, name='detect-food'),
] 