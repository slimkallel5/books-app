#!/usr/bin/env bash
#
# One-shot local database setup for Maktaba.
#
# Creates the PostgreSQL role and the app + test databases (idempotently),
# fixes ownership if a previous run created the tables as another role,
# then runs migrations and seeds the 12 template books.
#
# Usage:
#   npm run db:setup
#   # or: bash scripts/setup-db.sh
#
# Superuser access: by default this runs psql via `sudo -u postgres`.
# Override with:
#   PG_SUPERUSER=myuser        # the superuser role name (default: postgres)
#   PSQL_SUPER='psql -U admin' # a full command to run psql as a superuser
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
ENV_FILE="$ROOT_DIR/.env"
PG_SUPERUSER="${PG_SUPERUSER:-postgres}"

log()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31merror:\033[0m %s\n' "$*" >&2; exit 1; }

command -v psql >/dev/null 2>&1 || die "psql not found. Install the PostgreSQL client tools first."

# --- read a KEY from .env without sourcing it ---------------------------------
read_env() {
  local key="$1" default="${2-}" val=""
  if [ -f "$ENV_FILE" ]; then
    val="$(grep -E "^[[:space:]]*${key}=" "$ENV_FILE" | tail -n1 | sed -E "s/^[[:space:]]*${key}=//")"
    val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
  fi
  printf '%s' "${val:-$default}"
}

# --- parse postgres://user:pass@host:port/db ---------------------------------
parse_url() {
  local url="$1"
  local rest="${url#*://}"
  local creds="${rest%%@*}"
  local hostpart="${rest##*@}"
  DB_USER="${creds%%:*}"
  if [ "$creds" = "${creds%%:*}" ]; then DB_PASS=""; else DB_PASS="${creds#*:}"; fi
  DB_NAME="${hostpart#*/}"
  local hostport="${hostpart%%/*}"
  DB_HOST="${hostport%%:*}"
  if [ "$hostport" = "${hostport%%:*}" ]; then DB_PORT="5432"; else DB_PORT="${hostport##*:}"; fi
}

# --- run psql as a superuser -------------------------------------------------
run_super() {
  if [ -n "${PSQL_SUPER:-}" ]; then
    # shellcheck disable=SC2086
    $PSQL_SUPER "$@"
  elif [ "$(id -un)" = "$PG_SUPERUSER" ]; then
    psql "$@"
  else
    # Run from / so sudo does not warn about an unreadable working directory.
    ( cd / && sudo -u "$PG_SUPERUSER" psql "$@" )
  fi
}

# Bootstrap .env from the example if the developer has not created one yet.
if [ ! -f "$ENV_FILE" ] && [ -f "$ROOT_DIR/.env.example" ]; then
  cp "$ROOT_DIR/.env.example" "$ENV_FILE"
  log "Created .env from .env.example (edit it to change credentials)."
fi

DATABASE_URL="$(read_env DATABASE_URL 'postgres://maktaba:maktaba@127.0.0.1:5432/maktaba')"
TEST_DATABASE_URL="$(read_env TEST_DATABASE_URL 'postgres://maktaba:maktaba@127.0.0.1:5432/maktaba_test')"

parse_url "$DATABASE_URL";       APP_USER="$DB_USER"; APP_PASS="$DB_PASS"; APP_DB="$DB_NAME"
parse_url "$TEST_DATABASE_URL";  TEST_USER="$DB_USER"; TEST_PASS="$DB_PASS"; TEST_DB="$DB_NAME"

log "Application database : ${APP_DB}  (role: ${APP_USER})"
log "Test database        : ${TEST_DB} (role: ${TEST_USER})"

# --- create / update the role ------------------------------------------------
log "Creating role '${APP_USER}' (or updating its password)…"
esc_pass="${APP_PASS//\'/\'\'}"
esc_user="${APP_USER//\"/\"\"}"
run_super -v ON_ERROR_STOP=1 -q -d postgres -c "
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${esc_user}') THEN
      CREATE ROLE \"${esc_user}\" LOGIN PASSWORD '${esc_pass}';
    ELSE
      ALTER ROLE \"${esc_user}\" WITH LOGIN PASSWORD '${esc_pass}';
    END IF;
  END
  \$\$;
"

# --- create each database (idempotent) ---------------------------------------
ensure_db() {
  local db="$1" owner="$2"
  local exists
  exists="$(run_super -tAc "SELECT 1 FROM pg_database WHERE datname = '${db}'" -d postgres || true)"
  if [ "$exists" = "1" ]; then
    log "Database '${db}' already exists — ensuring ownership and privileges…"
    # Fix the common trap: tables were created earlier by another role
    # (e.g. postgres), which blocks migrations that need table ownership.
    run_super -v ON_ERROR_STOP=1 -q -d "$db" \
      -c "ALTER DATABASE \"${db}\" OWNER TO \"${owner}\";" \
      -c "REASSIGN OWNED BY postgres TO \"${owner}\";" \
      -c "GRANT ALL ON SCHEMA public TO \"${owner}\";" \
      -c "ALTER SCHEMA public OWNER TO \"${owner}\";"
  else
    log "Creating database '${db}' owned by '${owner}'…"
    run_super -v ON_ERROR_STOP=1 -q -d postgres -c "CREATE DATABASE \"${db}\" OWNER \"${owner}\";"
  fi
}

ensure_db "$APP_DB" "$APP_USER"
ensure_db "$TEST_DB" "$TEST_USER"

# --- migrate + seed ----------------------------------------------------------
log "Running migrations…"
npm run db:migrate

log "Seeding data…"
npm run db:seed

cat <<EOF

$(printf '\033[1;32m✓ Database ready.\033[0m')

  App DB : ${APP_DB}
  Test DB: ${TEST_DB}

Next steps:
  npm run dev:api      # start the API on http://localhost:4000
  npm run dev:web      # start the web app on http://localhost:5173
EOF
