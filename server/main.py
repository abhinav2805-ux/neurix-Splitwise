from fastapi import FastAPI
from database import Base, engine
from routers.user import router as user_router
from routers.group import router as group_router
from routers.chatbot import router as chatbot_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# add the CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Register routers
app.include_router(user_router, prefix="/users", tags=["Users"])
app.include_router(group_router, prefix="/groups", tags=["Groups"])
app.include_router(chatbot_router, tags=["Chatbot"])

@app.get("/")
def root():
    return {"message": "FastAPI backend is live!"}
