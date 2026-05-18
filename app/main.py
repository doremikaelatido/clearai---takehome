from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.middleware.auth_middleware import AuthMiddleware
from app.api.middleware.edi_validation_middleware import EdiValidationMiddleware
from app.api.middleware.json_validation_middleware import JsonValidationMiddleware
from app.api.routes.auth import router as auth_router
from app.api.routes.edi import router as edi_router
from app.core.database import init_db
from app.core.config import settings


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ClearAI EDI processing backend service",
    version="1.0.0",
)

app.add_middleware(AuthMiddleware)
app.add_middleware(JsonValidationMiddleware)
app.add_middleware(EdiValidationMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(edi_router)


@app.on_event("startup")
def startup_event() -> None:
    init_db()


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )
