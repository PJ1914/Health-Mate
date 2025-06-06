from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('food_detection.urls')),
    path('api/nutrition/', include('nutrition.urls')),
    path('api/fooddb/', include('fooddb.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 