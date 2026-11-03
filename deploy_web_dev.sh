#!/usr/bin/env bash
# Deploy Zaam B2B Portal DEV (Next.js) to Zaam Hostinger VPS.
#
# Portal: https://b2b-dev.zaamaitech.co.uk
# API:    https://erp-api-dev.zaamaitech.co.uk/api/b2b
# Edge: Traefik → PM2 Next.js on 127.0.0.1:4022
# Auth: ~/.ssh/id_ed25519_hostinger
#
# Uses rsync of local tree (like panels-dev), not git reset — ships uncommitted local work.
# Does NOT touch prod /var/www/zaam-b2b-portal or PM2 zaam-b2b / :4012.
#
# Usage (from Zaam_website/): ./deploy_web_dev.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

ssh_user="${SSH_USER:-root}"
ssh_host="${SSH_HOST:-153.92.209.187}"
ssh_key="${SSH_KEY:-$HOME/.ssh/id_ed25519_hostinger}"
app_dir="${APP_DIR:-/var/www/zaam-b2b-portal-dev}"
process_name="${PROCESS_NAME:-zaam-b2b-dev}"
api_port="${PORT:-4022}"
domain="${WEB_DOMAIN:-b2b-dev.zaamaitech.co.uk}"
traefik_dir="${TRAEFIK_DIR:-/docker/traefik-xtyj}"
traefik_file="zaam-b2b-dev.yml"
next_public_zaam_api_url="${NEXT_PUBLIC_ZAAM_API_URL:-https://erp-api-dev.zaamaitech.co.uk/api/b2b}"
portal_origin="https://${domain}"
# DEV API env to update B2B_WEBSITE_URL (never touch prod zaam-api)
dev_api_env="${DEV_API_ENV:-/var/www/zaam-api-dev/.env}"
dev_api_pm2="${DEV_API_PM2:-zaam-api-dev}"

ssh_target="${ssh_user}@${ssh_host}"
ssh_base_opts=(-o StrictHostKeyChecking=accept-new -o ConnectTimeout=20 -i "$ssh_key" -o IdentitiesOnly=yes -o BatchMode=yes)

