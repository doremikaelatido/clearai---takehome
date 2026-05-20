from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.api.dependencies.database import get_db
from app.core.security import decode_access_token
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"errors": ["Missing authorization token"]},
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"errors": [str(exc)]},
            headers={"WWW-Authenticate": "Bearer"},
        )

    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"errors": ["Token payload missing subject"]},
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = UserRepository.get_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"errors": ["User not found"]},
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user
