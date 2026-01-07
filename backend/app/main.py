from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import settings and database initialization
from app.config import settings
from app.database.database import init_db, SessionLocal

# Import models
from app.models.user import User
from app.models.loan import LoanApplication
from app.models.grievance import Grievance
from app.models.transaction import Transaction

# Import utility functions
from app.utils.security import hash_password

# Import routes
from app.routes import auth, admin, user, loan, grievance, bank_statement

# Initialize FastAPI application
app = FastAPI(
    title="RISKON + VisualPe API",
    description="AI-Powered Smart Lending Platform",
    version="2.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Ensure frontend URL matches
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add routes
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(user.router)  # Fixed spacing issue
app.include_router(loan.router)
app.include_router(grievance.router)
app.include_router(bank_statement.router)  # Fixed spacing issue

@app.on_event("startup")
def startup():
    print("\n" + "=" * 50)
    print("Starting RISKON + VisualPe API...")
    print("=" * 50)
    
    # Initialize database connections
    init_db()

    # Database session
    db = SessionLocal()
    try:
        # Create admin user if not present
        admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
        if not admin:
            admin = User(
                email=settings.ADMIN_EMAIL,
                password_hash=hash_password(settings.ADMIN_PASSWORD),  # Hash admin password
                full_name="System Admin",
                phone="0000000000",
                role="admin",
                is_verified=True,
                is_active=True,
                customer_score=900
            )
            db.add(admin)
            db.commit()  # Commit changes
            print("Admin created: " + settings.ADMIN_EMAIL)
        
        # Create demo user if not present
        demo_user = db.query(User).filter(User.email == "user@test.com").first()
        if not demo_user:
            demo_user = User(
                email="user@test.com",
                password_hash=hash_password("user123"),  # Hash demo user password
                full_name="Demo User",
                phone="9876543210",
                occupation="Software Engineer",
                employer_name="Tech Corp",
                employment_years=4,
                annual_income=800000,
                monthly_expenses=35000,
                account_balance=250000,
                mutual_funds=150000,
                stocks=50000,
                fixed_deposits=200000,
                existing_loans=1,
                existing_loan_amount=100000,
                role="user",
                is_verified=True,
                is_active=True,
                customer_score=720
            )
            db.add(demo_user)
            db.commit()  # Commit changes
            print("Demo user created: user@test.com")
    finally:
        db.close()  # Ensure database session is closed
    
    print("\nAPI Ready!")
    print("Docs: http://localhost:8000/docs")
    print("=" * 50 + "\n")

# Root endpoint
@app.get("/")
def root():
    return {"app": "RISKON + VisualPe", "version": "2.0.0", "status": "running"}

# Health check endpoint
@app.get("/health")
def health():
    return {"status": "healthy"}