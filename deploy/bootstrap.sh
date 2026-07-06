#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  SiGup — разворот на ЧИСТОМ Ubuntu/Debian сервере одной командой.
#
#  Что делает:
#    1. ставит Docker + docker compose, если их нет;
#    2. создаёт deploy/.env с авто-генерацией паролей (если .env ещё нет);
#    3. собирает и поднимает весь стек (Postgres + API + фронтенд);
#    4. дожидается готовности и печатает адрес сайта и данные админа.
#
#  Запуск (из корня репозитория):
#      bash deploy/bootstrap.sh
#  Скрипт сам поднимет права через sudo, если нужно.
# ─────────────────────────────────────────────────────────────
set -euo pipefail

# — поднять права, если запущено не от root —
if [ "$(id -u)" -ne 0 ]; then
  echo "▶ Нужны права root — перезапускаю через sudo…"
  exec sudo -E bash "$0" "$@"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"   # → deploy/

say()  { printf '\n\033[1;36m%s\033[0m\n' "$*"; }
ok()   { printf '\033[1;32m✓ %s\033[0m\n' "$*"; }

# ── 1. Docker ────────────────────────────────────────────────
if command -v docker >/dev/null 2>&1; then
  ok "Docker уже установлен ($(docker --version | awk '{print $3}' | tr -d ,))"
else
  say "Docker не найден — устанавливаю официальным скриптом…"
  curl -fsSL https://get.docker.com | sh
  ok "Docker установлен"
fi

if ! docker compose version >/dev/null 2>&1; then
  say "Ставлю плагин docker compose…"
  apt-get update -y && apt-get install -y docker-compose-plugin
fi
systemctl enable --now docker >/dev/null 2>&1 || true
ok "docker compose: $(docker compose version --short 2>/dev/null || echo v2)"

# ── 2. .env (секреты) ────────────────────────────────────────
rnd() { openssl rand -base64 24 2>/dev/null | tr -dc 'A-Za-z0-9' | cut -c1-24 || head -c18 /dev/urandom | base64 | tr -dc 'A-Za-z0-9'; }

if [ -f .env ]; then
  ok "deploy/.env уже существует — использую его (пароли не меняю)"
  ADMIN_EMAIL="$(grep -E '^ADMIN_EMAIL='   .env | cut -d= -f2- || true)"
  ADMIN_PW="$(grep    -E '^ADMIN_PASSWORD=' .env | cut -d= -f2- || true)"
  WEB_PORT="$(grep    -E '^WEB_PORT='       .env | cut -d= -f2- || echo 80)"
else
  say "Создаю deploy/.env и генерирую пароли…"
  ADMIN_EMAIL="admin@sigup.ru"
  ADMIN_PW="$(rnd)"
  PG_PW="$(rnd)"
  WEB_PORT="80"
  SERVER_IP="$(curl -fsS4 --max-time 4 https://ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
  cat > .env <<EOF
# ── SiGup .env (сгенерирован bootstrap.sh $(date +%F)) ──
POSTGRES_PASSWORD=${PG_PW}

# Админ платформы (создаётся при первом старте)
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PW}

# SMTP — заполни, чтобы работало подтверждение email при регистрации.
# Пусто = сайт работает, но саморегистрация пользователей недоступна.
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=SiGup <noreply@sigup.ru>

# Сеть
WEB_PORT=${WEB_PORT}
CORS_ORIGINS=http://localhost,http://${SERVER_IP}
SITE_URL=http://${SERVER_IP}
EOF
  chmod 600 .env
  ok ".env создан (права 600)"
fi

# ── 3. Сборка и запуск ───────────────────────────────────────
say "Собираю образы и поднимаю стек (первый билд ~2–4 мин)…"
docker compose up -d --build

# ── 4. Ожидание готовности ───────────────────────────────────
say "Жду готовности API…"
HEALTHY=0
for _ in $(seq 1 40); do
  if curl -fsS "http://localhost:${WEB_PORT}/api/health" >/dev/null 2>&1; then
    HEALTHY=1; break
  fi
  sleep 3
done

IP="$(curl -fsS4 --max-time 4 https://ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo
if [ "$HEALTHY" -eq 1 ]; then
  ok "Стек поднят и отвечает."
else
  printf '\033[1;33m⚠ API пока не ответил на /api/health. Проверь: docker compose logs -f api\033[0m\n'
fi

cat <<EOF

────────────────────────────────────────────
  SiGup развёрнут 🎉

  Сайт:        http://${IP}${WEB_PORT:+$( [ "$WEB_PORT" = 80 ] && echo "" || echo ":$WEB_PORT" )}/
  Админка:     http://${IP}${WEB_PORT:+$( [ "$WEB_PORT" = 80 ] && echo "" || echo ":$WEB_PORT" )}/admin
  Логин:       ${ADMIN_EMAIL}
  Пароль:      ${ADMIN_PW}
               (хранится в deploy/.env)

  Дальше:
    • почта (регистрация): впиши SMTP_* в deploy/.env → docker compose restart api
    • HTTPS/домен:         см. deploy/DEPLOY.md, раздел «HTTPS»
    • логи:                docker compose logs -f api
────────────────────────────────────────────
EOF
