# SiGup — деплой на любой сервер

Всё приложение (Postgres + API + фронтенд) поднимается через Docker. Миграции БД
и сид (категории, стартовые данные, админ) запускаются автоматически при старте
api-контейнера — вручную ничего накатывать не нужно.

## 🚀 Чистый сервер — 2 команды

На совершенно новом Ubuntu/Debian, где ничего не установлено (даже Docker):

```bash
git clone https://github.com/mamheg/sigup.git && cd sigup
bash deploy/bootstrap.sh
```

`bootstrap.sh` сам: поставит Docker, сгенерирует пароли в `deploy/.env`, соберёт и
поднимет весь стек, дождётся готовности и напечатает адрес сайта + пароль админа.
Скрипт идемпотентен: повторный запуск ничего не ломает и пароли не меняет.

После — открой `http://<ip-сервера>/`. Всё работает по HTTP на порту 80.
Для почты (подтверждение регистрации) впиши `SMTP_*` в `deploy/.env` и
`docker compose restart api`. Для домена и HTTPS — см. раздел ниже.

---

## Ручной запуск (если Docker уже стоит)

```bash
# 1. Склонировать репозиторий
git clone https://github.com/mamheg/sigup.git && cd sigup/deploy

# 2. Создать .env из примера и заполнить
cp ../.env.example .env
nano .env        # POSTGRES_PASSWORD, ADMIN_*, SMTP_* — обязательно

# 3. Собрать и запустить
docker compose up -d --build

# 4. Проверить
docker compose ps                    # все сервисы healthy
curl http://localhost/api/health     # {"status":"ok",...}

# 5. Открыть сайт: http://<ip-сервера>/  (порт меняется через WEB_PORT в .env)
```

Требования для ручного пути: Docker 24+ и docker compose v2
(`apt install docker.io docker-compose-v2`).

## Обновление

```bash
cd sigup && git pull && cd deploy && docker compose up -d --build
```

## Бэкапы

```bash
# База
docker compose exec db pg_dump -U sigup sigup > backup_$(date +%F).sql
# Загруженные фото
docker run --rm -v sigup_uploads:/u -v $PWD:/out alpine tar czf /out/uploads_$(date +%F).tgz -C /u .
```

## HTTPS

Compose слушает HTTP на `WEB_PORT` (по умолчанию 80). TLS вешается внешним
реверс-прокси сервера (Caddy / certbot+nginx / Traefik) поверх этого порта —
пример с Caddy:

```
sigup.example.com {
    reverse_proxy 127.0.0.1:80
}
```

После включения HTTPS добавь домен в `CORS_ORIGINS` в `.env` и перезапусти api.

## Письма (коды подтверждения)

SMTP-параметры в `.env` (`SMTP_HOST/PORT/USER/PASSWORD/FROM`). Для лучшей
доставляемости настрой SPF-запись домена отправителя. Без SMTP регистрация
не сможет подтверждать email (в проде фолбэк с кодом в ответе отключён).

## Логи и диагностика

```bash
docker compose logs -f api     # логи бэкенда
docker compose logs -f web     # nginx
docker compose restart api     # перезапуск после смены .env
```
