#!/usr/bin/env bash
# nginx + Let's Encrypt for barbershop domain → PM2 barbershop on :3000
# Run on the Hetzner host as root (alongside PetPal's petpal.com.cy vhost):
#   cd ~/barbershop && sudo bash scripts/setup-nginx-domain.sh
set -euo pipefail

DOMAIN="${BARBERSHOP_DOMAIN:-thetempleofmen.com}"
WWW="${BARBERSHOP_WWW:-www.thetempleofmen.com}"
UPSTREAM_PORT="${HTTP_PORT:-3000}"
EMAIL="${BARBERSHOP_LETSENCRYPT_EMAIL:-techmastercy1@gmail.com}"

log() { printf '[setup-nginx] %s\n' "$*"; }

if [ "$(id -u)" -ne 0 ]; then
  log "Re-run with sudo: sudo bash scripts/setup-nginx-domain.sh"
  exit 1
fi

log "Installing nginx + certbot (if missing)"
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y nginx certbot python3-certbot-nginx

SITE="/etc/nginx/sites-available/${DOMAIN}"
log "Writing $SITE"
cat > "$SITE" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${WWW};

    location / {
        proxy_pass http://127.0.0.1:${UPSTREAM_PORT};
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

ln -sf "$SITE" "/etc/nginx/sites-enabled/${DOMAIN}"
nginx -t
systemctl enable nginx
systemctl reload nginx

log "Opening firewall (ufw) for web"
if command -v ufw >/dev/null 2>&1; then
  ufw allow 22/tcp || true
  ufw allow 80/tcp || true
  ufw allow 443/tcp || true
  ufw --force enable || true
fi

log "Requesting TLS certificate for ${DOMAIN} and ${WWW}"
certbot --nginx -d "$DOMAIN" -d "$WWW" --non-interactive --agree-tos -m "$EMAIL" --redirect

log "Done. Test:"
log "  curl -sI https://${DOMAIN} | head -3"
log ""
log "Ensure .env.local has NEXT_PUBLIC_APP_URL=https://${DOMAIN}"
log "then: cd ~/barbershop && bash scripts/deploy-server.sh"
