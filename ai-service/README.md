# StayScholars AI Service

FastAPI service for AI-powered recommendations and rent prediction.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the service:
```bash
python app.py
```

Or with uvicorn:
```bash
uvicorn app:app --reload --port 8000
```

## Endpoints

### GET /
Health check and service info

### POST /recommendations
Get personalized accommodation recommendations

Request body:
```json
{
  "userId": "user123",
  "preferences": {
    "type": "PG"
  },
  "location": {
    "city": "Mumbai",
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "budget": {
    "min": 3000,
    "max": 10000
  }
}
```

### POST /predict-rent
Predict rent for a property

Request body:
```json
{
  "type": "PG",
  "location": {
    "city": "Mumbai",
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "amenities": ["wifi", "parking"],
  "size": 1,
  "facilities": {
    "ac": true,
    "wifi": true,
    "parking": true
  }
}
```

## Notes

- This is a simplified implementation for demonstration
- In production, train models with real data
- Use proper geolocation services for distance calculations
- Implement model persistence and versioning

