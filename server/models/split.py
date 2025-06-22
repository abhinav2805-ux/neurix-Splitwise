from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Split(Base):
    __tablename__ = "splits"
    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)  # Amount this user owes for this expense
    percentage = Column(Float, nullable=True)  # Percentage split (for percentage-based splits)
    
    # Relationships
    expense = relationship("Expense", back_populates="splits")
    user = relationship("User")
