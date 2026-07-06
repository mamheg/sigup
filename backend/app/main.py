"""SiGup API: FastAPI app with CORS, rate limiting, static files, and routers."""
import os
import time
from typing import Callable

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.config import BASE_DIR, settings
from app.database import get_db
from app.routers import admin as admin_router
from app.routers import auth as auth_router
from app.routers import cabinet as cabinet_router
from app.routers import catalog as catalog_router
from app.routers import uploads as uploads_router

app = FastAPI(title="SiGup API", debug=settings.DEBUG)

# ─── CORS ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Simple in-memory rate limiter (brunch pattern; properly returns a 429 response) ───
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 120

_rate_limit_store: dict[str, list[float]] = {}


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next: Callable):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()

    timestamps = [
        t for t in _rate_limit_store.get(client_ip, []) if now - t < RATE_LIMIT_WINDOW_SECONDS
    ]
    timestamps.append(now)
    _rate_limit_store[client_ip] = timestamps

    if len(timestamps) > RATE_LIMIT_MAX_REQUESTS:
        return JSONResponse(
            status_code=429,
            content={"detail": "Слишком много запросов. Попробуйте позже."},
        )

    return await call_next(request)


# ─── Static files (uploads) ───
STATIC_DIR = os.path.join(BASE_DIR, "static")
os.makedirs(settings.upload_dir_abs, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


# ─── Health ───
@app.get("/api/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        return JSONResponse(status_code=503, content={"status": "error", "db": "unavailable"})
    return {"status": "ok", "db": "connected"}


# ─── Routers (all under /api) ───
app.include_router(auth_router.router, prefix="/api")
app.include_router(catalog_router.router, prefix="/api")
app.include_router(cabinet_router.router, prefix="/api")
app.include_router(admin_router.router, prefix="/api")
app.include_router(uploads_router.router, prefix="/api")

# SEO endpoints: /api/sitemap.xml + the crawler-facing /sitemap.xml alias
app.include_router(catalog_router.seo_router, prefix="/api")
app.include_router(catalog_router.seo_router, include_in_schema=False)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
