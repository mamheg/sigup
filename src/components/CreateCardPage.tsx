import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  AlertTriangle, ArrowLeft, ChevronRight, Crosshair, ImagePlus, Loader2,
  Plus, Send, Trash2, Upload, X,
} from "lucide-react";
import { api, ApiCategory, ApiError, ApiPhoto, CardStatus } from "../lib/api";
import { mediaUrl } from "../lib/media";
import { paths } from "../lib/paths";
import { Button, Card, Input, Textarea, Select } from "./ui";

// Broken images collapse silently rather than showing a torn icon.
const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => (e.currentTarget.style.opacity = "0");

/** Field label with an optional gold required marker. */
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="block mb-1.5 text-sm font-medium text-ink">
      {children}
      {required && <span className="text-gold"> *</span>}
    </span>
  );
}

interface ProductRow {
  key: number;
  name: string;
  price: string;
  description: string;
  image_url: string;
}

let productKey = 0;
const newProductRow = (): ProductRow => ({ key: ++productKey, name: "", price: "", description: "", image_url: "" });

const SUBMITTABLE: (CardStatus | null)[] = [null, "draft", "needs_revision", "rejected"];

export default function CreateCardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: editIdParam } = useParams();
  const editId = editIdParam ? Number(editIdParam) : null;

  // ─── Card identity / lifecycle ───
  const [cardId, setCardId] = useState<number | null>(null);
  const [status, setStatus] = useState<CardStatus | null>(null);
  const [initializing, setInitializing] = useState(!!editId);
  const [initError, setInitError] = useState<string | null>(null);

  // ─── Fields (backend contract §7.1) ───
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [instagram, setInstagram] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");
  const [priceInfo, setPriceInfo] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState("");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [photos, setPhotos] = useState<ApiPhoto[]>([]);

  // ─── UI state ───
  const [formError, setFormError] = useState<string | null>(null);
  // The first draft save remounts the page at /cabinet/edit/{id} — the flash
  // survives the redirect via navigation state.
  const [savedFlash, setSavedFlash] = useState<boolean>(!!(location.state as { saved?: boolean } | null)?.saved);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastGeoAt = useRef(0);

  const editing = cardId !== null;
  const isPublished = status === "published";
  const canSubmit = SUBMITTABLE.includes(status);

  // The saved-flash auto-hides regardless of how it was raised.
  useEffect(() => {
    if (!savedFlash) return;
    const t = window.setTimeout(() => setSavedFlash(false), 3000);
    return () => window.clearTimeout(t);
  }, [savedFlash]);

  // Categories for the select.
  useEffect(() => {
    api.catalog
      .categories()
      .then((list) => {
        setCategories(list);
        setCategoryId((prev) => prev || (list[0] ? String(list[0].id) : ""));
      })
      .catch(() => setInitError("Не удалось загрузить категории. Обновите страницу."));
  }, []);

  // Edit mode: hydrate the form from the owner's card.
  useEffect(() => {
    if (!editId) return;
    let alive = true;
    api.cabinet
      .myCards()
      .then((cards) => {
        if (!alive) return;
        const card = cards.find((c) => c.id === editId);
        if (!card) {
          setInitError("Карточка не найдена или принадлежит другому пользователю.");
          return;
        }
        setCardId(card.id);
        setStatus(card.status);
        setName(card.name);
        setCategoryId(String(card.category_id));
        setShortDescription(card.short_description);
        setFullDescription(card.full_description ?? "");
        setCountry(card.country ?? "");
        setCity(card.city ?? "");
        setAddress(card.address ?? "");
        setLat(card.lat != null ? String(card.lat) : "");
        setLng(card.lng != null ? String(card.lng) : "");
        setInstagram(card.instagram ?? "");
        setPhone(card.phone ?? "");
        setWhatsapp(card.whatsapp ?? "");
        setTelegram(card.telegram ?? "");
        setWebsite(card.website ?? "");
        setPriceInfo(card.price_info ?? "");
        setDeliveryInfo(card.delivery_info ?? "");
        setProducts(
          card.products.map((p) => ({
            key: ++productKey,
            name: p.name,
            price: p.price ?? "",
            description: p.description ?? "",
            image_url: p.image_url ?? "",
          }))
        );
        setPhotos(card.photos);
      })
      .catch((e) => alive && setInitError(e instanceof Error ? e.message : "Не удалось загрузить карточку"))
      .finally(() => alive && setInitializing(false));
    return () => {
      alive = false;
    };
  }, [editId]);

  const isFormValid = name.trim().length >= 2 && shortDescription.trim().length >= 10 && categoryId !== "";

  const buildPayload = () => ({
    name: name.trim(),
    category_id: Number(categoryId),
    short_description: shortDescription.trim(),
    full_description: fullDescription.trim() || null,
    country: country.trim() || null,
    city: city.trim() || null,
    address: address.trim() || null,
    lat: lat.trim() === "" ? null : Number(lat),
    lng: lng.trim() === "" ? null : Number(lng),
    instagram: instagram.trim() || null,
    phone: phone.trim() || null,
    whatsapp: whatsapp.trim() || null,
    telegram: telegram.trim() || null,
    website: website.trim() || null,
    price_info: priceInfo.trim() || null,
    delivery_info: deliveryInfo.trim() || null,
    products: products
      .filter((p) => p.name.trim())
      .map((p) => ({
        name: p.name.trim(),
        price: p.price.trim(),
        description: p.description.trim() || null,
        image_url: p.image_url.trim() || null,
      })),
  });

  const validateCoords = (): string | null => {
    if (lat.trim() !== "" && Number.isNaN(Number(lat))) return "Широта должна быть числом";
    if (lng.trim() !== "" && Number.isNaN(Number(lng))) return "Долгота должна быть числом";
    return null;
  };

  /** Create or patch the card; returns its id (or null on failure with inline error). */
  const save = async (): Promise<number | null> => {
    const coordError = validateCoords();
    if (coordError) {
      setFormError(coordError);
      return null;
    }
    setFormError(null);
    setSavedFlash(false);
    try {
      if (cardId !== null) {
        const updated = await api.cabinet.updateCard(cardId, buildPayload());
        setStatus(updated.status);
        setPhotos(updated.photos);
        return cardId;
      }
      const created = await api.cabinet.createCard(buildPayload());
      setCardId(created.id);
      setStatus(created.status);
      // From now on the URL reflects the persisted card (refresh-safe).
      navigate(`/cabinet/edit/${created.id}`, { replace: true, state: { saved: true } });
      return created.id;
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Не удалось сохранить карточку");
      return null;
    }
  };

  const handleSaveDraft = async () => {
    if (!isFormValid) return;
    setSaving(true);
    const id = await save();
    setSaving(false);
    if (id !== null) setSavedFlash(true);
  };

  const handleSubmitForReview = async () => {
    if (!isFormValid) return;
    setSubmitting(true);
    const id = await save();
    if (id === null) {
      setSubmitting(false);
      return;
    }
    try {
      await api.cabinet.submitCard(id);
      navigate(paths.cabinet);
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : "Не удалось отправить карточку на проверку");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Geocoding: Nominatim, best-effort by button (KTD-7) ───
  const findByAddress = async () => {
    const query = [address, city, country].map((s) => s.trim()).filter(Boolean).join(", ");
    if (!query) {
      setGeoError("Сначала заполните адрес или город.");
      return;
    }
    // Nominatim allows 1 rps — soft debounce between clicks.
    if (geoBusy || Date.now() - lastGeoAt.current < 1100) return;
    lastGeoAt.current = Date.now();
    setGeoBusy(true);
    setGeoError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        { headers: { Accept: "application/json" } }
      );
      if (!res.ok) throw new Error();
      const data: { lat?: string; lon?: string }[] = await res.json();
      if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
        setLat(Number(data[0].lat).toFixed(6));
        setLng(Number(data[0].lon).toFixed(6));
      } else {
        setGeoError("Адрес не найден — уточните его или введите координаты вручную.");
      }
    } catch {
      setGeoError("Сервис геокодинга недоступен. Координаты можно ввести вручную.");
    } finally {
      setGeoBusy(false);
    }
  };

  // ─── Photos (available once the card exists) ───
  const uploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || cardId === null) return;
      setPhotoBusy(true);
      setPhotoError(null);
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        try {
          const photo = await api.cabinet.uploadPhoto(cardId, file);
          setPhotos((prev) => [...prev, photo]);
        } catch (e) {
          setPhotoError(e instanceof ApiError ? e.message : "Не удалось загрузить фото");
          break;
        }
      }
      setPhotoBusy(false);
    },
    [cardId]
  );

  const removePhoto = async (photo: ApiPhoto) => {
    if (cardId === null) return;
    setPhotoError(null);
    try {
      await api.cabinet.deletePhoto(cardId, photo.id);
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    } catch (e) {
      setPhotoError(e instanceof ApiError ? e.message : "Не удалось удалить фото");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    uploadFiles(e.dataTransfer.files);
  };

  // ─── Products editor ───
  const setProduct = (key: number, patch: Partial<ProductRow>) =>
    setProducts((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  const pageTitle = editing ? "Редактирование карточки" : "Создание карточки";

  if (initializing) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-ink-faint">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (initError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-ink-soft">{initError}</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate(paths.cabinet)}>
          <ArrowLeft className="w-4 h-4" /> В кабинет
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <title>{`${pageTitle} — SiGup`}</title>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-ink-faint mb-6">
          <button onClick={() => navigate(paths.cabinet)} className="hover:text-brand transition-colors">
            Личный кабинет
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-line-strong" />
          <span className="text-ink">{pageTitle}</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(paths.cabinet)}
            aria-label="Назад"
            className="flex items-center justify-center w-10 h-10 rounded-sm border border-line bg-surface text-ink hover:border-line-strong hover:bg-canvas transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight leading-tight">{pageTitle}</h1>
            <p className="text-sm text-ink-soft mt-0.5">
              {editing
                ? "Обновите данные — изменения появятся в каталоге после модерации."
                : "Заполните данные — после проверки карточка появится в каталоге."}
            </p>
          </div>
        </div>

        {/* Published-card warning (KTD-3 binding rule) */}
        {isPublished && (
          <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-md p-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 leading-relaxed">
              Карточка опубликована. После сохранения она уйдёт на повторную проверку и временно скроется с сайта.
            </p>
          </div>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          <Card className="p-6 sm:p-8 rounded-lg" as="section">
            <div className="flex flex-col gap-6">
              {/* Основное */}
              <section className="flex flex-col gap-5">
                <h2 className="font-serif text-xl text-ink border-b border-line pb-3">Основное</h2>

                <div>
                  <FieldLabel required>Название фирмы или проекта</FieldLabel>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Черкесский мёд «Адыгэ фо»" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel required>Раздел каталога</FieldLabel>
                    <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <FieldLabel>Город</FieldLabel>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Например: Нальчик" />
                  </div>
                </div>

                <div>
                  <FieldLabel required>Краткое описание</FieldLabel>
                  <Textarea
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Кратко опишите ваш проект или фирму (1–2 предложения, минимум 10 символов)"
                    rows={3}
                  />
                </div>

                <div>
                  <FieldLabel>Подробное описание</FieldLabel>
                  <Textarea
                    value={fullDescription}
                    onChange={(e) => setFullDescription(e.target.value)}
                    placeholder="Расскажите об истории, ассортименте и том, что делает вас особенными…"
                    rows={6}
                  />
                </div>
              </section>

              {/* Локация */}
              <section className="flex flex-col gap-5">
                <h2 className="font-serif text-xl text-ink border-b border-line pb-3">Локация</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel>Страна</FieldLabel>
                    <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Например: Россия" />
                  </div>
                  <div>
                    <FieldLabel>Адрес</FieldLabel>
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Улица, дом (по желанию)" />
                  </div>
                </div>

                <div>
                  <FieldLabel>Точка на карте</FieldLabel>
                  <div className="grid grid-cols-2 md:grid-cols-[1fr_1fr_auto] gap-3">
                    <Input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="Широта, напр. 44.6098"
                      aria-label="Широта"
                    />
                    <Input
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="Долгота, напр. 40.1006"
                      aria-label="Долгота"
                    />
                    <Button type="button" variant="secondary" onClick={findByAddress} disabled={geoBusy} className="col-span-2 md:col-span-1">
                      {geoBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                      Найти по адресу
                    </Button>
                  </div>
                  {geoError ? (
                    <p className="text-xs text-red-600 mt-1.5">{geoError}</p>
                  ) : (
                    <p className="text-xs text-ink-faint mt-1.5">
                      С координатами на странице карточки появится карта. Поиск — по адресу, городу и стране.
                    </p>
                  )}
                </div>
              </section>

              {/* Контакты */}
              <section className="flex flex-col gap-5">
                <h2 className="font-serif text-xl text-ink border-b border-line pb-3">Контакты</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel>Instagram</FieldLabel>
                    <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@username" />
                  </div>
                  <div>
                    <FieldLabel>Телефон</FieldLabel>
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (___) ___-__-__" />
                  </div>
                  <div>
                    <FieldLabel>WhatsApp</FieldLabel>
                    <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+7 (___) ___-__-__" />
                  </div>
                  <div>
                    <FieldLabel>Telegram</FieldLabel>
                    <Input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username" />
                  </div>
                  <div className="md:col-span-2">
                    <FieldLabel>Сайт</FieldLabel>
                    <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="example.com" />
                  </div>
                </div>
              </section>

              {/* Цена и доставка */}
              <section className="flex flex-col gap-5">
                <h2 className="font-serif text-xl text-ink border-b border-line pb-3">Цена и доставка</h2>

                <div>
                  <FieldLabel>Цены</FieldLabel>
                  <Input
                    value={priceInfo}
                    onChange={(e) => setPriceInfo(e.target.value)}
                    placeholder="Например: от 500 ₽ или «Цены уточняйте у продавца»"
                  />
                </div>
                <div>
                  <FieldLabel>Доставка и оплата</FieldLabel>
                  <Input
                    value={deliveryInfo}
                    onChange={(e) => setDeliveryInfo(e.target.value)}
                    placeholder="Например: доставка по региону, самовывоз, оплата при получении"
                  />
                </div>
              </section>

              {/* Товары */}
              <section className="flex flex-col gap-4">
                <h2 className="font-serif text-xl text-ink border-b border-line pb-3">Товары</h2>

                {products.length === 0 && (
                  <p className="text-sm text-ink-soft">
                    Добавьте позиции ассортимента — они появятся на странице карточки в разделе «Товары».
                  </p>
                )}

                {products.map((p, idx) => (
                  <div key={p.key} className="rounded-md border border-line bg-canvas p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint tabular">Товар {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setProducts((prev) => prev.filter((row) => row.key !== p.key))}
                        aria-label="Удалить товар"
                        className="w-7 h-7 rounded-sm flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input value={p.name} onChange={(e) => setProduct(p.key, { name: e.target.value })} placeholder="Название товара *" />
                      <Input value={p.price} onChange={(e) => setProduct(p.key, { price: e.target.value })} placeholder="Цена, напр. 450 ₽/кг" />
                    </div>
                    <Input value={p.description} onChange={(e) => setProduct(p.key, { description: e.target.value })} placeholder="Короткое описание" />
                    <Input value={p.image_url} onChange={(e) => setProduct(p.key, { image_url: e.target.value })} placeholder="Ссылка на фото товара (URL)" />
                  </div>
                ))}

                <Button type="button" variant="secondary" size="sm" onClick={() => setProducts((prev) => [...prev, newProductRow()])} className="self-start">
                  <Plus className="w-4 h-4" /> Добавить товар
                </Button>
              </section>

              {/* Фотографии */}
              <section className="flex flex-col gap-3">
                <h2 className="font-serif text-xl text-ink border-b border-line pb-3">Фотографии</h2>

                {!editing ? (
                  <div className="rounded-md border border-dashed border-line bg-canvas py-8 px-5 text-center">
                    <ImagePlus className="w-6 h-6 text-ink-faint mx-auto mb-2" />
                    <p className="text-sm text-ink-soft">
                      Сначала сохраните черновик — после этого можно будет загрузить фотографии.
                    </p>
                  </div>
                ) : (
                  <>
                    {photos.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {photos.map((photo) => (
                          <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="relative group aspect-square rounded-sm overflow-hidden border border-line img-outline"
                          >
                            <img
                              src={mediaUrl(photo.thumb_url ?? photo.url)}
                              alt=""
                              onError={hideBroken}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(photo)}
                              aria-label="Удалить фото"
                              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-surface/90 border border-line flex items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                      }}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`rounded-md border border-dashed py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
                        isDragging ? "border-brand bg-brand-muted" : "border-line bg-canvas hover:border-line-strong"
                      }`}
                    >
                      <div
                        className={`w-14 h-14 rounded-md flex items-center justify-center transition-colors ${
                          isDragging ? "bg-brand-muted text-brand" : "bg-surface text-ink-faint border border-line"
                        }`}
                      >
                        {photoBusy ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : isDragging ? (
                          <Upload className="w-6 h-6" />
                        ) : (
                          <ImagePlus className="w-6 h-6" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-ink">
                          {photoBusy ? "Загрузка…" : isDragging ? "Отпустите файлы для загрузки" : "Перетащите фотографии сюда"}
                        </p>
                        <p className="text-xs text-ink-faint mt-1">
                          или <span className="text-gold underline underline-offset-2">выберите файлы</span> · JPG, PNG, WebP до 5 МБ · до 10 фото
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          uploadFiles(e.target.files);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="hidden"
                      />
                    </div>
                    {photoError && <p className="text-xs text-red-600">{photoError}</p>}
                  </>
                )}
              </section>
            </div>
          </Card>

          {/* Actions */}
          <div className="sticky bottom-0 mt-5 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 bg-canvas/90 backdrop-blur-sm border-t border-line sm:border-0 sm:bg-transparent sm:backdrop-blur-none sm:py-0">
            {formError && <p className="text-sm text-red-600 mb-3 sm:text-right">{formError}</p>}
            {savedFlash && !formError && <p className="text-sm text-green-700 mb-3 sm:text-right">Черновик сохранён.</p>}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3">
              <Button type="button" variant="secondary" size="lg" onClick={() => navigate(paths.cabinet)} className="sm:w-auto">
                Отмена
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                disabled={!isFormValid || saving || submitting}
                onClick={handleSaveDraft}
                className="sm:w-auto"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {isPublished || status === "pending" || status === "hidden" ? "Сохранить" : "Сохранить черновик"}
              </Button>
              {canSubmit && (
                <Button
                  type="button"
                  size="lg"
                  disabled={!isFormValid || saving || submitting}
                  onClick={handleSubmitForReview}
                  className="sm:w-auto"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Отправить на проверку
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
