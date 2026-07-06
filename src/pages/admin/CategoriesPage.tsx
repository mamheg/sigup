/**
 * Категории каталога: добавление, инлайн-переименование, удаление
 * (категорию с карточками сервер не даст удалить — 409).
 */
import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { api, ApiCategory, ApiError } from "../../lib/api";
import { Button, Card, Input } from "../../components/ui";
import { EmptyState, ErrorNote, ErrorState, IconBtn, PageHeader, SuccessNote, TableSkeleton } from "./shared";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ApiCategory[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const fetchCategories = useCallback(() => api.catalog.categories().then(setCategories), []);

  const load = useCallback(() => {
    setLoadError(null);
    setCategories(null);
    fetchCategories().catch((e) =>
      setLoadError(e instanceof Error ? e.message : "Не удалось загрузить категории")
    );
  }, [fetchCategories]);

  useEffect(load, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    setActionError(null);
    setNote(null);
    try {
      await api.admin.createCategory({ name });
      setNewName("");
      await fetchCategories();
      setNote(`Категория «${name}» добавлена.`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Не удалось добавить категорию");
    } finally {
      setAdding(false);
    }
  };

  const startRename = (c: ApiCategory) => {
    setEditingId(c.id);
    setEditName(c.name);
    setActionError(null);
  };

  const saveRename = async (c: ApiCategory) => {
    const name = editName.trim();
    if (!name || name === c.name) {
      setEditingId(null);
      return;
    }
    setBusyId(c.id);
    setActionError(null);
    setNote(null);
    try {
      await api.admin.updateCategory(c.id, { name });
      setEditingId(null);
      await fetchCategories();
      setNote(`Категория переименована в «${name}».`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Не удалось переименовать категорию");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (c: ApiCategory) => {
    setBusyId(c.id);
    setActionError(null);
    setNote(null);
    try {
      await api.admin.deleteCategory(c.id);
      await fetchCategories();
      setNote(`Категория «${c.name}» удалена.`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setActionError("Нельзя удалить категорию с карточками. Сначала перенесите их в другую категорию.");
      } else {
        setActionError(err instanceof ApiError ? err.message : "Не удалось удалить категорию");
      }
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 w-full">
      <title>Категории — админ-панель SiGup</title>
      <PageHeader title="Категории" subtitle="Разделы каталога: добавление, переименование и удаление" />

      {note && <SuccessNote text={note} onClose={() => setNote(null)} />}
      {actionError && <ErrorNote text={actionError} onClose={() => setActionError(null)} />}

      {/* ── Добавление ── */}
      <Card padded>
        <form onSubmit={add} className="flex items-end gap-3">
          <div className="flex-1">
            <Input
              label="Новая категория"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Например: Одежда и аксессуары"
            />
          </div>
          <Button type="submit" disabled={adding || !newName.trim()}>
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Добавить
          </Button>
        </form>
      </Card>

      {/* ── Список ── */}
      <Card className="p-5 sm:p-6">
        {loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : categories === null ? (
          <TableSkeleton rows={6} />
        ) : categories.length === 0 ? (
          <EmptyState text="Категорий пока нет — добавьте первую." />
        ) : (
          <ul>
            <li className="flex items-center justify-between pb-3 border-b border-line text-[11px] font-semibold tracking-wider uppercase text-ink-faint">
              <span>Категория</span>
              <span className="flex items-center gap-6">
                <span>Карточек</span>
                <span className="w-[72px] text-right">Действия</span>
              </span>
            </li>
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-4 py-3 border-b border-line last:border-0">
                {editingId === c.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveRename(c);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="h-9"
                      aria-label="Новое название категории"
                    />
                    <IconBtn title="Сохранить" tone="brand" busy={busyId === c.id} onClick={() => saveRename(c)}>
                      <Check className="w-4 h-4" />
                    </IconBtn>
                    <IconBtn title="Отмена" disabled={busyId === c.id} onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4" />
                    </IconBtn>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-ink block truncate">{c.name}</span>
                      <span className="text-xs text-ink-faint">{c.slug}</span>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <span className="text-sm text-ink-soft tabular w-14 text-right">{c.cards_count ?? 0}</span>
                      <div className="flex items-center gap-1.5">
                        <IconBtn title="Переименовать" disabled={busyId === c.id} onClick={() => startRename(c)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </IconBtn>
                        <IconBtn title="Удалить" tone="danger" busy={busyId === c.id} onClick={() => remove(c)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </IconBtn>
                      </div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