log() { printf '==> %s\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

[[ -f "$ssh_key" ]] || die "SSH key not found: ${ssh_key}"

remote() {
  ssh "${ssh_base_opts[@]}" "$ssh_target" "$@"
}

ensure_traefik_proxy() {
  # Only put LIVE Host() for DNS that already points here (ACME).
  local resolved
  resolved="$(dig +short "${domain}" A @8.8.8.8 | tail -1)"
  local target_dir="${traefik_dir}/dynamic"
  if [[ "${resolved}" != "${ssh_host}" ]]; then
    log "WARN: ${domain} resolves to '${resolved:-nothing}', not ${ssh_host} — staging the route only."
    target_dir="${traefik_dir}/dynamic-staged"
  else
    log "DNS OK (${domain} → ${resolved}); writing LIVE Traefik route."
  fi
  log "Writing Traefik ${target_dir}/${traefik_file} (https://${domain} → 127.0.0.1:${api_port})…"
  remote "set -euo pipefail
mkdir -p '${traefik_dir}/dynamic' '${traefik_dir}/dynamic-staged'
cat > '${target_dir}/${traefik_file}' <<'YAML'
http:
  routers:
    zaam-b2b-dev:
      rule: Host(\`${domain}\`)
      entryPoints:
        - websecure
      tls:
        certResolver: letsencrypt
      service: zaam-b2b-dev
      priority: 10
    zaam-b2b-dev-http:
      rule: Host(\`${domain}\`)
      entryPoints:
        - web
      middlewares:
        - zaam-b2b-dev-https-redirect
      service: zaam-b2b-dev
      priority: 10
  middlewares:
    zaam-b2b-dev-https-redirect:
      redirectScheme:
        scheme: https
        permanent: true
  services:
    zaam-b2b-dev:
      loadBalancer:
        servers:
          - url: http://127.0.0.1:${api_port}
YAML
grep -q 'Host(\`${domain}\`)' '${target_dir}/${traefik_file}' || { echo 'Host() rule is empty — heredoc expansion broke' >&2; exit 1; }
if [[ '${target_dir}' == '${traefik_dir}/dynamic' ]]; then
  cd '${traefik_dir}'
  docker compose up -d
fi
"
}

rsync_source() {
  log "Rsyncing B2B portal source to ${app_dir}…"
  remote "mkdir -p '${app_dir}'"
  rsync -az --delete \
    --exclude node_modules \
    --exclude .git \
    --exclude .next \
    --exclude .env \
    --exclude .env.local \
    --exclude .env.production \
    --exclude '.DS_Store' \
    -e "ssh ${ssh_base_opts[*]}" \
    "$SCRIPT_DIR/" "${ssh_target}:${app_dir}/"
}

ensure_server_env() {
  log "Writing DEV env on server (PORT 4022 + DEV API URL)…"
  remote "set -euo pipefail
mkdir -p '${app_dir}'
cat > '${app_dir}/.env' <<EOF
NODE_ENV=production
PORT=${api_port}
HOSTNAME=127.0.0.1
NEXT_PUBLIC_ZAAM_API_URL=${next_public_zaam_api_url}
NEXT_PUBLIC_SITE_URL=${portal_origin}
NEXT_PUBLIC_ALLOW_MOCK=false
EOF
cp -a '${app_dir}/.env' '${app_dir}/.env.production'
cp -a '${app_dir}/.env' '${app_dir}/.env.local'
chmod 600 '${app_dir}/.env' '${app_dir}/.env.production' '${app_dir}/.env.local'
grep -E '^(NODE_ENV|PORT|HOSTNAME|NEXT_PUBLIC_ZAAM_API_URL|NEXT_PUBLIC_SITE_URL|NEXT_PUBLIC_ALLOW_MOCK)=' '${app_dir}/.env'
"
}

ensure_dev_api_b2b_url() {
  log "Ensuring DEV API B2B_WEBSITE_URL=${portal_origin} (zaam-api-dev only)…"
  remote "set -euo pipefail
api_env='${dev_api_env}'
if [ ! -f \"\$api_env\" ]; then
  echo 'WARN: ${dev_api_env} missing; skip B2B_WEBSITE_URL update'
  exit 0
fi
if grep -q '^B2B_WEBSITE_URL=' \"\$api_env\"; then
  sed -i 's|^B2B_WEBSITE_URL=.*|B2B_WEBSITE_URL=${portal_origin}|' \"\$api_env\"
else
  printf '\nB2B_WEBSITE_URL=${portal_origin}\n' >> \"\$api_env\"
fi
grep '^B2B_WEBSITE_URL=' \"\$api_env\"
if pm2 describe '${dev_api_pm2}' >/dev/null 2>&1; then
  pm2 restart '${dev_api_pm2}' --update-env
fi
"
}

build_and_restart() {
  log "Building Next.js on server and restarting PM2 (${process_name})…"
  remote "set -euo pipefail
cd '${app_dir}'
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi
npm run build
mkdir -p logs

if pm2 describe '${process_name}' >/dev/null 2>&1; then
  pm2 delete '${process_name}' >/dev/null || true
fi
PORT='${api_port}' HOSTNAME=127.0.0.1 pm2 start npm --name '${process_name}' --time -- start -- -H 127.0.0.1 -p ${api_port}
pm2 save
"
}

health_checks() {
  log "Waiting for local health on :${api_port}…"
  remote "set -e
for i in \$(seq 1 90); do
  code=\$(curl -sS -o /dev/null -w '%{http_code}' --connect-timeout 2 'http://127.0.0.1:${api_port}/' || echo 000)
  case \"\$code\" in
    200|301|302|307|308) echo \"Local OK (HTTP \$code)\"; exit 0 ;;
  esac
  sleep 1
done
echo 'Local web failed to become ready' >&2
pm2 logs '${process_name}' --lines 40 --nostream || true
exit 1
"

  log "Checking public HTTPS https://${domain}/ …"
  sleep 5
  local code=000
  for _ in $(seq 1 18); do
    code="$(curl -sS -o /dev/null -w '%{http_code}' --connect-timeout 25 "https://${domain}/" || echo 000)"
    case "$code" in
      200|301|302|307|308) break ;;
    esac
    sleep 5
  done
  case "$code" in
    200|301|302|307|308) log "Public HTTPS OK (HTTP ${code})." ;;
    *) log "WARN: public HTTPS returned HTTP ${code} (cert may still be issuing, or DNS not yet pointed here)." ;;
  esac

  log "Checking login page…"
  login_code="$(curl -sS -o /dev/null -w '%{http_code}' --connect-timeout 25 "https://${domain}/login" || echo 000)"
  log "Login page → HTTP ${login_code}"

  log "Checking DEV B2B API reachable…"
  api_root="${next_public_zaam_api_url%/b2b}"
  api_code="$(curl -sS -o /dev/null -w '%{http_code}' --connect-timeout 15 "$api_root" || echo 000)"
  log "API ${api_root} → HTTP ${api_code}"

  remote "grep -R 'erp-api-dev.zaamaitech.co.uk/api/b2b' '${app_dir}/.next' >/dev/null 2>&1 && echo 'Build embeds DEV API URL' || echo 'WARN: DEV API URL string not found in .next (check NEXT_PUBLIC_* at build time)'"

  log "B2B DEV deploy complete."
  log "Portal: ${portal_origin}"
  log "API:    ${next_public_zaam_api_url}"
  log "PM2:    ${process_name} :${api_port}"
}

[[ "${1:-}" == "--help" ]] && { sed -n '2,16p' "$0"; exit 0; }

ensure_traefik_proxy
rsync_source
ensure_server_env
ensure_dev_api_b2b_url
build_and_restart
health_checks
