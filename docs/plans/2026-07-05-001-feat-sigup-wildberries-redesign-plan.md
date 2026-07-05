---
title: "feat: SiGup — редизайн в стиле Wildberries, роутинг, Supabase-auth и SEO"
date: 2026-07-05
type: feat
status: ready
depth: deep
repo: mamheg/sigup
deploy: https://sigup-blond.vercel.app/
---

# feat: SiGup — редизайн в стиле Wildberries, роутинг, Supabase-auth и SEO

## Summary

Крупная переработка SiGup (React 19 + Vite 6 + Tailwind v4 + motion), задеплоенного статикой на Vercel. Работа делится на пять треков:

1. **Единая дизайн-система** вместо «ИИ-шного» вида: один масштаб скруглений, одна система теней (если тень — то везде), светлые единообразные обводки, дисциплинированная нейтральная палитра + фирменный зелёный `#244D33`. Структура и UX — как у Wildberries, но бренд остаётся зелёным.
2. **Настоящий роутинг** (`react-router-dom`) с реальными URL для каждой страницы — необходимо и для «каталог отдельной страницей», и для SEO.
3. **Полноценный каталог** как отдельная страница `/catalog`: масштабный адаптивный грид карточек, липкие фильтры, сортировка, поиск, счётчик результатов.
4. **Настоящая авторизация на Supabase**: вход, регистрация, регистрация предпринимателя, роли (guest/entrepreneur/admin) через таблицу `profiles` + RLS. Контент (карточки/афиша/объявления) переносится в Supabase, чтобы модерация и кабинет стали реальными.
5. **SEO**: пре-рендер статики (`vite-react-ssg`), пометаданные на каждый маршрут, `robots.txt`, `sitemap.xml`, Open Graph.

Финальный трек — **сквозная проверка живого сайта через Playwright MCP** на проде Vercel: пройти каждую страницу и кнопку, починить все баги.

**Не входит сейчас:** оплата/чекаут, реальная корзина и оформление заказа, мультивалютность, аналитические дашборды админа с реальными графиками.

---

## Problem Frame

Текущее приложение — снапшот из AI Studio: одностраничное, без роутера (навигация — строковый `currentSection` в `useState` внутри `src/App.tsx`), вся «база» в памяти (`src/initialData.ts`), без авторизации, без SEO. Визуально это выдаёт ИИ-генерацию: хаос скруглений (`rounded-lg`/`rounded-2xl`/`rounded-[28px]`/`rounded-[32px]`), непоследовательные тени, hex-цвета захардкожены то в верхнем, то в нижнем регистре, определены `@theme`-токены, которые нигде не используются, и разбросаны несуществующие Tailwind-классы (`w-4.5`, `opacity-3`, `text-stone-850`, `gap-4.5`), которые молча не работают.

Плюс набор реальных багов (см. «System-Wide Impact»): мёртвая модалка в кабинете, невалидная секция `entrepreneurs` в футере (рендерит пустой экран), кнопки без обработчиков, форма создания карточки не уводит со страницы после отправки, фейковые захардкоженные метрики, ломающиеся контакт-ссылки при пустых полях.

Задача — превратить это в цельный, индексируемый, «настоящий» маркетплейс-каталог с рабочей авторизацией, сохранив зелёную идентичность SiGup.

---

## Requirements

