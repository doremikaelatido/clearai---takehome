import json

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


class EdiValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "POST" and request.url.path in {"/api/edi/edi-to-json", "/api/edi/validate-edi"}:
            body_bytes = await request.body()
            if not body_bytes:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={
                        "errors": [
                            "Request body cannot be empty"
                        ]
                    },
                )

            try:
                payload = json.loads(body_bytes)
            except json.JSONDecodeError:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={
                        "errors": [
                            "Malformed JSON body"
                        ]
                    },
                )

            edi_text = payload.get("edi")
            if not isinstance(edi_text, str) or not edi_text.strip():
                return JSONResponse(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    content={
                        "errors": [
                            "EDI payload must include a non-empty 'edi' field"
                        ]
                    },
                )

            if "LIN+" not in edi_text or "PAC" not in edi_text:
                return JSONResponse(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    content={
                        "errors": [
                            "EDI payload does not resemble a valid EDI document"
                        ]
                    },
                )

        return await call_next(request)