from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import enum

class SplitType(enum.Enum):
    EQUAL = "equal"
    PERCENTAGE = "percentage"

class Expense(Base):
    __tablename__ = "expenses"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    paid_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=False)
    split_type = Column(String, nullable=False)
    
    # Relationships
    payer = relationship("User", foreign_keys=[paid_by])
    group = relationship("Group", back_populates="expenses")
    splits = relationship("Split", back_populates="expense", cascade="all, delete-orphan")
