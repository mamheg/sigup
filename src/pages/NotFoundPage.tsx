import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui";
import { paths } from "../lib/paths";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="max-w-xl mx-auto px-4 py-28 text-center">
      <title>Страница не найдена — SiGup</title>
      <meta name="robots" content="noindex" />
      <p className="font-serif text-7xl text-brand">404</p>
      <h1 className="mt-4 font-serif text-2xl text-ink">Страница не найдена</h1>
      <p className="mt-2 text-ink-soft">Возможно, ссылка устарела или введена с ошибкой.</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button onClick={() => navigate(paths.home)}>На главную</Button>
        <Button variant="secondary" onClick={() => navigate(paths.catalog)}>В каталог</Button>
      </div>
    </div>
  );
}
