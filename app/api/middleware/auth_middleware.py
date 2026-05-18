import re

from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.security import decode_access_token

EXEMPT_PATHS = ["api/auth/login", "api/auth/register", "/openapi.json", "api/docs", "/redoc"]
AUTH_HEADER_PATTERN = re.compile(r"^Bearer\s+(.+)$", re.IGNORECASE)


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path in EXEMPT_PATHS or request.url.path.startswith("/docs"):
            return await call_next(request)

        if request.url.path.startswith("/api/edi"):
            authorization = request.headers.get("Authorization", "")
            match = AUTH_HEADER_PATTERN.match(authorization)
            if not match:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authorization header missing or malformed",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            token = match.group(1)
            try:
                decode_access_token(token)
            except ValueError as exc:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=str(exc),
                    headers={"WWW-Authenticate": "Bearer"},
                )

        return await call_next(request)
