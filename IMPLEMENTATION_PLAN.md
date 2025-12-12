# Maritime Training Platform - Production Implementation Plan

## Project Scope Overview

This plan outlines the complete transformation from a mock-data prototype to a production-ready application with:
- React Router navigation
- FastAPI Python backend
- Supabase PostgreSQL database
- Master course catalog system
- Course-level approval workflow
- Commission management system

## Phase 1: Frontend Routing (IN PROGRESS)

### Completed:
- ✅ Installed React Router
- ✅ Created new routing structure in App.tsx
- ✅ Created ProtectedRoute component
- ✅ Created Layout component with Outlet

### Route Structure:
```
Public Routes (Seafarer/Student Module):
- / (Home)
- /courses (Course Catalog)
- /course/:courseId (Course Details)
- /sign-in
- /sign-up

Protected Student Routes:
- /student (Student Dashboard)
- /student/learn/:courseId

Protected Institute Routes (Hidden but accessible):
- /institutes (Institute Dashboard)
- /institutes/* (Future institute pages)

Protected Admin Routes (Hidden but accessible):
- /admin (Admin Dashboard)
- /admin/* (Future admin pages)
```

### Remaining Frontend Work:
- [ ] Update all page components to remove `onNavigate` props
- [ ] Replace with `useNavigate()` hook from react-router-dom
- [ ] Update Navbar to use `Link` and `useNavigate`
- [ ] Update all navigation calls throughout the application
- [ ] Add proper URL parameter handling

## Phase 2: Database Schema Design

### New Tables Required:

#### 1. `master_courses` Table
```sql
CREATE TABLE master_courses (
  master_course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name TEXT NOT NULL,
  course_code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- STCW, Technical, Refresher, etc.
  description TEXT,
  required_documents JSONB, -- List of required document types
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### 2. `institute_course_applications` Table
```sql
CREATE TABLE institute_course_applications (
  application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instid UUID REFERENCES institutes(instid),
  master_course_id UUID REFERENCES master_courses(master_course_id),
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  commission_percent DECIMAL(5,2), -- Set by admin during approval
  documents JSONB, -- Array of document URLs/metadata
  applied_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(userid)
);
```

#### 3. `course_documents` Table
```sql
CREATE TABLE course_documents (
  document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES institute_course_applications(application_id),
  document_type TEXT NOT NULL,
  document_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);
```

#### 4. `institute_commissions` Table
```sql
CREATE TABLE institute_commissions (
  commission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instid UUID REFERENCES institutes(instid),
  default_commission_percent DECIMAL(5,2) NOT NULL,
  set_by UUID REFERENCES users(userid),
  set_at TIMESTAMPTZ DEFAULT now()
);
```

#### 5. Update `courses` Table
```sql
ALTER TABLE courses
ADD COLUMN master_course_id UUID REFERENCES master_courses(master_course_id),
ADD COLUMN commission_percent DECIMAL(5,2),
ADD COLUMN application_id UUID REFERENCES institute_course_applications(application_id);
```

## Phase 3: FastAPI Backend Architecture

### Directory Structure:
```
api/
├── __init__.py
├── main.py                 # FastAPI app initialization
├── config.py               # Configuration and environment variables
├── database.py             # Supabase client setup
├── models/
│   ├── __init__.py
│   ├── user.py
│   ├── institute.py
│   ├── course.py
│   ├── master_course.py
│   └── commission.py
├── routes/
│   ├── __init__.py
│   ├── auth.py            # Authentication endpoints
│   ├── users.py           # User management
│   ├── institutes.py      # Institute operations
│   ├── courses.py         # Course operations
│   ├── master_courses.py  # Master course catalog
│   ├── applications.py    # Institute course applications
│   ├── bookings.py        # Student bookings
│   ├── certificates.py    # Certificate management
│   └── admin.py           # Admin operations
├── services/
│   ├── __init__.py
│   ├── auth_service.py
│   ├── institute_service.py
│   ├── course_service.py
│   └── commission_service.py
└── utils/
    ├── __init__.py
    ├── security.py        # JWT tokens, password hashing
    └── validators.py      # Input validation
