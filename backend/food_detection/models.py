from django.db import models
from django.conf import settings
from datetime import datetime

class Food(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    calories = models.IntegerField()
    protein = models.FloatField()
    carbs = models.FloatField()
    fat = models.FloatField()
    food_class = models.CharField(max_length=100)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class DetectionHistory(models.Model):
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    confidence = models.FloatField()
    detected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.food.name} - {self.detected_at}"

    class Meta:
        ordering = ['-detected_at']
# Only define Firestore models if Firebase is configured
if hasattr(settings, 'db') and settings.db is not None:
    class FirestoreFood:
        def __init__(self, id=None, name=None, category=None, calories=None, 
                     protein=None, carbs=None, fat=None, image_url=None, 
                     food_class=None, created_at=None, updated_at=None):
            self.id = id
            self.name = name
            self.category = category
            self.calories = calories
            self.protein = protein
            self.carbs = carbs
            self.fat = fat
            self.image_url = image_url
            self.food_class = food_class
            self.created_at = created_at
            self.updated_at = updated_at

        @classmethod
        def from_dict(cls, data):
            return cls(**data)

        def to_dict(self):
            return {
                'name': self.name,
                'category': self.category,
                'calories': self.calories,
                'protein': self.protein,
                'carbs': self.carbs,
                'fat': self.fat,
                'image_url': self.image_url,
                'food_class': self.food_class,
                'created_at': self.created_at,
                'updated_at': self.updated_at
            }

        @classmethod
        async def get_all(cls):
            foods_ref = settings.db.collection('foods')
            docs = foods_ref.stream()
            return [cls.from_dict(doc.to_dict()) for doc in docs]

        @classmethod
        async def get_by_category(cls, category):
            foods_ref = settings.db.collection('foods')
            docs = foods_ref.where('category', '==', category).stream()
            return [cls.from_dict(doc.to_dict()) for doc in docs]

        @classmethod
        async def get_by_id(cls, food_id):
            food_ref = settings.db.collection('foods').document(food_id)
            doc = food_ref.get()
            if doc.exists:
                return cls.from_dict(doc.to_dict())
            return None

        async def save(self):
            foods_ref = settings.db.collection('foods')
            if self.id:
                foods_ref.document(self.id).set(self.to_dict())
            else:
                doc_ref = foods_ref.document()
                self.id = doc_ref.id
                doc_ref.set(self.to_dict())

    class FirestoreDetectionHistory:
        def __init__(self, id=None, food_id=None, image_url=None, confidence=None, detected_at=None):
            self.id = id
            self.food_id = food_id
            self.image_url = image_url
            self.confidence = confidence
            self.detected_at = detected_at

        @classmethod
        def from_dict(cls, data):
            return cls(**data)

        def to_dict(self):
            return {
                'food_id': self.food_id,
                'image_url': self.image_url,
                'confidence': self.confidence,
                'detected_at': self.detected_at
            }

        @classmethod
        async def get_all(cls):
            detections_ref = settings.db.collection('detections')
            docs = detections_ref.stream()
            return [cls.from_dict(doc.to_dict()) for doc in docs]

        async def save(self):
            detections_ref = settings.db.collection('detections')
            if self.id:
                detections_ref.document(self.id).set(self.to_dict())
            else:
                doc_ref = detections_ref.document()
                self.id = doc_ref.id
                doc_ref.set(self.to_dict())

# Make Firestore classes available even if Firebase is not configured
else:
    FirestoreFood = None
    FirestoreDetectionHistory = None 
