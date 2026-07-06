"""Image upload validation and processing (U4, KTD-4).

Uploads: jpeg/png/webp only (mime + Pillow magic-byte verify), ≤5MB, ≤10 per card.
Processing: longest side resized to 1600px, saved as webp quality 82 under
static/uploads/{card_id}/{uuid}.webp plus a 400px thumbnail {uuid}_thumb.webp.
"""
import io
import os
import shutil
import uuid
from typing import Optional

from fastapi import HTTPException
from PIL import Image, ImageOps

MAX_UPLOAD_BYTES = 5 * 1024 * 1024  # 5MB
MAX_PHOTOS_PER_CARD = 10
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}
MAIN_MAX_SIDE = 1600
THUMB_MAX_SIDE = 400
WEBP_QUALITY = 82
URL_PREFIX = "/static/uploads"

_TYPE_ERROR = "Допустимы только изображения JPEG, PNG и WebP"


def validate_upload(content: bytes, content_type: Optional[str]) -> None:
    """Raise 413 for oversized files, 415 for anything that is not jpeg/png/webp."""
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="Файл слишком большой (максимум 5 МБ)")
    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=415, detail=_TYPE_ERROR)
    try:
        with Image.open(io.BytesIO(content)) as img:
            detected_format = img.format
            img.verify()  # magic bytes / structure check
    except Exception:
        raise HTTPException(status_code=415, detail=_TYPE_ERROR)
    if detected_format not in ALLOWED_FORMATS:
        raise HTTPException(status_code=415, detail=_TYPE_ERROR)


def _resized(img: Image.Image, max_side: int) -> Image.Image:
    copy = img.copy()
    copy.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)  # downscale only
    return copy


def process_and_save(content: bytes, card_id: int, upload_root: str) -> tuple[str, str]:
    """Optimize and store an already-validated image; return (url, thumb_url)."""
    dest_dir = os.path.join(upload_root, str(card_id))
    os.makedirs(dest_dir, exist_ok=True)
    name = uuid.uuid4().hex

    with Image.open(io.BytesIO(content)) as src:
        img = ImageOps.exif_transpose(src)
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA" if img.mode in ("P", "LA", "PA") else "RGB")
        _resized(img, MAIN_MAX_SIDE).save(
            os.path.join(dest_dir, f"{name}.webp"), "WEBP", quality=WEBP_QUALITY
        )
        _resized(img, THUMB_MAX_SIDE).save(
            os.path.join(dest_dir, f"{name}_thumb.webp"), "WEBP", quality=WEBP_QUALITY
        )

    return (
        f"{URL_PREFIX}/{card_id}/{name}.webp",
        f"{URL_PREFIX}/{card_id}/{name}_thumb.webp",
    )


def _local_path(url: Optional[str], upload_root: str) -> Optional[str]:
    """Map a '/static/uploads/...' URL to a file under upload_root (external URLs -> None)."""
    if not url or not url.startswith(URL_PREFIX + "/"):
        return None
    relative = url[len(URL_PREFIX) + 1:]
    path = os.path.normpath(os.path.join(upload_root, relative))
    if not path.startswith(os.path.normpath(upload_root) + os.sep):
        return None  # path traversal guard
    return path


def delete_photo_files(url: Optional[str], thumb_url: Optional[str], upload_root: str) -> None:
    """Delete the files behind a photo record (external seed URLs are skipped)."""
    for candidate in (url, thumb_url):
        path = _local_path(candidate, upload_root)
        if path and os.path.isfile(path):
            os.remove(path)


def delete_card_dir(card_id: int, upload_root: str) -> None:
    """Delete the whole uploads directory of a card (used on card delete)."""
    shutil.rmtree(os.path.join(upload_root, str(card_id)), ignore_errors=True)
