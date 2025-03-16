# Health Mate

A web application for real-time food calorie detection using computer vision and machine learning.

## Features

- Real-time food detection from images
- Nutritional information tracking
- Food database with common items
- User-friendly interface
- Responsive design

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Material-UI for components
- Axios for API requests
- React Router for navigation

### Backend
- Django REST Framework
- SQLite database
- OpenCV for image processing
- Firebase for authentication
- CORS support for frontend integration

## Setup

### Backend Setup

1. Create and activate virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Load initial food data:
```bash
python manage.py load_food_data data/food_dataset.csv
```

5. Start development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start development server:
```bash
npm run dev
```

## API Endpoints

- `GET /api/foods/` - List all foods
- `GET /api/foods/?category=Protein` - Filter foods by category
- `GET /api/foods/?search=chicken` - Search foods by name
- `POST /api/detect/` - Upload image for food detection

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### Backend (.env)
```
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 