```

### Core API Endpoints:

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### Master Courses
- `GET /api/master-courses` - List all master courses
- `GET /api/master-courses/{id}` - Get master course details
- `POST /api/master-courses` - Create master course (admin only)
- `PUT /api/master-courses/{id}` - Update master course (admin only)

#### Institute Applications
- `POST /api/institutes/register` - Register new institute
- `POST /api/institutes/apply-courses` - Apply for courses with documents
- `GET /api/institutes/{id}/applications` - Get institute's course applications
- `GET /api/admin/applications/pending` - Get pending applications (admin)
- `PUT /api/admin/applications/{id}/approve` - Approve application with commission
- `PUT /api/admin/applications/{id}/reject` - Reject application

#### Courses
- `GET /api/courses` - List all approved courses
- `GET /api/courses/{id}` - Get course details
- `POST /api/institutes/courses` - Publish a course (institute)
- `PUT /api/institutes/courses/{id}` - Update course
- `DELETE /api/institutes/courses/{id}` - Delete course

#### Bookings
- `POST /api/bookings` - Create booking (student)
- `GET /api/bookings/student/{id}` - Get student bookings
- `GET /api/bookings/institute/{id}` - Get institute bookings
- `PUT /api/bookings/{id}/status` - Update booking status

#### Commission Management
- `PUT /api/admin/institutes/{id}/commission` - Set default commission
- `PUT /api/admin/applications/{id}/commission` - Override course commission
- `GET /api/admin/commissions/report` - Commission analytics

## Phase 4: Implementation Steps

### Step 1: Complete Routing Migration (1-2 days)
1. Update all page components to use React Router hooks
2. Replace all `onNavigate` calls with `useNavigate()`
3. Update Navbar to use `Link` components
4. Test all navigation flows

### Step 2: Database Migration (1 day)
1. Create Supabase migration files for new schema
2. Add master courses seed data
3. Update RLS policies for new tables
4. Test database operations

### Step 3: FastAPI Backend Setup (2-3 days)
1. Initialize FastAPI project structure
2. Set up Supabase Python client
3. Implement authentication with JWT
4. Create base models and schemas
5. Set up CORS for frontend communication

### Step 4: Core API Development (5-7 days)
1. Implement authentication endpoints
2. Implement master course endpoints
3. Implement institute registration with course selection
4. Implement course application workflow
5. Implement admin approval with commission
6. Implement booking and payment APIs
7. Implement certificate management APIs

### Step 5: Frontend-Backend Integration (3-4 days)
1. Replace mock API with real Supabase calls
2. Update forms for document uploads
3. Implement master course selection UI
4. Implement course-level approval UI
5. Implement commission display in institute dashboard
6. Add loading states and error handling

### Step 6: Testing & Deployment (2-3 days)
1. Test all user workflows
2. Test API endpoints
3. Set up production environment variables
4. Deploy FastAPI backend
5. Deploy frontend
6. Configure domain and SSL

## Phase 5: Key Features Implementation

### Feature 1: Master Course Selection
**Institute Registration Flow:**
1. Institute fills basic information
2. Selects courses from master catalog (multi-select)
3. For each selected course, uploads required documents
4. Submits application for admin review

**UI Components Needed:**
- Master course catalog with search/filter
- Course selection checkboxes
- Document upload per course
- Application review status page

### Feature 2: Course-Level Approval
**Admin Approval Flow:**
1. Admin views pending applications
2. Reviews institute documents
3. Reviews documents for each applied course
4. Approves/rejects individual courses
5. Sets default commission for institute
6. Can override commission per course

**UI Components Needed:**
- Application review dashboard
- Document viewer
- Course approval checklist
- Commission input fields
- Bulk approval actions

### Feature 3: Commission System
**Commission Workflow:**
1. Admin sets default commission % for institute (e.g., 20%)
2. All approved courses inherit this commission
3. Admin can override for specific courses (e.g., 15% for one course)
4. When institute publishes course, see: "Platform commission: 20%"
5. Commission automatically calculated on each booking

**UI Components Needed:**
- Commission settings in admin panel
- Commission override modal
- Commission display in course publishing
- Commission reports and analytics

## Technology Stack

### Frontend:
- React 19 with TypeScript
- React Router for navigation
- Supabase JS Client
- TanStack Query for API state management
- Shadcn UI components
- Tailwind CSS

### Backend:
- FastAPI (Python 3.11+)
- Supabase Python Client
- Pydantic for validation
- JWT for authentication
- Uvicorn as ASGI server

### Database:
- Supabase PostgreSQL
- Row Level Security (RLS)
- Realtime subscriptions
- Storage for documents

### Deployment:
- Frontend: Netlify/Vercel
- Backend: Railway/Render/Fly.io
- Database: Supabase Cloud

## Environment Variables

### Frontend (.env):
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=your_fastapi_url
```

### Backend (.env):
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET_KEY=your_secret_key
CORS_ORIGINS=your_frontend_url
```

## Estimated Timeline

- **Phase 1:** 1-2 days (Routing)
- **Phase 2:** 1 day (Database)
- **Phase 3:** 2-3 days (Backend Setup)
- **Phase 4:** 5-7 days (API Development)
- **Phase 5:** 3-4 days (Frontend Integration)
- **Phase 6:** 2-3 days (Testing & Deployment)

**Total: 14-19 days** (2.5-4 weeks) of focused development time

## Next Immediate Steps

1. ✅ Complete routing setup (started)
2. Create database migrations for new schema
3. Set up FastAPI project structure
4. Implement authentication APIs
5. Build master course catalog UI
6. Implement document upload functionality

---

This is a comprehensive production-ready implementation. Each phase builds on the previous one and can be developed incrementally.
