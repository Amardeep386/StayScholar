# StayScholar Knowledge Base & Archive

This file contains consolidated technical documentation, bug fixes, and setup guides originally stored in individual files.

---

## 🚀 Features Overview
StayScholar is a comprehensive student accommodation platform with the following features:
- **Auth**: JWT-based student/owner registration and login.
- **Accommodations**: Complete CRUD for listings with advanced filtering (city, type, rent, gender).
- **Bookings**: Workflow from request to acceptance and payment.
- **Payments**: Integrated Razorpay and Cashfree gateways.
- **Messaging**: Real-time communication between students and owners.
- **Reviews**: Rating and review system for completed bookings.
- **AI Services**: Personalized recommendations and rent prediction (FastAPI).

---

## 🎨 Design System & Color Scheme
StayScholar uses a modern **Dark Theme** with orange and gold accents.

| Category | Role | Color | Hex |
|----------|------|-------|-----|
| **Primary** | Brand / CTAs | Orange | `#ff6b35` |
| **Secondary**| Highlights | Gold | `#ffa500` |
| **Background**| Main | Black | `#0a0a0a` |
| **Card** | Containers | Card Black | `#121212` |
| **Text** | Primary | White | `#ffffff` |
| **Text** | Secondary | Light Gray | `#d4d4d4` |

---

## 💳 Payment Gateway Guides

### Razorpay Setup
- **Keys**: Must be set in both `backend/.env` and `frontend/.env`.
- **401 Error**: Usually due to invalid keys or placeholder values. Ensure services are restarted after updating `.env`.

### Cashfree Setup
- **Environment**: Set `CASHFREE_ENV=PROD` for production credentials (`cfsk_ma_prod_`).
- **API Version**: Uses `x-api-version: 2023-08-01`.
- **HTTPS Requirement**: PROD mode requires HTTPS. Use **ngrok** for local testing: `ngrok http 5000`.
- **Max Order Amount**: If you hit a limit, update `CASHFREE_MAX_ORDER_AMOUNT` in `.env` and request a limit increase in the Cashfree dashboard.

---

## 🛠 Troubleshooting & Bug Fixes

### "Failed to Load Accommodation" Detail Page
- **Fix**: Removed invalid `.populate('reviews')` from the backend route in `backend/routes/accommodations.js` as the `reviews` field doesn't exist on the Accommodation schema.

### MongoDB Connection Issues
- **Local**: Ensure MongoDB service is running (`net start MongoDB`).
- **Cloud (Atlas)**: Recommended for easiest setup. Update `MONGODB_URI` in `backend/.env`.

---

## 📊 Demo & Testing
- **Seeding**: Run `npm run seed` in the `backend` directory to create demo accounts (3 students, 3 owners) and 6 listings.
- **Accounts**: Most demo accounts use `password123`.

---

## 📂 Archived Documentation Reference
The following files were consolidated into this Knowledge Base for a cleaner root directory:
- `BUG_FIX_ACCOMMODATION_DETAIL.md`
- `CASHFREE_*.md` (Fixes, HTTPS, Limits, Reference, Setup, Troubleshooting)
- `COLOR_SCHEME_DOCUMENTATION.md`
- `DEMO_DATA.md`
- `FEATURES.md`
- `FIX_RAZORPAY_401_ERROR.md`
- `MONGODB_SETUP.md`
- `PAYMENT_*.md` (Integration, Implementation, Quick Reference, Setup, Summary)
- `THEME_*.md` (Implementation, Reference)
- `TROUBLESHOOTING.md`
- `VADODARA_ACCOMMODATIONS_UPDATE.md`
- `START_BACKEND.md`
- `QUICK_START.md`
- `QUICK_FIX_*.md` (Connection, Razorpay)
- `RAZORPAY_FIX_SUMMARY.md`
- `README_PAYMENT.md`
