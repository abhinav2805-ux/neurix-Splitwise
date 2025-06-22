from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

    groups = relationship("Group", secondary="group_users", back_populates="users")
    expenses_paid = relationship("Expense", foreign_keys="Expense.paid_by", back_populates="payer")
    splits = relationship("Split", back_populates="user")
