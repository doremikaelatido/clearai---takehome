from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.database import get_db
from app.schemas.auth import Token, UserCreate
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=Token)
def register_user(data: UserCreate, db: Session = Depends(get_db)):
    try:
        user = AuthService.register(db, email=data.email, password=data.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    access_token = AuthService.create_token(user)
    return Token(access_token=access_token)


@router.post("/login", response_model=Token)
def login_user(data: UserCreate, db: Session = Depends(get_db)):
    user = AuthService.authenticate(db, email=data.email, password=data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = AuthService.create_token(user)
    return Token(access_token=access_token)
