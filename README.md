# Smart Appointment Scheduling System

A full-stack appointment scheduling application built with **Node.js**, **Express**, **MongoDB**, **React**, and **TypeScript**. This system provides secure user authentication, appointment booking with business constraints, and a clean, intuitive user interface.

## 🚀 Features

### Backend
- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Appointment Management**: System-generated appointment slots with availability tracking
- **Business Constraints**:
  - One appointment per user per calendar day
  - No overlapping appointments
  - No booking past dates/times
  - 24-hour cancellation window before appointment start time
  - Concurrency-safe booking using MongoDB transactions
- **Clean Architecture**: Separation of concerns with routes → controllers → services → models
- **Centralized Error Handling**: Consistent error responses across all endpoints
- **Request Validation**: Zod-based schema validation for all inputs
- **Proper Database Indexing**: Optimized queries with compound and single-field indexes

### Frontend
- **Modern React**: Built with React 18, TypeScript, and Vite
- **Authentication Flow**: Register, login, and protected routes
- **Appointment Views**:
  - Browse available appointment slots
  - Book appointments with real-time feedback
  - View personal appointments
  - Cancel appointments (with 24-hour restriction)
- **User Experience**: Loading states, error handling, and success messages
- **Responsive Design**: Clean, minimal UI that works on all devices

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher)
- **npm** or **yarn**

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
cd appointment-scheduling-system
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory (or copy from `.env.example`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/appointment-scheduling
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

### 4. Start MongoDB

Make sure MongoDB is running on your local machine:
```bash
# Windows (if installed as service)
net start MongoDB

# macOS/Linux
mongod
```

Or use MongoDB Atlas (cloud) by updating the `MONGODB_URI` in `.env`.

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
Frontend will run on `http://localhost:3000`

### 6. Run with Docker (Alternative)

If you have Docker and Docker Compose installed, you can start the entire system with a single command:

```bash
docker-compose up --build
```

-   **Frontend**: `http://localhost`
-   **Backend**: `http://localhost:5000`
-   **MongoDB**: `mongodb://localhost:27017`

### 7. Automated API Testing

The project includes a comprehensive API test script to verify all endpoints (Auth & Appointments).

```bash
cd server
npm run test
```

This script will:
- Verify Health Check
- Test User Registration & Login
- Verify Available Slots retrieval
- Test Booking, My Appointments, and Cancellation flows
- Automatically account for the 24-hour cancellation rule


### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Appointment Endpoints

#### Get Available Slots
```http
GET /api/appointments/available
```

#### Book Appointment
```http
POST /api/appointments/book
Authorization: Bearer <token>
Content-Type: application/json

{
  "appointmentId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

#### Get User Appointments
```http
GET /api/appointments/my-appointments
Authorization: Bearer <token>
```

#### Cancel Appointment
```http
DELETE /api/appointments/:id/cancel
Authorization: Bearer <token>
```

## 🏗️ Architecture

### Backend Structure
```
server/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Auth, validation, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript interfaces
│   ├── utils/           # Helper functions
│   ├── validators/      # Zod schemas
│   └── index.ts         # App entry point
├── package.json
└── tsconfig.json
```

### Frontend Structure
```
client/
├── src/
│   ├── api/             # API layer (Axios)
│   ├── components/      # Reusable components
│   ├── context/         # Auth context
│   ├── pages/           # Page components
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
└── vite.config.ts
```

## 🔑 Key Design Decisions

### 1. **Appointment Slot Generation**
- Slots are automatically generated for the next 30 days
- Operating hours: 9 AM - 5 PM
- Each slot duration: 1 hour
- **Performance Optimized**: Uses bulk generation and in-memory existence checks (O(1)) to ensure ultra-fast response times even when generating hundreds of slots.
- Slots are created on-demand when viewing available appointments

### 2. **Concurrency Control**
- MongoDB transactions ensure atomic booking operations
- Prevents race conditions when multiple users try to book the same slot
- Optimistic locking with `findOneAndUpdate` with status check

### 3. **24-Hour Cancellation Window**
- Users cannot cancel appointments less than 24 hours before start time
- Validation happens both on frontend (UI feedback) and backend (enforcement)

### 4. **One Appointment Per Day Rule**
- Enforced at the service layer during booking
- Prevents users from booking multiple slots on the same calendar day

### 5. **JWT Authentication**
- Tokens stored in localStorage
- Automatic token attachment via Axios interceptors
- Token expiration: 7 days (configurable)

## 📝 Assumptions

1. **Time Zone**: All times are handled in the server's local time zone
2. **Slot Duration**: Fixed at 1 hour per slot
3. **Operating Hours**: Fixed at 9 AM - 5 PM
4. **Cancellation Window**: Fixed at 24 hours
5. **Database**: MongoDB running locally or via Atlas
6. **No Email Notifications**: Email confirmations not implemented (future enhancement)
7. **No Admin Panel**: All slots are system-generated (no manual slot creation)

## 🧪 Testing the Application

### Manual Testing Flow

1. **Register a new user**
   - Navigate to `/register`
   - Fill in name, email, and password
   - Should redirect to appointments page

2. **View available slots**
   - Should see grid of available appointment slots
   - Only future slots should be visible

3. **Book an appointment**
   - Click "Book" on any available slot
   - Should see success message
   - Slot should disappear from available list

4. **View your appointments**
   - Navigate to "My Appointments"
   - Should see your booked appointment

5. **Try booking another on same day**
   - Go back to available slots
   - Try booking another slot on the same date
   - Should see error: "You already have an appointment on this date"

6. **Cancel appointment**
   - If appointment is >24 hours away, cancel button should be enabled
   - Click cancel and confirm
   - Appointment should be removed from your list

7. **Test concurrent booking** (requires two browser sessions)
   - Open two different browsers
   - Login as different users
   - Try booking the same slot simultaneously
   - Only one should succeed

## 🚧 Future Enhancements

- Pagination for appointment lists
- Filtering by date range
- Email notifications for bookings/cancellations
- Admin panel for manual slot management
- Appointment reminders
- Recurring appointments
- Unit and integration tests
- Docker containerization
- CI/CD pipeline

## 📄 License

This project is created as a technical assignment and is available for educational purposes.

## 👨‍💻 Author

Built with ❤️ as a Full-Stack Developer Assignment By Sushil Satyarthi
