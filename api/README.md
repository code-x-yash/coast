# Maritime Training Platform API

FastAPI backend for the Maritime Training Course Aggregator Platform.

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

API will be available at: `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Structure

```
api/
├── main.py                 # FastAPI app initialization
├── config.py               # Configuration and environment variables
├── requirements.txt        # Python dependencies
│
├── models/                 # Pydantic models for request/response
│   ├── __init__.py
│   ├── user.py
│   ├── institute.py
│   ├── course.py
│   ├── master_course.py
│   └── commission.py
│
├── routes/                 # API endpoints
│   ├── __init__.py
│   ├── auth.py            # Authentication endpoints
│   ├── users.py           # User management
│   ├── institutes.py      # Institute operations
│   ├── courses.py         # Course operations
│   ├── master_courses.py  # Master course catalog
│   ├── applications.py    # Institute course applications
│   └── admin.py           # Admin operations
│
├── services/              # Business logic
│   ├── __init__.py
│   ├── auth_service.py
│   ├── institute_service.py
│   └── course_service.py
│
└── utils/                 # Utility functions
    ├── __init__.py
    ├── security.py        # JWT, password hashing
    └── validators.py      # Input validation
```

## Next Steps

### 1. Implement Core Endpoints

Create route files in `routes/` directory:

**auth.py** - Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

**master_courses.py** - Master Course Catalog
- `GET /api/master-courses` - List all courses
- `GET /api/master-courses/{id}` - Get course details

**institutes.py** - Institute Management
- `POST /api/institutes/register` - Register institute
- `POST /api/institutes/apply-courses` - Apply for courses
- `GET /api/institutes/{id}/applications` - Get applications

**admin.py** - Admin Operations
- `GET /api/admin/applications/pending` - Pending applications
- `PUT /api/admin/applications/{id}/approve` - Approve with commission
- `PUT /api/admin/institutes/{id}/commission` - Set default commission

### 2. Implement Authentication

Create `utils/security.py` with JWT token management:

```python
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    # Implementation here
    pass
```

### 3. Implement Supabase Client

Create `database.py`:

```python
from supabase import create_client, Client
from config import settings

supabase: Client = create_client(
    settings.supabase_url,
    settings.supabase_service_key
)

def get_supabase() -> Client:
    return supabase
```

### 4. Create Pydantic Models

Define request/response models in `models/` directory.

### 5. Add Business Logic

Implement services in `services/` directory for complex operations.

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
