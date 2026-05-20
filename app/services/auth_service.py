from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository


class AuthService:
    @staticmethod
    def _truncate_password(password: str, max_bytes: int = 72) -> str:
        """Truncate password to max_bytes to comply with bcrypt limitation."""
        return password.encode('utf-8')[:max_bytes].decode('utf-8', errors='ignore')

    @staticmethod
    def register(db: Session, email: str, password: str) -> User:
        existing = UserRepository.get_by_email(db, email)
        if existing:
            raise HTTPException(status_code=400, detail={"errors": ["A user with that email already exists"]})

        truncated_password = AuthService._truncate_password(password)
        hashed_password = hash_password(truncated_password)
        return UserRepository.create(db, email=email, hashed_password=hashed_password)

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> User | None:
        user = UserRepository.get_by_email(db, email)
        if not user:
            return None
        
        truncated_password = AuthService._truncate_password(password)
        if not verify_password(truncated_password, user.hashed_password):
            return None
        return user

    @staticmethod
    def create_token(user: User) -> str:
        return create_access_token(subject=user.email)
