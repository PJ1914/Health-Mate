from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .firebase import db
from firebase_admin import firestore
import uuid
from datetime import datetime

collection_name = 'food_entries'  # Firestore collection name


@api_view(['GET', 'POST'])
def food_list(request):
    if request.method == 'GET':
        # Fetch all documents, ordered by timestamp descending
        try:
            docs = db.collection(collection_name).order_by(
                "timestamp", direction=firestore.Query.DESCENDING
            ).stream()
            entries = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id  # add document ID to the data
                entries.append(data)
            return Response(entries)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    elif request.method == 'POST':
        data = request.data
        try:
            # Validate required fields
            required_fields = ["food_name", "calories", "protein", "carbs", "fat"]
            if not all(field in data for field in required_fields):
                return Response(
                    {"error": "Missing required fields"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate numeric fields
            for field in ["calories", "protein", "carbs", "fat"]:
                try:
                    float(data[field])
                except (ValueError, TypeError):
                    return Response(
                        {"error": f"Invalid value for {field}: must be a number"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            new_id = str(uuid.uuid4())
            db.collection(collection_name).document(new_id).set({
                "food_name": data["food_name"],
                "calories": float(data["calories"]),
                "protein": float(data["protein"]),
                "carbs": float(data["carbs"]),
                "fat": float(data["fat"]),
                "timestamp": datetime.utcnow()
            })
            return Response({"id": new_id, **data}, status=status.HTTP_201_CREATED)
        except (ValueError, TypeError) as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Failed to create entry: {str(e)}"}, 
                           status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def food_delete(request, pk):
    try:
        doc_ref = db.collection(collection_name).document(pk)
        if doc_ref.get().exists:
            doc_ref.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({"error": "Document not found"}, 
                           status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def food_summary(request):
    try:
        docs = db.collection(collection_name).stream()
        total = {
            "total_calories": 0.0,
            "total_protein": 0.0,
            "total_carbs": 0.0,
            "total_fat": 0.0
        }
        for doc in docs:
            data = doc.to_dict()
            for key in ["calories", "protein", "carbs", "fat"]:
                try:
                    total[f"total_{key}"] += float(data.get(key, 0))
                except (ValueError, TypeError):
                    # Skip invalid data
                    continue
        return Response(total)
    except Exception as e:
        return Response({"error": f"Failed to compute summary: {str(e)}"}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)