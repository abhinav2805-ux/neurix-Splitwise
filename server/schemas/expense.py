from pydantic import BaseModel
from typing import List, Dict, Optional
from enum import Enum
from datetime import datetime

class SplitType(str, Enum):
    EQUAL = "equal"
    PERCENTAGE = "percentage"

class SplitBase(BaseModel):
    user_id: int
    amount: float
    percentage: Optional[float] = None

class ExpenseBase(BaseModel):
    description: str
    amount: float
    paid_by: int
    split_type: SplitType

class ExpenseCreate(ExpenseBase):
    splits: Optional[List[SplitBase]] = None

class ExpenseResponse(ExpenseBase):
    id: int
    group_id: int
    splits: List[SplitBase]
    payer_name: str

    class Config:
        from_attributes = True

class UserBalance(BaseModel):
    group_id: int
    group_name: str
    balance: float  # Positive means they are owed money, negative means they owe money

class UserBalancesResponse(BaseModel):
    user_id: int
    user_name: str
    balances: List[UserBalance] 