- **R1.** Полностью удалить балкарский язык (`krc`) из типа `Language`, словаря переводов, валидации localStorage и UI-переключателя.
- **R2.** Переключатель языков — компактная плашка-триггер (chip), по клику открывается небольшой попап со списком языков (ru / kbd / en). Заменяет текущий сегментированный ряд из 4 кнопок.
- **R3.** Единая дизайн-система: токены (радиусы, тени, границы, палитра) в Tailwind v4 `@theme`; все компоненты используют токены/примитивы вместо ad-hoc hex; удалить несуществующие Tailwind-классы.
- **R4.** Каталог — отдельная страница `/catalog` с масштабным адаптивным гридом (2→6 колонок), липкими фильтрами (категория, город, поиск), сортировкой и счётчиком результатов; фильтры отражаются в URL-query.
- **R5.** Реальный роутинг с URL на каждую страницу: главная, каталог, карточка, афиша, объявления, для предпринимателей/кабинет, о проекте, вход/регистрация, админка, 404.
- **R6.** Рабочая авторизация на Supabase: регистрация (обычная и предпринимателя), вход, выход, сохранение сессии, роль из `profiles`, защита маршрутов кабинета/админки.
- **R7.** Контент (проекты/афиша/объявления) хранится в Supabase, засеян из текущих `initialData`; создание/редактирование/модерация работают против БД.
- **R8.** SEO: каждый маршрут индексируем — пре-рендер в статический HTML, уникальные `<title>`/`<meta>`/OG на маршрут, `robots.txt`, `sitemap.xml`.
- **R9.** Все кнопки и ссылки работают; ни одного мёртвого обработчика или ведущего в пустоту перехода.
- **R10.** Сквозная проверка через Playwright MCP на `https://sigup-blond.vercel.app/`: каждая страница и кнопка, десктоп и мобайл; найденные баги исправлены.

**Success criteria:** сайт открывается по прямым URL, каталог — полноценная страница-грид, вход/регистрация реально работают (при наличии ключей Supabase), Google видит уникальный HTML на каждой странице, визуально сайт единообразен и не выглядит ИИ-сгенерированным, Playwright-прогон не находит битых кнопок/пустых экранов.

---

## Key Technical Decisions

- **Роутинг: `react-router-dom` v7.** Заменяем `currentSection`-свитч и `AnimatePresence`-гейты на дерево маршрутов с общим layout (`<Header/>` + `<Outlet/>` + `<Footer/>`), `ScrollRestoration` и явным `*`→404. Анимации переходов сохраняем через `AnimatePresence` по `location.pathname`.
- **SEO: `vite-react-ssg`.** React-ориентированный форк `vite-ssg`, совместим с `react-router-dom`, на `vite build` генерирует реальный статический HTML для каждого маршрута — деплоится как статика на Vercel без сервера. Метаданные — нативные React 19 `<title>`/`<meta>` в компонентах страниц (без доп. зависимостей). Пре-рендер, а не только мета-теги: полагаться на «второй проход» Google по JS в 2026 ненадёжно для небольших сайтов. `robots.txt` и `sitemap.xml` генерируются из списка маршрутов на билде. (Источники: Vercel — How Google handles JS; vite-react-ssg; Google Search Central JS SEO.)
- **Auth: `@supabase/supabase-js` + `AuthContext`.** Клиент из `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` (префикс `VITE_` обязателен, значения в env Vercel). `AuthProvider` вызывает `getSession()` на маунте и подписывается на `onAuthStateChange`, отдаёт `session`/`user`/`profile`/`loading`. Роль и профиль — в таблице `profiles` (`id uuid ref auth.users`, `role text check in ('guest','entrepreneur','admin')` + поля предпринимателя). Клиентский `ProtectedRoute` — только UX; настоящая граница — RLS. (Источники: Supabase Auth React quickstart; Supabase RLS/token security.)
- **Данные в Supabase.** Таблицы `profiles`, `projects`, `events`, `announcements`, засеяны из `src/initialData.ts`. Чтение опубликованного — публично (RLS `select` для `status = 'Опубликовано'`); запись — автор своей карточки; модерация — роль admin через `SECURITY DEFINER` helper `is_admin()`. Фронт получает данные через слой доступа (`src/lib/api.ts`), а не из статического массива. `initialData.ts` остаётся как источник сид-миграции и как офлайн-фолбэк, если ключи ещё не заданы.
- **Дизайн-токены в Tailwind v4 `@theme`.** Единый масштаб радиусов (например: `--radius-sm: 8px` инпуты/кнопки, `--radius-md: 12px` карточки, `--radius-lg: 16px` крупные панели; `rounded-full` — только аватары/чипы), одна-две тени-токена (`--shadow-card`, `--shadow-pop`), нейтральная серо-песочная шкала + бренд `brand`/`brand-fg`. Используем семантические токены, а не сырые hex. Добавляем защиту от регресса: ESLint-правило/скрипт, банящий `rounded-2xl|rounded-3xl`, произвольные `rounded-[..]`, многослойные `shadow-2xl` и градиенты `from-*-to-*`.
- **Общие UI-примитивы.** `src/components/ui/` : `Button`, `Card`, `Input`, `Select`, `Badge`, `Modal`, `Popover` — единая точка стилей, чтобы страницы не расходились.
- **Тесты.** Юнит-фреймворка нет. Ставим **Vitest** для чистой логики (фильтры каталога, хелперы auth/роли, миграция сид-данных). Основная приёмка — **Playwright MCP на проде** + `npm run lint` (`tsc --noEmit`). Для страниц без поведения — `Test expectation: none`.

