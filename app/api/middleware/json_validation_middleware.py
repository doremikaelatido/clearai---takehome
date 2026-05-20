import json

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class JsonValidationMiddleware(BaseHTTPMiddleware):
    ALLOWED_CONTENT_TYPES = {
        "application/json",
        "application/x-www-form-urlencoded",
    }

    async def dispatch(self, request: Request, call_next):
        if request.method in {"POST", "PUT", "PATCH"}:
            content_type = request.headers.get("content-type", "")

            if not any(
                allowed in content_type
                for allowed in self.ALLOWED_CONTENT_TYPES
            ):
                return JSONResponse(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    content={
                        "errors": [
                            "Content-Type must be application/json or application/x-www-form-urlencoded"
                        ]
                    },
                )

            # Only validate JSON payloads
            if "application/json" in content_type:
                body_bytes = await request.body()

                if body_bytes:
                    try:
                        json.loads(body_bytes)
                    except json.JSONDecodeError:
                        return JSONResponse(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            content={
                                "errors": [
                                    "Malformed JSON body"
                                ]
                            },
                        )

        return await call_next(request)