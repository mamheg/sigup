"""Transliterated slugs: "Сырная мастерская «Уздых»" + id=12 -> "syrnaya-masterskaya-uzdyh-12".

Card slugs carry an "-{id}" suffix so lookups stay stable across renames (KTD-5):
the id is extracted from the trailing segment and the canonical slug is resolved by id.
"""
import re
from typing import Optional

# Russian -> Latin transliteration (GOST-ish, pragmatic web variant)
_TRANSLIT = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "yo",
    "ж": "zh", "з": "z", "и": "i", "й": "y", "к": "k", "л": "l", "м": "m",
    "н": "n", "о": "o", "п": "p", "р": "r", "с": "s", "т": "t", "у": "u",
    "ф": "f", "х": "h", "ц": "ts", "ч": "ch", "ш": "sh", "щ": "shch",
    "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "yu", "я": "ya",
    # Kabardian/Adyghe palochka
    "ӏ": "", "l": "l",
}


def transliterate(text: str) -> str:
    out = []
    for ch in text.lower():
        if ch in _TRANSLIT:
            out.append(_TRANSLIT[ch])
        else:
            out.append(ch)
    return "".join(out)


def slugify(text: str) -> str:
    """Transliterate and reduce to [a-z0-9-]."""
    text = transliterate(text or "")
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text or "item"


def make_slug(name: str, item_id: int) -> str:
    """Slug for a card: transliterated name + "-{id}" suffix."""
    base = slugify(name)
    # keep total length sane for URLs
    base = base[:180].rstrip("-")
    return f"{base}-{item_id}"


def extract_id(slug: str) -> Optional[int]:
    """Extract the trailing id from a card slug ("...-12" -> 12)."""
    match = re.search(r"-(\d+)$", slug or "")
    if not match:
        return None
    return int(match.group(1))
