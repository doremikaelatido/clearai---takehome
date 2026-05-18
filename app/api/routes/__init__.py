from app.api.routes.auth import router as auth_router
from app.api.routes.edi import router as edi_router

__all__ = ["auth_router", "edi_router"]
