# StayScholars - Student Accommodation Platform

A comprehensive digital platform for student accommodation management that simplifies the housing search and booking process for students.

## 🚀 Project Overview

StayScholars integrates modern web technologies, artificial intelligence, and secure digital payment systems to help students discover, compare, and book PGs, hostels, flats, and shared rooms near their college campuses.

---

## 🛠 Technology Stack

### Frontend
- **React.js** - Modern UI framework
- **HTML, CSS, JavaScript** - Core web technologies
- **React Router** - Navigation
- **Axios** - HTTP client
- **Leaflet/Google Maps** - Map integration

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (Mongoose ODM)
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### AI Service
- **Python** (FastAPI) - ML-powered recommendations and rent prediction

### Payment Gateways
- **Razorpay** & **Cashfree** - Secure payment processing

---

## 📋 Features

- ✅ **Real-time Search**: Advanced filters for finding the perfect accommodation.
- ✅ **Map Integration**: Browse properties based on location.
- ✅ **Secure Messaging**: Direct communication between students and owners.
- ✅ **Booking Workflow**: Complete lifecycle from request to payment.
- ✅ **AI Recommendations**: Personalized suggestions based on user preferences.
- ✅ **Rent Prediction**: AI-based estimation for property owners.
- ✅ **Dual Payment Gateways**: Support for Razorpay and Cashfree.

---

## 🏗 Project Structure

```
StayScholar/
├── frontend/          # React.js frontend application
│   ├── src/components/ # Reusable UI components
│   ├── src/pages/      # Main application pages
│   └── src/context/    # Auth and State management
├── backend/           # Node.js/Express backend API
│   ├── models/        # Mongoose Database Models
│   ├── routes/        # API Endpoints
│   └── middleware/    # Auth and utility middleware
└── ai-service/        # Python FastAPI AI service
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB (Local or Atlas)

### 1. Install Dependencies
From the root directory:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ../ai-service && pip install -r requirements.txt
```

### 2. Environment Configuration

### Backend (.env)
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENV=TEST # or PROD
AI_SERVICE_URL=http://localhost:8000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MAP_API_KEY=your_google_maps_api_key
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Database Setup (MongoDB)
- **Local**: Install MongoDB and ensure the service is running.
- **Cloud (Atlas)**: Create a free cluster at [mongodb.com](https://www.mongodb.com/cloud/atlas), get the connection string, and update `MONGODB_URI`.

### 4. Running the App
From the root directory:
```bash
npm run dev
```
*Note: Ensure the AI service is also running (python app.py in `ai-service/`).*

---

## 🎨 Design System

StayScholars uses a modern **Dark Theme** with high-contrast accents:
- **Primary**: Orange (`#ff6b35`) - Buttons and CTA
- **Accent**: Gold (`#ffa500`) / Bright Gold (`#ffd700`) - Highlights and Ratings
- **Background**: Pure Black (`#0a0a0a`) / Card Black (`#121212`)
- **Text**: White (`#ffffff`) / Light Gray (`#d4d4d4`)

---

## 💳 Payment Integration

### Razorpay
Configure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in the backend.

### Cashfree
Configure `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY`. Set `PAYMENT_GATEWAY` to `cashfree` or `razorpay` to change the default behavior.

---

## 📚 Knowledge Base & Archive

For detailed troubleshooting guides, bug fix history, and in-depth configuration notes (Cashfree, Razorpay, MongoDB), please refer to:
👉 [**KNOWLEDGE_BASE.md**](./KNOWLEDGE_BASE.md)

---

## 🤝 Support & Author
**Author**: Amardeep Shah
**License**: MIT
