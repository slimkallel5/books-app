#!/usr/bin/env bash
#
# Tear down the Maktaba databases.
#
# Drops the app and test databases (terminating any open connections first)
# and, unless KEEP_ROLE=1, drops the application role as well.
#
# Usage:
#   npm run db:teardown
#   # or: bash scripts/teardown-db.sh
#
# Options:
#   KEEP_ROLE=1   # keep the role, drop only the databases
#
# Superuser access: same as setup-db.sh — defaults to `sudo -u postgres`.
# Override with PG_SUPERUSER=<name> or PSQL_SUPER='psql -U <user>'.
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
ENV_FILE="$ROOT_DIR/.env"
PG_SUPERUSER="${PG_SUPERUSER:-postgres}"
KEEP_ROLE="${KEEP_ROLE:-0}"

log()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31merror:\033[0m %s\n' "$*" >&2; exit 1; }

command -v psql >/dev/null 2>&1 || die "psql not found. Install the PostgreSQL client tools first."

read_env() {
  local key="$1" default="${2-}" val=""
  if [ -f "$ENV_FILE" ]; then
    val="$(grep -E "^[[:space:]]*${key}=" "$ENV_FILE" | tail -n1 | sed -E "s/^[[:space:]]*${key}=//")"
    val="${val%\"}"; val="${val#\"}"; val="${val%\'}"; val="${val#\'}"
  fi
  printf '%s' "${val:-$default}"
}

parse_url() {
  local url="$1"
  local rest="${url#*://}"
  local creds="${rest%%@*}"
  local hostpart="${rest##*@}"
  DB_USER="${creds%%:*}"
  DB_NAME="${hostpart#*/}"
}

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

DATABASE_URL="$(read_env DATABASE_URL 'postgres://maktaba:maktaba@127.0.0.1:5432/maktaba')"
TEST_DATABASE_URL="$(read_env TEST_DATABASE_URL 'postgres://maktaba:maktaba@127.0.0.1:5432/maktaba_test')"

parse_url "$DATABASE_URL";      APP_USER="$DB_USER"; APP_DB="$DB_NAME"
parse_url "$TEST_DATABASE_URL"; TEST_DB="$DB_NAME"

log "Will drop databases: ${APP_DB}, ${TEST_DB}"
[ "$KEEP_ROLE" = "1" ] || log "Will drop role      : ${APP_USER}"

drop_db() {
  local db="$1"
  log "Terminating connections to '${db}'…"
  run_super -q -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${db}' AND pid <> pg_backend_pid();" \
    >/dev/null || true
  log "Dropping database '${db}'…"
  run_super -v ON_ERROR_STOP=1 -q -d postgres -c "DROP DATABASE IF EXISTS \"${db}\";"
}

drop_db "$APP_DB"
drop_db "$TEST_DB"

if [ "$KEEP_ROLE" != "1" ]; then
  role_exists="$(run_super -tAc "SELECT 1 FROM pg_roles WHERE rolname = '${APP_USER}'" -d postgres || true)"
  if [ "$role_exists" = "1" ]; then
    log "Dropping role '${APP_USER}'…"
    # Ownership is dropped with the databases above; DROP OWNED clears anything left.
    run_super -v ON_ERROR_STOP=1 -q -d postgres \
      -c "DROP OWNED BY \"${APP_USER}\";" \
      -c "DROP ROLE IF EXISTS \"${APP_USER}\";"
  else
    log "Role '${APP_USER}' does not exist — nothing to drop."
  fi
fi

printf '\n\033[1;32m✓ Teardown complete.\033[0m\n'
