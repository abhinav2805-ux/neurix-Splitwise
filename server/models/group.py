from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

group_users = Table(
    'group_users',
    Base.metadata,
    Column('group_id', ForeignKey('groups.id'), primary_key=True),
    Column('user_id', ForeignKey('users.id'), primary_key=True)
)

class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

    users = relationship("User", secondary=group_users, back_populates="groups")
    expenses = relationship("Expense", back_populates="group", cascade="all, delete-orphan")
