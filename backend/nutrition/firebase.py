import firebase_admin
from firebase_admin import credentials, firestore

# Path to your downloaded firebase_credentials.json file
cred = credentials.Certificate("firebase_credentials.json")

# Initialize the app only once
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()