---

## High-Level Technical Design

### Дерево маршрутов и layout

```
<RootLayout>                        (Header + <Outlet/> + Footer, AuthProvider, ScrollRestoration)
  /                → MainPage
  /catalog         → CatalogPage         (?q=&cat=&city=&sort=)
  /catalog/:id     → CardDetailPage
  /afisha          → AfishaPage
  /announcements   → AnnouncementsPage
  /about           → AboutPage
  /login           → LoginPage
  /register        → RegisterPage        (обычная + предприниматель)
  /cabinet         → EntrepreneurCabinet (ProtectedRoute: entrepreneur|admin)
  /admin           → AdminPanel          (ProtectedRoute: admin)
  *                → NotFoundPage (404)
```

### Поток авторизации (Supabase)

```
signUp(email,pwd,{role, business fields})
   └─ supabase.auth.signUp()  ──►  auth.users
                                     └─ trigger/insert  ──►  profiles(role, ...)
onAuthStateChange ──► AuthContext {session,user,profile,role,loading}
   ├─ Header: показывает «Войти» ↔ имя/кабинет/выход по session
   ├─ ProtectedRoute: role-гейт (UX)
   └─ RLS: настоящая граница на чтение/запись
```

### Поток данных контента

```
initialData.ts ──(seed-миграция один раз)──► Supabase tables
UI ──► src/lib/api.ts ──► supabase-js ──► tables (RLS)
                       └─ фолбэк на initialData, если ключи не заданы
```

*Directional guidance, не спецификация реализации.*

---

## Output Structure (новые/ключевые файлы)

```
src/
  main.tsx                      # монтирование через vite-react-ssg (ViteReactSSG)
  routes.tsx                    # дерево маршрутов
  lib/
    supabase.ts                 # singleton-клиент
    api.ts                      # доступ к данным (projects/events/announcements)
    auth.tsx                    # AuthProvider + useAuth
  components/
    ui/                         # Button, Card, Input, Select, Badge, Modal, Popover
    layout/RootLayout.tsx       # Header+Outlet+Footer
    ProtectedRoute.tsx
    LanguagePicker.tsx          # chip + popover
  pages/
    MainPage / CatalogPage / CardDetailPage / AfishaPage /
    AnnouncementsPage / AboutPage / LoginPage / RegisterPage /
    EntrepreneurCabinet / AdminPanel / NotFoundPage
supabase/
  schema.sql                    # таблицы + RLS + is_admin()
  seed.sql (или seed.ts)        # сид из initialData
public/
  robots.txt
scripts/
  gen-sitemap.ts                # sitemap.xml на билде
docs/plans/2026-07-05-001-...-plan.md
```

*Структура — декларация ожидаемой формы, исполнитель вправе скорректировать раскладку.*

---

## Implementation Units

### U1. Дизайн-система: токены, примитивы, защита от регресса

