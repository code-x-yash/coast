# Maritime Training Platform API

Complete REST API backend for the Maritime Training Course Aggregator Platform built with FastAPI.

## Features

- JWT-based authentication
- Role-based access control (Student, Institute, Admin)
- Complete CRUD operations for all entities
- Supabase integration
- Automatic API documentation

## Setup

### 1. Install Dependencies

```bash
cd api
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- Get Supabase URL and keys from your Supabase project dashboard
- Generate JWT secret: `openssl rand -hex 32`

### 3. Run Development Server

```bash
uvicorn main:app --reload
```

Or use the Python script directly:

```bash
python main.py
```

API will be available at: `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Structure

```
api/
├── main.py                 # FastAPI app initialization with all routers
├── config.py               # Configuration and environment variables
├── database.py             # Supabase client setup
├── auth.py                 # Authentication utilities and dependencies
├── schemas.py              # Pydantic models for request/response
├── requirements.txt        # Python dependencies
│
└── routes/                 # API endpoints
    ├── auth_routes.py      # Authentication endpoints
    ├── student_routes.py   # Student profile management
    ├── institute_routes.py # Institute operations
    ├── course_routes.py    # Course management
    ├── batch_routes.py     # Batch scheduling
    ├── booking_routes.py   # Course bookings
    ├── certificate_routes.py # Certificate management
    └── admin_routes.py     # Admin operations
```

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/signup/student` - Register new student
- `POST /auth/signup/institute` - Register new institute
- `POST /auth/login` - Login user

### Students (`/students`)
- `GET /students/me` - Get current student profile
- `PUT /students/me` - Update student profile
- `GET /students/{id}` - Get student by ID

### Institutes (`/institutes`)
- `GET /institutes/me` - Get current institute profile
- `GET /institutes/{id}` - Get institute by ID
- `POST /institutes/reactivation-request` - Submit reactivation request
- `GET /institutes/reactivation-requests/me` - Get my reactivation requests

### Courses (`/courses`)
- `GET /courses` - List all active courses (supports filters: type, mode, search)
- `GET /courses/{id}` - Get course details
- `POST /courses` - Create new course (Institute only)
- `GET /courses/institute/my-courses` - Get institute's courses
- `PUT /courses/{id}/status` - Update course status
- `GET /courses/master-courses` - Get master course catalog

### Batches (`/batches`)
- `GET /batches` - List batches (filters: course_id, status)
- `GET /batches/{id}` - Get batch details
- `POST /batches` - Create new batch (Institute only)
- `GET /batches/institute/my-batches` - Get institute's batches
- `PUT /batches/{id}/status` - Update batch status

### Bookings (`/bookings`)
- `POST /bookings` - Create new booking (Student only)
- `GET /bookings/my-bookings` - Get student's bookings
- `GET /bookings/{id}` - Get booking details
- `PUT /bookings/{id}/payment-status` - Update payment status
- `GET /bookings/batch/{id}/bookings` - Get all bookings for a batch

### Certificates (`/certificates`)
- `POST /certificates` - Issue certificate (Institute only)
- `GET /certificates/my-certificates` - Get student's certificates (Student)
- `GET /certificates/institute/my-certificates` - Get institute's certificates (Institute)
- `GET /certificates/{id}` - Get certificate details
- `PUT /certificates/{id}/dgshipping-upload` - Mark as uploaded to DGShipping

### Admin (`/admin`)
- `GET /admin/institutes` - List all institutes (filter by verified_status)
- `PUT /admin/institutes/{id}/verify` - Verify/reject institute
- `GET /admin/reactivation-requests` - List reactivation requests (filter by status)
- `PUT /admin/reactivation-requests/{id}` - Approve/reject reactivation request
- `GET /admin/bookings` - List all bookings (filter by payment_status)
- `GET /admin/stats` - Get platform statistics
- `GET /admin/institute-course-applications` - List course applications (filter by status)
- `PUT /admin/institute-course-applications/{id}` - Update application status

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## User Roles

- **Student**: Can browse courses, book batches, view certificates
- **Institute**: Can create courses/batches, manage enrollments, issue certificates
- **Admin**: Full platform management access

## Testing

```bash
pytest
```

## Deployment

### Railway
```bash
railway init
railway up
```

### Render
```bash
# Create web service
# Connect GitHub repo
# Set environment variables
```

### Fly.io
```bash
flyctl launch
flyctl deploy
```

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
