# MediTrack – Smart Medicine Search, Pharmacy Discovery & Tracking System

> **“Search • Track • Care”**  
> A Full-Stack MERN College Project providing real-time medicine search, distance-sorted pharmacy discovery, 6-step health profiling, medication routine reminders, and browser geofencing.

---

## 🌟 Key Highlights & Capabilities

- **Real Database-Driven Medicine Search**: Searches by medicine name (e.g. `Paracetamol 650 mg`), generic composition (`Paracetamol`), or brand (`Dolo 650`, `Calpol`). Calculates exact Haversine distance from customer coordinates to neighborhood pharmacies.
- **Interactive OpenStreetMap with Leaflet**: Visual markers showing pharmacy location, availability status (*In Stock*, *Low Stock*, *Out of Stock*), price comparison, and distance.
- **Three-Role Access Control (RBAC)**:
  1. **Administrator**: Full platform analytics, customer & pharmacy auditing, approve/freeze/delete pharmacies, global inventory and order overrides.
  2. **Medical Shop Owner**: Private pharmacy inventory CRUD, price adjustments, stock alerts, order status fulfillment (*Pending* → *Confirmed* → *Preparing* → *Ready for Pickup* → *Out for Delivery* → *Delivered*), and customer reviews.
  3. **Customer / Patient**: 6-step health profile, distance-sorted pharmacy search, cart & checkout (Cash on Delivery / Pay at Pharmacy), live order tracking timeline, dose reminders, and proximity geofence radar.
- **6-Step Customer Health Profile**:
  - Step 1: Personal Information (Name, Age, Gender, Height, Weight, Location)
  - Step 2: Health Conditions (Diabetes, High BP, Asthma, Thyroid, Heart, Kidney, Allergies)
  - Step 3: Current Prescriptions (Medicine, dosage, type, quantity, frequency, dates)
  - Step 4: Medication Routine (Schedule times, food relation: before/after/with food)
  - Step 5: Drug Allergies & Restrictions (Penicillin, Sulfa, etc.)
  - Step 6: Health Goals & Preferences
- **Smart Geofencing Radar**:
  - Configurable 100m–1000m proximity boundary.
  - Detects entry and exit from selected pharmacy zones using live Geolocation API.
  - Delivers in-app visual modals and browser notifications when near the stocking pharmacy.
- **Medication Reminders**:
  - Daily dosage alerts with audio chimes and native browser notification integration.
  - Daily dose completion logs (*Mark Taken Today*).

---

## 🚀 Quick Start & Demo Credentials

Pre-seeded demonstration accounts are ready for testing immediately:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@meditrack.com` | `adminPassword123!` | System statistics, pharmacy approvals & freeze controls |
| **Medical Shop** | `apollo@meditrack.com` | `shopPassword123!` | Apollo Pharmacy (Connaught Place, New Delhi) |
| **Medical Shop** | `medplus@meditrack.com` | `shopPassword123!` | MedPlus Pharmacy (Karol Bagh, New Delhi) |
| **Customer** | `rahul@meditrack.com` | `customerPassword123!` | Rahul Sharma (Completed 6-step profile, active routine) |
| **Customer** | `priya@meditrack.com` | `customerPassword123!` | Priya Patel (New customer account) |

---

## 🛠️ Technology Stack

- **Frontend**:
  - React.js 19
  - React Router DOM 7
  - Leaflet 1.9 & OpenStreetMap (custom pulsing markers & geofence radius circles)
  - Lucide React Icons
  - Axios (with JWT interceptors)
  - CSS3 Healthcare Design System (Deep Navy `#0f172a`, Teal `#0d9488`, Mint `#10b981`)
- **Backend**:
  - Node.js & Express.js REST APIs
  - JWT Authentication & bcryptjs password hashing
  - Haversine distance calculator utility
- **Database**:
  - MongoDB 8 & Mongoose ODM
  - Collections: `User`, `MedicalShop`, `Medicine`, `Order`, `Feedback`, `HealthProfile`, `MedicationReminder`, `Geofence`

---

## 📂 Project Structure

