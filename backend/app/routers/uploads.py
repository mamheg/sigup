"""Generic authenticated image uploads (product photos, event covers, …).

Same validation/resize/webp pipeline as card photos and avatars; files land in
static/uploads/misc/ and the endpoint returns just the public URL.
"""
from fastapi import APIRouter, Depends, File, UploadFile

from app import schemas
from app.auth import get_current_user
from app.config import settings
from app.models import User
from app.services import images

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/image", response_model=schemas.UploadUrlOut)
async def upload_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    """Upload one image and return its public /static URL."""
    content = await file.read()
    images.validate_upload(content, file.content_type)
    url = images.save_image(content, "misc", settings.upload_dir_abs)
    return schemas.UploadUrlOut(url=url)
