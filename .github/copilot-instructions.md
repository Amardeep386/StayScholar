# StayScholars - Copilot Instructions

## Project Overview
StayScholars is a full-stack student accommodation platform connecting students and property owners. It features accommodation search, booking workflows, secure messaging, reviews, and AI-powered recommendations.

## Architecture

### Three-Service Architecture
1. **Frontend** (React) - UI at port 3000
2. **Backend** (Node.js/Express) - API at port 5000, connects to MongoDB
3. **AI Service** (Python/FastAPI) - ML models at port 8000

Data flow: User Request → Frontend → Backend API → MongoDB/AI Service → Response

### Key Integration Points
- Frontend calls backend via `REACT_APP_API_URL` (default: `http://localhost:5000/api`)
- Backend calls AI service via `AI_SERVICE_URL` (default: `http://localhost:8000`)
- Payment processing via Razorpay (requires API keys in backend `.env`)

## Development Workflow

### Setup & Start Services
```bash
# Install all dependencies (root)
npm run install-all

# Run all three services (from root)
npm run dev

# Or individually:
cd backend && npm run dev          # Backend on port 5000
cd frontend && npm start            # Frontend on port 3000
cd ai-service && python app.py      # AI service on port 8000
```

**Environment Variables Required:**
- `backend/.env`: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE=7d`, `RAZORPAY_KEY_*`, `AI_SERVICE_URL`
- `frontend/.env`: `REACT_APP_API_URL`, `REACT_APP_MAP_API_KEY`

### Debugging
- Frontend: Open DevTools (F12) → Console/Network tabs
- Backend: Check terminal output; logs include `✅` for success, `❌` for errors
- Test endpoints directly: `curl -X GET http://localhost:5000/api/health`

## Core Patterns

### Backend (Express + MongoDB)
- **Models** in `backend/models/`: User, Accommodation, Booking, Message, Review
- **Routes** organize by resource: `backend/routes/{auth,accommodations,bookings,messages,reviews,ai}.js`
- **Auth Middleware** in `backend/middleware/auth.js`: JWT verification + role-based authorization using `exports.protect` and `exports.authorize(...roles)`
- Error handling: Centralized error handler in `server.js` responds with `{success: false, message: ...}`

Example protected route:
```javascript
router.post('/path', protect, authorize('student'), handler);
```

### Frontend (React + Context API)
- **Authentication**: `src/context/AuthContext.js` manages auth state globally
- **Protected Routes**: `src/components/PrivateRoute.js` wraps pages requiring login
- **Navigation**: React Router 6 in `src/App.js` (no nested routing currently)
- **API Calls**: Use `axios` with base URL from `.env`
- **UI Feedback**: `react-toastify` for notifications; avoid console.log

### Booking Workflow
States: `pending` → `accepted/rejected` → `payment` → `completed`

### Role-Based Access
- **Student**: Browse, book, message, review
- **Owner**: Create listings, manage requests, message, track bookings

## Common Tasks

### Add API Endpoint
1. Create route handler in `backend/routes/resource.js`
2. Add MongoDB query in model or inline
3. Return `{success: true, data: ...}` or `{success: false, message: ...}`
4. Frontend: Use axios with error handling via try/catch

### Add Frontend Page
1. Create component in `src/pages/PageName.js` with corresponding CSS
2. Add route in `src/App.js`
3. For protected pages, wrap with `<PrivateRoute><Component /></PrivateRoute>`
4. Use `AuthContext` to access `{user, logout}` and API URLs

### Test Locally
- **Backend health**: `curl http://localhost:5000/api/health`
- **Registration flow**: Use browser to test; check backend logs for errors
- **API endpoint**: Use Postman/Insomnia or curl with correct headers: `Authorization: Bearer {token}`

## File Reference
- **Entry points**: `backend/server.js`, `frontend/src/App.js`, `ai-service/app.py`
- **Database models**: `backend/models/User.js`, `Accommodation.js`, `Booking.js`, `Message.js`, `Review.js`
- **Auth logic**: `backend/middleware/auth.js` (token verification + roles), `frontend/src/context/AuthContext.js`
- **Key routes**: `backend/routes/auth.js` (register/login), `accommodations.js` (CRUD), `bookings.js` (workflow)
