# SiGup — деплой на любой сервер

Всё приложение (Postgres + API + фронтенд) поднимается одной командой через Docker.

## Требования
- Linux-сервер с Docker 24+ и docker compose v2 (`apt install docker.io docker-compose-v2`)

## Запуск (5 шагов)

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

Миграции БД и сид (категории, стартовые данные, админ из `ADMIN_EMAIL`/`ADMIN_PASSWORD`)
выполняются автоматически при старте api-контейнера. Сид идемпотентен.

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