**Goal.** Заложить единый визуальный язык, чтобы все последующие страницы стилизовались консистентно и не выглядели ИИ-сгенерированными.
**Requirements.** R3.
**Dependencies.** —
**Files.** `src/index.css` (перестроить `@theme`: радиусы, тени, нейтральная шкала, `brand`), `src/components/ui/{Button,Card,Input,Select,Badge,Modal,Popover}.tsx` (создать), `.eslintrc`/`scripts/lint-styles.mjs` (создать: бан запрещённых классов), `package.json` (lint-скрипт).
**Approach.** Определить семантические токены (радиусы sm/md/lg, `shadow-card`/`shadow-pop`, нейтраль 50–900, `brand`/`brand-fg`/`brand-muted`). Примитивы инкапсулируют токены. Скрипт-гард сканирует `src/**` и падает при `rounded-2xl|rounded-3xl|rounded-\[|shadow-2xl|from-.*-to-`. Заранее вычистить несуществующие классы (`w-4.5`, `h-4.5`, `opacity-3`, `gap-4.5`, `text-stone-850`, `text-stone-605`, `text-stone-350`, `p-4.5`, `w-7.5`).
**Patterns to follow.** Refactoring UI / shadcn-подход к токенам; Tailwind v4 `@theme`.
**Test scenarios.**
- Covers R3. Vitest/скрипт: `lint-styles` падает на файле с `rounded-2xl` и проходит на чистом.
- `npm run lint` (`tsc --noEmit`) зелёный после введения примитивов.
- Визуально (Playwright, позже в U11): кнопки/карточки на всех страницах имеют одинаковый радиус и тень.

### U2. Роутинг: react-router-dom, реальные URL, layout, 404

**Goal.** Заменить строковый section-switch настоящими маршрутами с URL.
**Requirements.** R5, R4 (страница каталога как маршрут).
**Dependencies.** U1.
**Files.** `package.json` (`react-router-dom`), `src/main.tsx`, `src/routes.tsx` (создать), `src/components/layout/RootLayout.tsx` (создать), `src/App.tsx` (демонтировать section-switch), все `src/components/*` → перевести навигацию на `<Link>`/`useNavigate`, `src/pages/NotFoundPage.tsx` (создать), `vercel.json` (создать: SPA-фолбэк до внедрения SSG в U10).
**Approach.** `RootLayout` = Header + `<Outlet/>` + Footer + `<ScrollRestoration/>`. Перенести компоненты в `src/pages/`. Заменить callbacks (`onSectionChange`, `onSelectProject`, `onOpenAddCardModal`, `onBack`) на роутерные переходы. Карточка: `/catalog/:id`, если проект не найден → 404, а не пустой экран. Убрать баг пустого экрана при неизвестной секции — теперь `*` ловит всё.
**Patterns to follow.** react-router v7 data router, вложенный layout-route.
**Test scenarios.**
- Covers R5. Открытие каждого URL напрямую рендерит нужную страницу (Playwright, U11).
- Неизвестный URL → 404-страница, не пустой экран.
- `/catalog/:id` с несуществующим id → 404.
- Кнопка «назад» браузера корректно переключает страницы.

### U3. Supabase: клиент, схема, RLS, сид-миграция контента

