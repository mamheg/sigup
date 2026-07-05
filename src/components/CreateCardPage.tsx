import React, { useCallback, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ChevronRight, ImagePlus, Plus, Upload, X } from "lucide-react";
import { Project, ProjectCategory, ProjectStatus } from "../types";
import { Button, Card, Input, Textarea, Select } from "./ui";

interface CreateCardPageProps {
  onCreateCard: (
    newProject: Omit<Project, "id" | "authorId" | "authorName" | "updatedAt">
  ) => void;
  onBack: () => void;
}

const categoryOptions = Object.entries(ProjectCategory).map(([key, value]) => ({ key, value }));

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

const CreateCardPage: React.FC<CreateCardPageProps> = ({ onCreateCard, onBack }) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProjectCategory>(ProjectCategory.Products);
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [instagram, setInstagram] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPhotos((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [processFiles]
  );

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const isFormValid = name.trim() !== "" && shortDescription.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onCreateCard({
      name: name.trim(),
      category,
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      photos,
      country: country.trim(),
      city: city.trim(),
      address: address.trim() || undefined,
      instagram: instagram.trim() || undefined,
      phone: phone.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      telegram: telegram.trim() || undefined,
      deliveryInfo: deliveryInfo.trim() || undefined,
      status: ProjectStatus.Pending,
    });
  };

  return (
    <div className="min-h-screen bg-canvas">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-ink-faint mb-6">
          <button onClick={onBack} className="hover:text-brand transition-colors">
            Личный кабинет
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-line-strong" />
          <span className="text-ink">Создать карточку</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            aria-label="Назад"
            className="flex items-center justify-center w-10 h-10 rounded-sm border border-line bg-surface text-ink hover:border-line-strong hover:bg-canvas transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink tracking-tight leading-tight">
              Создание карточки
            </h1>
            <p className="text-sm text-ink-soft mt-0.5">
              Заполните данные — после проверки карточка появится в каталоге.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-6 sm:p-8 rounded-lg" as="section">
            <div className="flex flex-col gap-6">
              {/* Основное */}
              <section className="flex flex-col gap-5">
                <h2 className="font-serif text-xl text-ink border-b border-line pb-3">Основное</h2>

                <div>
                  <FieldLabel required>Название фирмы или проекта</FieldLabel>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Например: Черкесский мёд «Адыгэ фо»"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel required>Раздел каталога</FieldLabel>
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                    >
                      {categoryOptions.map(({ key, value }) => (
                        <option key={key} value={value}>
                          {value}
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
                    placeholder="Кратко опишите ваш проект или фирму (1–2 предложения)"
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
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Улица, дом (по желанию)"
                    />
                  </div>
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
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>
                  <div>
                    <FieldLabel>WhatsApp</FieldLabel>
                    <Input
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+7 (___) ___-__-__"
                    />
                  </div>
                  <div>
                    <FieldLabel>Telegram</FieldLabel>
                    <Input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="@username" />
                  </div>
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

              {/* Фотографии */}
              <section className="flex flex-col gap-3">
                <h2 className="font-serif text-xl text-ink border-b border-line pb-3">Фотографии</h2>

                {photos.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {photos.map((photo, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="relative group aspect-square rounded-sm overflow-hidden border border-line img-outline"
                      >
                        <img
                          src={photo}
                          alt={`Фото ${index + 1}`}
                          onError={hideBroken}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          aria-label="Удалить фото"
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-surface/90 border border-line flex items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-sm border border-dashed border-line bg-canvas flex flex-col items-center justify-center gap-1 text-ink-faint hover:border-gold hover:text-gold transition-colors cursor-pointer"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-xs">Ещё</span>
                    </button>
                  </div>
                )}

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
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
                    {isDragging ? <Upload className="w-6 h-6" /> : <ImagePlus className="w-6 h-6" />}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-ink">
                      {isDragging ? "Отпустите файлы для загрузки" : "Перетащите фотографии сюда"}
                    </p>
                    <p className="text-xs text-ink-faint mt-1">
                      или <span className="text-gold underline underline-offset-2">выберите файлы</span> · PNG, JPG до 5 МБ
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </section>
            </div>
          </Card>

          {/* Actions */}
          <div className="sticky bottom-0 mt-5 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 bg-canvas/90 backdrop-blur-sm border-t border-line sm:border-0 sm:bg-transparent sm:backdrop-blur-none sm:py-0">
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3">
              <Button type="button" variant="secondary" size="lg" onClick={onBack} className="sm:w-auto">
                Отмена
              </Button>
              <Button type="submit" size="lg" disabled={!isFormValid} className="sm:w-auto">
                Отправить на модерацию
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCardPage;
