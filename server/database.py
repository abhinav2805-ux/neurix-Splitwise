from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Try to load .env file, but don't fail if it's corrupted
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    # If .env loading fails, continue without it
    pass

# Use environment variable or fallback to Neon database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://splitwise_owner:npg_Ekmb0wlFN3su@ep-icy-haze-a9jyz91a-pooler.gwc.azure.neon.tech/splitwise?sslmode=require")

if DATABASE_URL.startswith("sqlite"):
    # SQLite configuration
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL configuration (for Neon)
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
