from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Group, User, Expense, Split
from schemas.group import GroupCreate, GroupResponse, GroupBalance, GroupBalancesResponse
from schemas.expense import ExpenseCreate, ExpenseResponse, SplitBase, SplitType

router = APIRouter()

@router.post("/", response_model=GroupResponse)
def create_group(group: GroupCreate, db: Session = Depends(get_db)):
    users = db.query(User).filter(User.id.in_(group.user_ids)).all()
    if len(users) != len(group.user_ids):
        raise HTTPException(status_code=400, detail="Some users not found")
    
    db_group = Group(name=group.name)
    db_group.users = users
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

@router.get("/{group_id}", response_model=GroupResponse)
def get_group(group_id: int, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    total_expenses = sum(expense.amount for expense in group.expenses)
    return GroupResponse(
        id=group.id, name=group.name, users=group.users, total_expenses=total_expenses
    )

@router.post("/{group_id}/expenses", response_model=ExpenseResponse)
def add_expense(group_id: int, expense: ExpenseCreate, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if expense.paid_by not in [user.id for user in group.users]:
        raise HTTPException(status_code=400, detail="Payer is not in the group")
    
    # Handle equal splits
    if expense.split_type.value == "equal":
        group_member_ids = [user.id for user in group.users]
        split_amount = expense.amount / len(group_member_ids)
        splits = []
        for user_id in group_member_ids:
            split = Split(
                user_id=user_id,
                amount=split_amount if user_id != expense.paid_by else 0,
                percentage=100.0 / len(group_member_ids)
            )
            splits.append(split)
    else:
        # Handle percentage splits
        if not expense.splits:
            raise HTTPException(status_code=400, detail="Splits are required for percentage-based expenses")
        
        total_percentage = sum(split.percentage for split in expense.splits if split.percentage)
        if abs(total_percentage - 100.0) > 0.01:
            raise HTTPException(status_code=400, detail="Percentages must sum to 100")
        
        splits = []
        for split_data in expense.splits:
            split = Split(
                user_id=split_data.user_id,
                amount=split_data.amount,
                percentage=split_data.percentage
            )
            splits.append(split)
    
    db_expense = Expense(
        description=expense.description,
        amount=expense.amount,
        paid_by=expense.paid_by,
        group_id=group_id,
        split_type=expense.split_type.value
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    
    for split in splits:
        split.expense_id = db_expense.id
        db.add(split)
    
    db.commit()
    db.refresh(db_expense)
    
    payer = db.query(User).filter(User.id == expense.paid_by).first()
    
    return ExpenseResponse(
        id=db_expense.id,
        description=db_expense.description,
        amount=db_expense.amount,
        paid_by=db_expense.paid_by,
        group_id=db_expense.group_id,
        split_type=db_expense.split_type,
        splits=[SplitBase(
            user_id=s.user_id, amount=s.amount, percentage=s.percentage
        ) for s in db_expense.splits],
        payer_name=payer.name
    )

@router.get("/{group_id}/balances", response_model=GroupBalancesResponse)
def get_group_balances(group_id: int, db: Session = Depends(get_db)):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    balances = []
    for user in group.users:
        paid_amount = sum(expense.amount for expense in group.expenses if expense.paid_by == user.id)
        owed_amount = sum(split.amount for expense in group.expenses for split in expense.splits if split.user_id == user.id)
        balance = paid_amount - owed_amount
        
        balances.append(GroupBalance(
            user_id=user.id, user_name=user.name, balance=balance
        ))
    
    return GroupBalancesResponse(
        group_id=group.id, group_name=group.name, balances=balances
    )
