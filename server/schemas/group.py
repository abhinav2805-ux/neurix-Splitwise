from pydantic import BaseModel
from typing import List, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from .user import UserResponse

class GroupBase(BaseModel):
    name: str

class GroupCreate(GroupBase):
    user_ids: List[int]

class GroupResponse(GroupBase):
    id: int
    users: List["UserResponse"]
    total_expenses: float = 0.0

    class Config:
        from_attributes = True

class GroupBalance(BaseModel):
    user_id: int
    user_name: str
    balance: float  # Positive means they are owed money, negative means they owe money

class GroupBalancesResponse(BaseModel):
    group_id: int
    group_name: str
    balances: List[GroupBalance]

class SettlementTransaction(BaseModel):
    from_user_id: int
    from_user_name: str
    to_user_id: int
    to_user_name: str
    amount: float

class GroupSettlementsResponse(BaseModel):
    group_id: int
    group_name: str
    settlements: List[SettlementTransaction]

# --- FIX: Import UserResponse at runtime before model_rebuild ---
from .user import UserResponse
GroupResponse.model_rebuild()
