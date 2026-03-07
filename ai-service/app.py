from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import pickle
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="StayScholars AI Service")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models (in production, these would be trained and loaded)
rent_model = None
recommendation_model = None
scaler = StandardScaler()

# Sample data for demonstration (in production, use real data)
SAMPLE_ACCOMMODATIONS = [
    {
        "id": "1",
        "type": "PG",
        "rent": 5000,
        "location": {"city": "Mumbai", "latitude": 19.0760, "longitude": 72.8777},
        "facilities": {"wifi": True, "ac": False, "parking": True},
        "rating": 4.5
    },
    {
        "id": "2",
        "type": "Hostel",
        "rent": 8000,
        "location": {"city": "Delhi", "latitude": 28.6139, "longitude": 77.2090},
        "facilities": {"wifi": True, "ac": True, "parking": True},
        "rating": 4.8
    }
]


class RecommendationRequest(BaseModel):
    userId: str
    preferences: Optional[Dict] = {}
    location: Optional[Dict] = {}
    budget: Optional[Dict] = {"min": 0, "max": 50000}
    userProfile: Optional[Dict] = {}


class RentPredictionRequest(BaseModel):
    type: str
    location: Dict
    amenities: Optional[List[str]] = []
    size: Optional[int] = 1
    facilities: Optional[Dict] = {}


class RecommendationResponse(BaseModel):
    recommendations: List[Dict]
    confidence: float


class RentPredictionResponse(BaseModel):
    predicted_rent: float
    confidence: float
    factors: Dict


def calculate_similarity_score(accommodation, preferences, location, budget):
    """Calculate similarity score for recommendation"""
    score = 0.0
    factors = 0

    # Type preference
    if preferences.get("type") and accommodation.get("type") == preferences["type"]:
        score += 0.3
    factors += 1

    # Budget match
    if budget:
        rent = accommodation.get("rent", 0)
        if budget.get("min", 0) <= rent <= budget.get("max", 50000):
            score += 0.3
        elif rent < budget.get("min", 0):
            score += 0.1
        factors += 1

    # Location proximity (simplified)
    if location and accommodation.get("location"):
        # Simple distance calculation (in production, use proper geolocation)
        score += 0.2
        factors += 1

    # Rating
    if accommodation.get("rating"):
        score += (accommodation["rating"] / 5.0) * 0.2
        factors += 1

    return score / factors if factors > 0 else 0.0


def predict_rent(type: str, location: Dict, amenities: List, size: int, facilities: Dict) -> float:
    """Predict rent based on features"""
    # Base rent by type
    base_rents = {
        "PG": 5000,
        "Hostel": 8000,
        "Flat": 15000,
        "Shared Room": 4000
    }
    
    base_rent = base_rents.get(type, 5000)
    
    # Location multiplier (simplified - in production, use real data)
    city_multipliers = {
        "Mumbai": 1.5,
        "Delhi": 1.3,
        "Bangalore": 1.2,
        "Pune": 1.1,
        "Hyderabad": 1.0
    }
    
    city = location.get("city", "").title()
    multiplier = city_multipliers.get(city, 1.0)
    
    # Amenities/facilities adjustment
    amenities_bonus = 0
    if facilities.get("ac"):
        amenities_bonus += 2000
    if facilities.get("wifi"):
        amenities_bonus += 500
    if facilities.get("parking"):
        amenities_bonus += 1000
    if facilities.get("security"):
        amenities_bonus += 500
    
    # Size adjustment
    size_factor = 1.0 + (size - 1) * 0.1
    
    predicted_rent = (base_rent * multiplier * size_factor) + amenities_bonus
    
    return round(predicted_rent, 2)


@app.get("/")
async def root():
    return {
        "message": "StayScholars AI Service",
        "status": "running",
        "endpoints": ["/recommendations", "/predict-rent"]
    }


@app.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Get AI-powered accommodation recommendations based on user preferences
    """
    try:
        # In production, fetch real accommodations from database
        accommodations = SAMPLE_ACCOMMODATIONS
        
        # Score each accommodation
        scored_accommodations = []
        for acc in accommodations:
            score = calculate_similarity_score(
                acc,
                request.preferences,
                request.location,
                request.budget
            )
            scored_accommodations.append({
                **acc,
                "recommendation_score": score
            })
        
        # Sort by score
        scored_accommodations.sort(key=lambda x: x["recommendation_score"], reverse=True)
        
        # Return top recommendations
        recommendations = scored_accommodations[:10]
        
        # Calculate average confidence
        avg_confidence = np.mean([acc["recommendation_score"] for acc in recommendations])
        
        return RecommendationResponse(
            recommendations=recommendations,
            confidence=round(avg_confidence, 2)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")


@app.post("/predict-rent", response_model=RentPredictionResponse)
async def predict_rent_endpoint(request: RentPredictionRequest):
    """
    Predict rent for a property based on features
    """
    try:
        predicted_rent = predict_rent(
            request.type,
            request.location,
            request.amenities,
            request.size,
            request.facilities
        )
        
        # Calculate confidence (simplified)
        confidence = 0.75  # In production, calculate based on model certainty
        
        factors = {
            "type": request.type,
            "location": request.location.get("city", "Unknown"),
            "amenities_count": len(request.amenities),
            "size": request.size,
            "facilities_count": len(request.facilities)
        }
        
        return RentPredictionResponse(
            predicted_rent=predicted_rent,
            confidence=confidence,
            factors=factors
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting rent: {str(e)}")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-service"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

