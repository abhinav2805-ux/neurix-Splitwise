from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Group, Expense, Split
from schemas.user import UserCreate, UserResponse
from schemas.expense import UserBalance, UserBalancesResponse

router = APIRouter()

@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = User(name=user.name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@router.get("/{user_id}/balances", response_model=UserBalancesResponse)
def get_user_balances(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    balances = []
    for group in user.groups:
        # Calculate balance for this user in this group
        paid_amount = sum(expense.amount for expense in group.expenses if expense.paid_by == user_id)
        owed_amount = sum(split.amount for expense in group.expenses for split in expense.splits if split.user_id == user_id)
        balance = paid_amount - owed_amount
        
        balances.append(UserBalance(
            group_id=group.id,
            group_name=group.name,
            balance=balance
        ))
    
    return UserBalancesResponse(
        user_id=user.id,
        user_name=user.name,
        balances=balances
    )
