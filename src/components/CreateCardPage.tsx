import React, { useState, useRef, useCallback } from "react";
import { motion } from "motion/react";
import { Upload, ArrowLeft, ChevronRight, Image, X, Plus } from "lucide-react";
import { Project, ProjectCategory, ProjectStatus } from "../types";
import { useLanguage } from "../LanguageContext";

interface CreateCardPageProps {
  onCreateCard: (
    newProject: Omit<Project, "id" | "authorId" | "authorName" | "updatedAt">
  ) => void;
  onBack: () => void;
}

const categoryOptions = Object.entries(ProjectCategory).map(([key, value]) => ({
  key,
  value,
}));

const CreateCardPage: React.FC<CreateCardPageProps> = ({
  onCreateCard,
  onBack,
}) => {
  const { t } = useLanguage();

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProjectCategory>(
    ProjectCategory.Products
  );
  const [city, setCity] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [instagram, setInstagram] = useState("");
  const [phone, setPhone] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag & drop handlers
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
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles]
  );

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCard({
      name,
      category,
      shortDescription,
      fullDescription,
      photos,
      country: "",
      city,
      instagram: instagram || undefined,
      phone: phone || undefined,
      status: ProjectStatus.Pending,
    });
  };

  const isFormValid = name.trim() && city.trim() && shortDescription.trim();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FCFBF9" }}>
      {/* Breadcrumbs */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-4xl mx-auto px-4 pt-8 pb-2"
      >
        <nav className="flex items-center gap-1.5 text-sm">
          <button
            onClick={onBack}
            className="transition-colors hover:underline"
            style={{ color: "#6B7280" }}
          >
            Главная
          </button>
          <ChevronRight size={14} style={{ color: "#9CA3AF" }} />
          <button
            onClick={onBack}
            className="transition-colors hover:underline"
            style={{ color: "#6B7280" }}
          >
            Личный кабинет
          </button>
          <ChevronRight size={14} style={{ color: "#9CA3AF" }} />
          <span className="font-medium" style={{ color: "#244D33" }}>
            Создать карточку
          </span>
        </nav>
      </motion.div>

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="max-w-4xl mx-auto px-4 pt-4 pb-6"
      >
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
            style={{ backgroundColor: "#F5F2EC" }}
          >
            <ArrowLeft size={18} style={{ color: "#244D33" }} />
          </button>
          <h1
            className="text-3xl font-semibold"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              color: "#244D33",
            }}
          >
            Создание новой карточки
          </h1>
        </div>
      </motion.div>

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-4xl mx-auto px-4 pb-16"
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 md:p-10 shadow-sm"
          style={{ border: "1px solid #EEEAE1" }}
        >
          {/* Название фирмы или проекта */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#2A2622" }}
            >
              Название фирмы или проекта
              <span className="ml-0.5" style={{ color: "#C79E61" }}>
                *
              </span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Черкесский мёд «Адыгэ фо»"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-gray-400"
              style={{
                border: "1px solid #EEEAE1",
                backgroundColor: "#FCFBF9",
                color: "#2A2622",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "#244D33")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "#EEEAE1")
              }
            />
          </div>

          {/* Row: Раздел каталога + Город */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#2A2622" }}
              >
                Раздел каталога
                <span className="ml-0.5" style={{ color: "#C79E61" }}>
                  *
                </span>
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as ProjectCategory)
                }
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 appearance-none cursor-pointer"
                style={{
                  border: "1px solid #EEEAE1",
                  backgroundColor: "#FCFBF9",
                  color: "#2A2622",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 12px center",
                  paddingRight: "40px",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "#244D33")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "#EEEAE1")
                }
              >
                {categoryOptions.map(({ key, value }) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#2A2622" }}
              >
                Город
                <span className="ml-0.5" style={{ color: "#C79E61" }}>
                  *
                </span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Например: Нальчик"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-gray-400"
                style={{
                  border: "1px solid #EEEAE1",
                  backgroundColor: "#FCFBF9",
                  color: "#2A2622",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "#244D33")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "#EEEAE1")
                }
              />
            </div>
          </div>

          {/* Краткое описание */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#2A2622" }}
            >
              Краткое описание
              <span className="ml-0.5" style={{ color: "#C79E61" }}>
                *
              </span>
            </label>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Кратко опишите ваш проект или фирму (1–2 предложения)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 resize-none placeholder:text-gray-400"
              style={{
                border: "1px solid #EEEAE1",
                backgroundColor: "#FCFBF9",
                color: "#2A2622",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "#244D33")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "#EEEAE1")
              }
            />
          </div>

          {/* Подробное описание */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#2A2622" }}
            >
              Подробное описание
            </label>
            <textarea
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Расскажите подробнее о вашей деятельности, истории, уникальности…"
              rows={6}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 resize-none placeholder:text-gray-400"
              style={{
                border: "1px solid #EEEAE1",
                backgroundColor: "#FCFBF9",
                color: "#2A2622",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "#244D33")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "#EEEAE1")
              }
            />
          </div>

          {/* Row: Instagram + Телефон */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#2A2622" }}
              >
                Контакты Instagram
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@username"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-gray-400"
                style={{
                  border: "1px solid #EEEAE1",
                  backgroundColor: "#FCFBF9",
                  color: "#2A2622",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "#244D33")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "#EEEAE1")
                }
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "#2A2622" }}
              >
                Контактный телефон
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 (___) ___-__-__"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 placeholder:text-gray-400"
                style={{
                  border: "1px solid #EEEAE1",
                  backgroundColor: "#FCFBF9",
                  color: "#2A2622",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "#244D33")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "#EEEAE1")
                }
              />
            </div>
          </div>

          {/* Фотографии - upload area */}
          <div className="mb-8">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "#2A2622" }}
            >
              Фотографии
            </label>

            {/* Photo preview grid */}
            {photos.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-4"
              >
                {photos.map((photo, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="relative group aspect-square rounded-xl overflow-hidden"
                    style={{ border: "1px solid #EEEAE1" }}
                  >
                    <img
                      src={photo}
                      alt={`Фото ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-sm"
                    >
                      <X size={13} style={{ color: "#2A2622" }} />
                    </button>
                  </motion.div>
                ))}

                {/* Add more button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-colors duration-200"
                  style={{
                    border: "2px dashed #EEEAE1",
                    backgroundColor: "#FCFBF9",
                    color: "#9CA3AF",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#C79E61";
                    e.currentTarget.style.color = "#C79E61";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#EEEAE1";
                    e.currentTarget.style.color = "#9CA3AF";
                  }}
                >
                  <Plus size={20} />
                  <span className="text-xs">Ещё</span>
                </button>
              </motion.div>
            )}

            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="relative rounded-xl py-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300"
              style={{
                border: isDragging
                  ? "2px dashed #244D33"
                  : "2px dashed #EEEAE1",
                backgroundColor: isDragging ? "#f0f7f2" : "#FCFBF9",
              }}
            >
              <motion.div
                animate={isDragging ? { scale: 1.1, y: -4 } : { scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: isDragging ? "#e0ece3" : "#F5F2EC" }}
              >
                {isDragging ? (
                  <Upload size={24} style={{ color: "#244D33" }} />
                ) : (
                  <Image size={24} style={{ color: "#9CA3AF" }} />
                )}
              </motion.div>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: "#2A2622" }}>
                  {isDragging
                    ? "Отпустите файлы для загрузки"
                    : "Перетащите фотографии сюда"}
                </p>
                <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                  или{" "}
                  <span
                    className="underline underline-offset-2"
                    style={{ color: "#C79E61" }}
                  >
                    выберите файлы
                  </span>{" "}
                  на устройстве · PNG, JPG до 5 МБ
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
          </div>

          {/* Divider */}
          <div className="mb-6" style={{ borderTop: "1px solid #EEEAE1" }} />

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-center gap-3 sm:justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-medium transition-colors duration-200"
              style={{
                border: "1px solid #EEEAE1",
                color: "#6B7280",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F5F2EC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Отмена
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!isFormValid}
              className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: isFormValid ? "#244D33" : "#244D33",
              }}
              onMouseEnter={(e) => {
                if (isFormValid) e.currentTarget.style.backgroundColor = "#1a3a26";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#244D33";
              }}
            >
              Отправить на модерацию
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateCardPage;
