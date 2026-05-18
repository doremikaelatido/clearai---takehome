import json

from fastapi import HTTPException, Request, status
from starlette.middleware.base import BaseHTTPMiddleware


class EdiValidationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "POST" and request.url.path in {"/edi/edi-to-json", "/edi/validate-edi"}:
            body_bytes = await request.body()
            if not body_bytes:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Request body cannot be empty",
                )

            try:
                payload = json.loads(body_bytes)
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Malformed JSON body",
                )

            edi_text = payload.get("edi")
            if not isinstance(edi_text, str) or not edi_text.strip():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="EDI payload must include a non-empty 'edi' field",
                )

            if "LIN+" not in edi_text or "PAC" not in edi_text:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="EDI payload does not resemble a valid EDI document",
                )

        return await call_next(request)