```
Medicine Search & Tracking System/
│
├── medical-backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection handler
│   ├── controllers/
│   │   ├── authController.js     # Unified login & multi-role registrations
│   │   ├── adminController.js    # Statistics, approvals, user & inventory management
│   │   ├── shopController.js     # Shop profile, orders, reviews
│   │   ├── medicineController.js # Core search with Haversine distance & inventory CRUD
│   │   ├── orderController.js    # Inventory stock deduction & status transitions
│   │   ├── customerController.js # Geofence checking & feedback submission
│   │   ├── healthController.js   # 6-step health profile get & update
│   │   └── reminderController.js # Daily reminders & logs
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── roleMiddleware.js     # Role-based access control (RBAC)
│   │   └── errorMiddleware.js    # 404 & centralized error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── MedicalShop.js
│   │   ├── Medicine.js
│   │   ├── Order.js
│   │   ├── Feedback.js
│   │   ├── HealthProfile.js
│   │   ├── MedicationReminder.js
│   │   └── Geofence.js
│   ├── routes/                   # Clean RESTful route definitions
│   ├── utils/
│   │   ├── distanceCalculator.js # Haversine formula calculation
│   │   └── seedData.js           # Automated sample dataset seeder
│   ├── server.js                 # Express server entry point (Port 5000)
│   ├── .env
│   └── package.json
│
├── medical-frontend/
│   ├── public/                   # Icons & favicon
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Header_com.jsx    # Sticky navigation with role badges & cart counter
│   │   │   ├── Footer_com.jsx    # Emergency helpline numbers & disclaimer
│   │   │   └── PharmacyMap.jsx   # Leaflet map with user & pharmacy markers
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # User session & local storage sync
│   │   │   ├── CartContext.jsx   # Shopping cart with single-pharmacy validation
│   │   │   └── NotificationContext.jsx # In-app toasts, browser notifications & chime
│   │   ├── pages/                # All 27 required views & dashboards
│   │   ├── services/
│   │   │   └── api.js            # Axios client with bearer token interceptor
│   │   ├── App.css
│   │   ├── App.jsx               # Protected route tree & navigation guard
│   │   ├── index.css             # Complete design system & custom CSS
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🏃 Installation & Running Instructions

### 1. Start MongoDB
Ensure MongoDB is running locally on port `27017` (e.g. `C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe --dbpath ...` or Windows Service).

### 2. Start Backend Server
```bash
cd medical-backend
npm install
npm run seed       # Populates demonstration admin, shops, medicines & customer accounts
npm start          # Runs backend on http://localhost:5000
```

### 3. Start Frontend Client
In a new terminal:
```bash
cd medical-frontend
npm install
npm run dev        # Runs Vite on http://localhost:5173
```

Open your browser at `http://localhost:5173` to experience the full application.

---

## 🧪 Testing Guide

1. **Medicine Search**: Type `Paracetamol 650 mg` in the search bar. Observe pharmacies sorted by nearest distance (e.g., Apollo at 0.5 km, MedPlus at 3.9 km, Netmeds at 6.8 km, Sun Pharma at 11.7 km).
2. **Interactive Map**: Click on any pharmacy marker to inspect stock count, prices, and address.
3. **Cart & Ordering**: Add a medicine, select quantity, review delivery address, and place an order using Cash on Delivery.
4. **Order Tracking**: Follow the live order timeline as the pharmacy accepts and progresses the order.
5. **Geofencing Proximity Radar**: Open `/geofence`, click "Walk Inside (250m away)" in the simulator, and observe the immediate proximity alert modal and notification chime.
6. **Health Profile**: Sign in as `rahul@meditrack.com` to review the 6-step medical routine, or register a new customer to step through the onboarding wizard.
7. **Shop Owner Dashboard**: Sign in as `apollo@meditrack.com` to manage stock, add new medicines, and accept incoming customer orders.
8. **Admin Control Panel**: Sign in as `admin@meditrack.com` to view network analytics, approve or freeze pharmacies, and audit orders.

---

## ⚖️ Medical Disclaimer
*MediTrack is designed as an assistive health management and neighborhood pharmacy discovery platform. It organizes user-provided medication schedules and does not independently prescribe medical treatments or dosages. Always seek the advice of licensed physicians or pharmacists.*