**Goal.** Реальный бэкенд для авторизации и контента.
**Requirements.** R6, R7.
**Dependencies.** —  (можно вести параллельно U1/U2)
**Prerequisite (от пользователя).** Создать бесплатный проект Supabase и передать `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (для локали — `.env.local`, для прода — env Vercel). До получения ключей код пишется и типизируется, но реально активируется после вставки ключей; фронт работает на офлайн-фолбэке из `initialData`.
**Files.** `package.json` (`@supabase/supabase-js`), `src/lib/supabase.ts` (создать), `supabase/schema.sql` (создать), `supabase/seed.ts` (создать), `src/lib/api.ts` (создать), `.env.example` (добавить VITE_-переменные), `src/initialData.ts` (оставить как источник сид/фолбэк).
**Approach.** `schema.sql`: таблицы `profiles`, `projects`, `events`, `announcements`; RLS — публичный `select` опубликованного, `insert/update` автором своей записи, модерация через `is_admin()` (`SECURITY DEFINER`). Триггер на `auth.users` создаёт `profiles` при регистрации. `api.ts` абстрагирует запросы и делает фолбэк на `initialData`, если клиент не сконфигурирован. `seed.ts` заливает текущие данные один раз.
**Approach note.** RLS — граница безопасности; клиентские проверки роли не заменяют её.
**Test scenarios.**
- Covers R7. Vitest: `api.ts` возвращает данные из `initialData`, когда env-переменные пусты (фолбэк).
- Covers R6. После применения `schema.sql` регистрация создаёт строку в `profiles` с корректной ролью (проверка в Supabase, U11 e2e).
- RLS: анонимный клиент не может обновить чужую карточку (негативный тест в Supabase).

### U4. AuthContext, сессия, роль, защита маршрутов, header по сессии

**Goal.** Подключить сессию Supabase ко всему приложению.
**Requirements.** R6, R9 (реальный выход).
**Dependencies.** U2, U3.
**Files.** `src/lib/auth.tsx` (создать: `AuthProvider`+`useAuth`), `src/components/ProtectedRoute.tsx` (создать), `src/components/layout/RootLayout.tsx` (обернуть в AuthProvider), `src/components/Header.tsx` (показ по сессии; заменить симулятор ролей), `src/pages/EntrepreneurCabinet.tsx` (реальный `Выйти`).
**Approach.** `AuthProvider`: `getSession()` + `onAuthStateChange`, тянет `profile` (роль). `ProtectedRoute` редиректит неавторизованного на `/login`, а роль-недостаточного — на главную. Header: гость → «Войти»/«Регистрация»; авторизованный → имя, «Мой кабинет»/«Админка», рабочий «Выйти» (`supabase.auth.signOut()`). Плавающий `RoleSimulatorBadge` и «демо-режим» удалить (или спрятать за флагом разработки).
**Approach note.** Убрать хардкод автора `asker-khakunov` — автор берётся из `user.id`/`profile`.
**Test scenarios.**
- Covers R6. Гость на `/cabinet` → редирект на `/login`.
- Entrepreneur на `/admin` → редирект на главную.
- `Выйти` завершает сессию и возвращает header в состояние гостя (U11 e2e).
- Vitest: хелпер выбора цели по роли (guest→/, entrepreneur→/cabinet, admin→/admin).

### U5. Экраны входа и регистрации (в т.ч. предприниматель)

**Goal.** Рабочие формы авторизации.
**Requirements.** R6, R9.
**Dependencies.** U4.
**Files.** `src/pages/LoginPage.tsx` (создать), `src/pages/RegisterPage.tsx` (создать), `src/components/ui/*` (переиспользовать), переводы в `src/LanguageContext.tsx` (ключи auth).
**Approach.** Login: email+пароль → `signInWithPassword`, ошибки, переход в кабинет/на главную. Register: базовые поля + переключатель «Я предприниматель» → доп. поля (название, категория, контакты) → `signUp` + запись в `profiles`. Валидация, состояния loading/ошибка/успех, ссылки между формами.
**Test scenarios.**
- Covers R6. Регистрация предпринимателя создаёт профиль с ролью `entrepreneur` и бизнес-полями.
- Неверный пароль → внятная ошибка, без падения.
- Успешный вход → редирект и обновлённый header.
- Пустые/невалидные поля → инлайн-валидация, submit заблокирован.

### U6. Каталог как отдельная страница (грид, фильтры, сортировка, поиск)

**Goal.** Полноценный масштабный каталог в духе Wildberries.
**Requirements.** R4.
**Dependencies.** U1, U2, U3 (данные).
**Files.** `src/pages/CatalogPage.tsx` (создать), `src/components/catalog/{ProductCard,FilterSidebar,SortControl,SearchBar}.tsx` (создать), `src/lib/api.ts` (запрос списка).
**Approach.** Двухколоночный layout: липкий сайдбар фильтров (десктоп) / bottom-sheet (мобайл) + грид `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5` c плотными гэпами. Карточка: изображение фикс. соотношения, тайтл в 2 строки (clamp), цена/`priceInfo`, рейтинг/бейдж, город. Фильтры: категория (чипы), город, поиск; живой счётчик результатов; «Сбросить всё». Состояние фильтров ↔ URL-query (`?q=&cat=&city=&sort=`), чтобы страница была шарабельной и индексируемой. Сортировка: по рейтингу/названию/новизне. Пагинация или «показать ещё».
**Patterns to follow.** Baymard product-list & filter best practices; Flowbite product cards.
**Test scenarios.**
- Covers R4. Vitest: функция фильтрации по (q, category, city, sort) даёт корректный набор на фикстурах.
- Грид показывает все подходящие карточки (не первые 5, как было), счётчик совпадает.
- Фильтр в URL восстанавливает состояние при перезагрузке (U11).
- Пустой результат → аккуратный empty-state с «Сбросить».
- Мобайл: фильтры открываются как bottom-sheet (U11).

### U7. Переключатель языков (chip+popover) и полное удаление балкарского

**Goal.** R1 + R2.
**Requirements.** R1, R2.
**Dependencies.** U1.
**Files.** `src/components/LanguagePicker.tsx` (создать), `src/components/Header.tsx` (заменить 2 сегментированных ряда), `src/LanguageContext.tsx` (убрать `krc` из типа, словаря, валидации localStorage), `src/pages/AboutPage.tsx` (инлайн-ветки `language === "kbd"`/`en` — привести к оставшимся языкам).
**Approach.** `LanguagePicker` — маленькая плашка (текущий язык + иконка), по клику `Popover` со списком ru/kbd/en, выбор закрывает попап и пишет в localStorage. Удалить блок `krc:` (строки словаря), значение из массивов языков, ветку валидации `saved === "krc"`, лейбл «БАЛК». Проверить, что `t()` и фолбэк на `ru` не ссылаются на `krc`.
**Test scenarios.**
- Covers R1. Grep/Vitest: строка `krc` отсутствует в `src/**`; `Language` union = `'ru'|'kbd'|'en'`.
- Covers R2. Клик по плашке открывает попап, выбор языка меняет тексты и закрывается (U11).
- Выбранный язык сохраняется после перезагрузки.
- Ранее сохранённый `krc` в localStorage не ломает старт (грациозный фолбэк на `ru`).

### U8. Рестайл и де-баг публичных страниц (Main, Detail, Header, Footer)

**Goal.** Привести витрину к дизайн-системе и починить все мёртвые кнопки/переходы.
**Requirements.** R3, R9.
**Dependencies.** U1, U2, U6.
**Files.** `src/pages/MainPage.tsx`, `src/pages/CardDetailPage.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`.
**Approach.** Перевести на токены/примитивы; унифицировать hex-регистр. Главная: hero + категории + «популярное» ведут в `/catalog` (не только скролл); «Смотреть все» → `/catalog`; поиск главной → переход в `/catalog?q=`. Detail: `similarProjects` фильтровать и по категории (сейчас баг — только по статусу); контакт-ссылки не подставлять junk-фолбэки (`79281234567`, `google.com`) — скрывать отсутствующие; убрать мёртвый `mapZoom`; захардкоженные cheese-specific блоки заменить данными проекта или скрыть. Footer: секция `entrepreneurs` → корректный маршрут `/cabinet` (был баг пустого экрана); плейсхолдер-ссылки помощи → реальные страницы или явные «скоро».
**Test scenarios.**
- Covers R9. Playwright (U11): каждая кнопка Main/Detail/Header/Footer ведёт в валидное место, нет пустых экранов.
- Detail: похожие проекты — той же категории.
- Detail: у проекта без whatsapp/website соответствующие кнопки скрыты, а не ведут на junk.
- Footer «Для предпринимателей» открывает кабинет/логин, не пустой экран.

### U9. Рестайл и де-баг кабинета, формы создания и админки

**Goal.** Привести дашборды/формы к дизайн-системе и сделать их реально рабочими.
**Requirements.** R3, R7, R9.
**Dependencies.** U1, U2, U3, U4.
**Files.** `src/pages/EntrepreneurCabinet.tsx`, `src/pages/CreateCardPage.tsx`, `src/pages/AdminPanel.tsx`.
**Approach.** Cabinet: починить мёртвую модалку (в `App.tsx` она была убита `setIsAddModalOpen={() => {}}` — завести настоящее состояние или увести на маршрут создания/редактирования); метрики считать из реальных данных автора, не хардкод (18/12/2/3); реальные кнопки edit/notification. CreateCard: перевести с инлайн-`style` на примитивы/токены; после `onCreateCard` — переход в кабинет + тост успеха (сейчас остаётся на форме); писать в Supabase. Admin: заменить фейковые числа (1,248/892/74) на вычисляемые из `statsList`; sidebar-ссылки `#afisha`/`#announcements` → реальные разделы; approve/reject писать статус в БД.
**Test scenarios.**
- Covers R9. Cabinet: кнопка добавления/редактирования открывает рабочую форму (не no-op).
- Covers R7. Создание карточки → появляется в списке кабинета и в БД со статусом «На проверке».
- CreateCard: после отправки — редирект в кабинет + подтверждение.
- Admin: approve меняет статус на «Опубликовано», карточка появляется в каталоге; отображаемые метрики совпадают с реальным количеством.

### U10. SEO: пре-рендер, метаданные, robots, sitemap, OG

**Goal.** Сделать все страницы реально индексируемыми.
**Requirements.** R8.
**Dependencies.** U2 (маршруты), желательно после U6–U9 (финальный контент страниц).
**Files.** `package.json` (`vite-react-ssg`), `src/main.tsx` (монтирование через `ViteReactSSG`), `vite.config.ts` (ssg-опции, список маршрутов), `src/pages/*` (нативные React 19 `<title>`/`<meta>`/OG), `public/robots.txt` (создать), `scripts/gen-sitemap.ts` (создать), `vercel.json` (обновить под статику из пре-рендера).
**Approach.** `vite-react-ssg` генерит статический HTML на каждый маршрут при `vite build`. Динамические маршруты каталога (`/catalog/:id`) — включить в список пре-рендера по id опубликованных проектов (из сид-данных/БД на билде). У каждой страницы уникальные title/description/OG. `robots.txt` разрешает индексацию + ссылка на sitemap. `gen-sitemap.ts` строит `sitemap.xml` из списка маршрутов на билде.
**Test scenarios.**
- Covers R8. После `vite build` в `dist/` присутствует отдельный `index.html` для `/`, `/catalog`, `/about` и т.д. с уникальным `<title>` в разметке (не пустой SPA-шелл).
- `curl` HTML маршрута содержит осмысленный контент без выполнения JS (проверка на проде, U11).
- `robots.txt` и `sitemap.xml` доступны и валидны; sitemap перечисляет все публичные маршруты.
- OG-теги присутствуют на главной и карточке.

### U11. Сквозная проверка живого сайта через Playwright MCP + фикс багов

**Goal.** Убедиться, что на проде всё работает и красиво; починить всё найденное.
**Requirements.** R9, R10 (и приёмка R1–R8).
**Dependencies.** U1–U10 (итеративно после каждого пуша).
**Files.** любые — по результатам прогона.
**Approach.** Рабочий цикл: правки → `git push` в `mamheg/sigup` → дождаться пересборки Vercel → открыть `https://sigup-blond.vercel.app/` в Playwright MCP → пройти каждую страницу и кнопку, десктоп (1280) и мобайл (390), снять скриншоты, проверить консоль на ошибки, залогировать баги → починить → повторить. Обойти особое: системный HTTP-прокси на локали (Playwright ходит на прод напрямую, прокси не использует).
**Test scenarios.**
- Covers R10. Прогон по всем маршрутам: главная, каталог (+фильтры/сортировка/поиск), карточка, афиша, объявления, о проекте, вход, регистрация (обычная и предприниматель), кабинет, админка, 404.
- Каждая интерактивная кнопка нажата и ведёт в валидное состояние; нет пустых экранов.
- Консоль браузера без ошибок на каждой странице.
- Мобильная раскладка: нет горизонтального скролла, фильтры-шит открывается, меню работает.
- Переключатель языков и выбор языка работают на живом сайте.

---

## System-Wide Impact — известные баги к устранению

| Баг | Где | Устраняется в |
|---|---|---|
| Мёртвая модалка кабинета (`setIsAddModalOpen={() => {}}`) | `App.tsx:179-180`, `EntrepreneurCabinet.tsx:561` | U9 |
| Невалидная секция `entrepreneurs` → пустой экран | `Footer.tsx:55` | U8 |
| CreateCard не уводит со страницы после submit | `CreateCardPage.tsx:91` | U9 |
| No-op «Выйти» (сбрасывает фильтр) | `EntrepreneurCabinet.tsx:290` | U4/U9 |
| Мёртвые кнопки: «Смотреть все» афиши, «Подробнее», «Связаться» | `MainPage.tsx:493,559,594` | U8 |
| Похожие проекты не фильтруются по категории | `CardDetailPage.tsx:48-50` | U8 |
| Junk-фолбэки контактов (`79281234567`, `google.com`) | `CardDetailPage.tsx:181,242` | U8 |
| Мёртвый `mapZoom`, cheese-specific хардкод | `CardDetailPage.tsx:26,359-513` | U8 |
| Фейковые метрики админки/кабинета | `AdminPanel.tsx:163-180`, `EntrepreneurCabinet.tsx:320-345` | U9 |
| Несуществующие Tailwind-классы (`w-4.5`, `opacity-3`, `text-stone-850`, `gap-4.5`) | по всему `src/**` | U1 |
| Верхний/нижний регистр hex вперемешку | по всему `src/**` | U1/U8/U9 |
| Нет реальной авторизации при наличии «Войти» | Header, Cabinet, Admin | U4/U5 |
| Пустой экран при неизвестной секции (нет fallback) | `App.tsx` | U2 |

---

## Dependencies / Prerequisites

- **Пользователь:** создать проект Supabase → выдать `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`; добавить их в env Vercel. (Блокирует только U3–U5; остальные треки идут независимо.)
- **Vercel:** проект уже подключён к `mamheg/sigup`, автодеплой на push в `main`.
- **Локально:** Playwright MCP установлен и подключён; браузер headless работает; системный HTTP-прокси учтён.
- **Новые npm-зависимости:** `react-router-dom`, `@supabase/supabase-js`, `vite-react-ssg`, `vitest` (dev).

---

## Risk Analysis & Mitigation

- **SSG + client-only библиотеки (motion, supabase).** Пре-рендер выполняет код на этапе билда без DOM/окна. Митигировать: гардить обращения к `window`/браузерным API, ленивая инициализация supabase-клиента, аккуратные `AnimatePresence`. Проверять `vite build` локально до пуша.
- **Supabase-ключи ещё не выданы.** Митигировать: слой `api.ts` с фолбэком на `initialData`, чтобы сайт оставался рабочим и деплоился зелёным до подключения БД. Auth-страницы показывают понятное сообщение, если бэкенд не сконфигурирован.
- **Задержка Vercel (1–2 мин) в цикле проверки.** Не открывать прод до завершения сборки; сверяться по времени последнего деплоя.
- **Объём de-styling может задеть поведение.** Митигировать: покомпонентные пуши + Playwright-проверка после каждого; изменения — только визуальные токены + явные баг-фиксы.
- **RLS-ошибки → утечка/блокировка.** Негативные тесты в Supabase; клиентские role-гейты только UX, граница — RLS.

---

## Operational / Rollout Notes

- **Цикл работы:** мелкие покомпонентные коммиты → `git push origin main` (автор `mamheg`) → Vercel билд → Playwright MCP на проде → фикс. Всегда есть точка отката (предыдущий коммит).
- **Порядок:** U1 → U2 → (U3 при наличии ключей) → U6/U7/U8/U9 (витрина и де-баг) → U4/U5 (auth) → U10 (SEO) → U11 (сквозной прогон, идёт итеративно на всём протяжении).
- **Откат:** `git reset --hard <sha> && git push --force origin main` к любому предыдущему рабочему состоянию.

---

## Sources & Research

- Wildberries/маркетплейс UX: Baymard — E-Commerce Product Lists & Filtering; Baymard — Filter UI Best Practices; Flowbite product cards.
- Анти-ИИ-вид: dev.to «How to fix the AI-generated look»; shadcn/ui theming; Tailwind border-radius docs; Refactoring UI принципы.
- SPA SEO на Vercel: Vercel — «How Google handles JavaScript…»; `vite-react-ssg` (GitHub); Ali Karaki — Vite+React CSR→SSG Lighthouse case study; LogRocket — React 19 Document Metadata; Google Search Central — JS SEO basics.
- Supabase auth: Supabase — Use Supabase Auth with React (quickstart); Supabase — Token Security & RLS; RapidDev — Protect Admin Routes (profiles + role RLS).
