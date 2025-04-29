from django.http import JsonResponse
from firebase_admin import auth
import logging

logger = logging.getLogger(__name__)

class FirebaseAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Authorization header missing or invalid'}, status=401)

        id_token = auth_header.split('Bearer ')[1]
        try:
            decoded_token = auth.verify_id_token(id_token)
            request.user = decoded_token
            request.user_id = decoded_token['uid']
        except Exception as e:
            logger.error(f"Firebase auth error: {str(e)}")
            return JsonResponse({'error': 'Invalid Firebase token'}, status=401)

        return self.get_response(request)