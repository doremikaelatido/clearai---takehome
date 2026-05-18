import json

from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware


class JsonValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in {"POST", "PUT", "PATCH"}:
            content_type = request.headers.get("content-type", "")
            if "application/json" not in content_type:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail="Content-Type must be application/json",
                )
            body_bytes = await request.body()
            if body_bytes:
                try:
                    json.loads(body_bytes)
                except json.JSONDecodeError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Malformed JSON body",
                    )

        return await call_next(request)
