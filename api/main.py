from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routes import (
    auth_routes,
    institute_routes,
    course_routes,
    batch_routes,
    booking_routes,
    certificate_routes,
    admin_routes,
    student_routes
)

app = FastAPI(
    title="Maritime Training Platform API",
    description="REST API for the Maritime Training Course Aggregator Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(institute_routes.router)
app.include_router(course_routes.router)
app.include_router(batch_routes.router)
app.include_router(booking_routes.router)
app.include_router(certificate_routes.router)
app.include_router(admin_routes.router)
app.include_router(student_routes.router)

@app.get("/")
async def root():
    return {
        "message": "Maritime Training Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/auth",
            "institutes": "/institutes",
            "courses": "/courses",
            "batches": "/batches",
            "bookings": "/bookings",
            "certificates": "/certificates",
            "admin": "/admin",
            "students": "/students"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.environment
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
