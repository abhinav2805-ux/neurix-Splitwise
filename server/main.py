from fastapi import FastAPI
from database import Base, engine
from routers.user import router as user_router
from routers.group import router as group_router

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# Register routers
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(group_router, prefix="/groups", tags=["Groups"])

@app.get("/")
def root():
    return {"message": "FastAPI backend is live!"}
