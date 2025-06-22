from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import ChatbotRequest, ChatbotResponse
import os
from dotenv import load_dotenv
from groq import Groq
from models import User, Expense, Group, Split
import re

load_dotenv()

router = APIRouter()

SYSTEM_PROMPT = (
    "You are a helpful assistant for a Splitwise-like app. "
    "Answer ONLY using the data provided below. "
    "If the answer is not in the data, reply: 'Not found in database.'\n"
    "Format your answers as clear, direct, plain text sentences. "
    "Do NOT use Markdown, bold, bullet points, or any special formatting symbols. "
    "Just give the answer in a friendly, readable way."
)

@router.post("/chatbot", response_model=ChatbotResponse)
def chatbot_endpoint(request: ChatbotRequest, db: Session = Depends(get_db)):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set in environment.")
    try:
        # Query all users and groups
        users = db.query(User).all()
        groups = db.query(Group).all()
        user_names = {user.name.lower(): user for user in users}
        group_names = {group.name.lower(): group for group in groups}
        # Extract possible user/group names from the question
        question = request.query.lower()
        matched_users = [user for name, user in user_names.items() if name in question]
        matched_groups = [group for name, group in group_names.items() if name in question]
        context_lines = []
        # If a group is mentioned, filter to that group, its users, and its expenses
        if matched_groups:
            context_lines.append("Users:")
            group_users = set()
            for group in matched_groups:
                for user in group.users:
                    group_users.add(user)
            for user in group_users:
                context_lines.append(f"- id: {user.id}, name: {user.name}")
            context_lines.append("\nGroups:")
            for group in matched_groups:
                group_user_names = ', '.join([u.name for u in group.users])
                context_lines.append(f"- id: {group.id}, name: {group.name}, users: [{group_user_names}]")
            context_lines.append("\nExpenses:")
            for group in matched_groups:
                for expense in group.expenses:
                    payer = db.query(User).filter(User.id == expense.paid_by).first()
                    splits = db.query(Split).filter(Split.expense_id == expense.id).all()
                    split_str = ', '.join([
                        f"{{user: {db.query(User).filter(User.id == s.user_id).first().name}, amount: {s.amount}, percentage: {s.percentage}}}"
                        for s in splits
                    ])
                    context_lines.append(
                        f"- id: {expense.id}, desc: {expense.description}, amount: {expense.amount}, "
                        f"paid_by: {payer.name if payer else expense.paid_by}, group: {group.name}, "
                        f"split_type: {expense.split_type}, splits: [{split_str}]"
                    )
        # If a user is mentioned, filter to that user and their expenses/groups
        elif matched_users:
            context_lines.append("Users:")
            for user in matched_users:
                context_lines.append(f"- id: {user.id}, name: {user.name}")
            context_lines.append("\nGroups:")
            user_groups = set()
            for user in matched_users:
                for group in user.groups:
                    user_groups.add(group)
            for group in user_groups:
                group_user_names = ', '.join([u.name for u in group.users])
                context_lines.append(f"- id: {group.id}, name: {group.name}, users: [{group_user_names}]")
            context_lines.append("\nExpenses:")
            for user in matched_users:
                for expense in user.expenses_paid:
                    payer = db.query(User).filter(User.id == expense.paid_by).first()
                    group = db.query(Group).filter(Group.id == expense.group_id).first()
                    splits = db.query(Split).filter(Split.expense_id == expense.id).all()
                    split_str = ', '.join([
                        f"{{user: {db.query(User).filter(User.id == s.user_id).first().name}, amount: {s.amount}, percentage: {s.percentage}}}"
                        for s in splits
                    ])
                    context_lines.append(
                        f"- id: {expense.id}, desc: {expense.description}, amount: {expense.amount}, "
                        f"paid_by: {payer.name if payer else expense.paid_by}, group: {group.name if group else expense.group_id}, "
                        f"split_type: {expense.split_type}, splits: [{split_str}]"
                    )
        # Fallback: send all data (as before)
        else:
            context_lines.append("Users:")
            for user in users:
                context_lines.append(f"- id: {user.id}, name: {user.name}")
            context_lines.append("\nGroups:")
            for group in groups:
                group_user_names = ', '.join([u.name for u in group.users])
                context_lines.append(f"- id: {group.id}, name: {group.name}, users: [{group_user_names}]")
            context_lines.append("\nExpenses:")
            expenses = db.query(Expense).all()
            for expense in expenses:
                payer = db.query(User).filter(User.id == expense.paid_by).first()
                group = db.query(Group).filter(Group.id == expense.group_id).first()
                splits = db.query(Split).filter(Split.expense_id == expense.id).all()
                split_str = ', '.join([
                    f"{{user: {db.query(User).filter(User.id == s.user_id).first().name}, amount: {s.amount}, percentage: {s.percentage}}}"
                    for s in splits
                ])
                context_lines.append(
                    f"- id: {expense.id}, desc: {expense.description}, amount: {expense.amount}, "
                    f"paid_by: {payer.name if payer else expense.paid_by}, group: {group.name if group else expense.group_id}, "
                    f"split_type: {expense.split_type}, splits: [{split_str}]"
                )
        context = '\n'.join(context_lines)
        # Compose LLM messages
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT + "\n" + context},
            {"role": "user", "content": request.query}
        ]
        client = Groq(api_key=api_key)
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=messages,
            max_tokens=256,
            temperature=0.2,
        )
        answer = response.choices[0].message.content.strip()
        return ChatbotResponse(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq LLM error: {str(e)}") 