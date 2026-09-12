import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import health, listings


def create_application() -> FastAPI:
    """Initialize and configure the FastAPI application."""
    application = FastAPI(
        title=settings.PROJECT_NAME,
        description="CarbonLoop - B2B Carbon Capture-to-Product Matchmaking Platform API",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Configure CORS middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register API routers
    application.include_router(health.router, prefix="/api", tags=["Health"])
    application.include_router(listings.router, prefix="/api", tags=["CO2 Listings"])

    @application.get("/", tags=["Root"])
    def root():
        return {
            "message": "Welcome to CarbonLoop API",
            "docs": "/docs",
            "health": "/api/health",
        }

    return application


app = create_application()

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=(settings.ENVIRONMENT == "development"),
    )
