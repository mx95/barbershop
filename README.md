# barbershop

Premium barbershop website for **The Temple Of Men** — Xylophagou, Larnaca, Cyprus.

Built with Next.js, TypeScript, Tailwind CSS, Shadcn UI, and Supabase.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS v4
- Shadcn UI
- Supabase (auth, database, booking)
- Framer Motion

## Features

- Online booking with real services and pricing from [Setmore](https://thetempleofmen.setmore.com)
- Customer accounts, visit history, and loyalty rewards
- Barber dashboard and QR appointment check-in
- Email / SMS / birthday reminders (Resend + Twilio)

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Add keys to `.env.local` (see `.env.example`)

## Production deploy (Hetzner — same server as PetPal)

Barbershop runs on **port 3000** via PM2 (`barbershop` app). PetPal uses port 5002 — no conflict.

### One-time server setup

```bash
ssh root@116.203.209.68
git clone https://github.com/mx95/barbershop.git /root/barbershop
cd /root/barbershop
cp .env.example .env.local   # configure keys and NEXT_PUBLIC_APP_URL
bash scripts/deploy-server.sh
pm2 save
```

Optional HTTPS (after DNS points to the server):

```bash
sudo bash scripts/setup-nginx-domain.sh
```

### Manual deploy

```bash
cd /root/barbershop && bash scripts/deploy-server.sh
```

Or from the repo root: `npm run deploy:prod`

### GitHub Actions (auto-deploy on push to `main`)

Add these repository secrets (same values as PetPal):

- `DEPLOY_HOST` — `116.203.209.68`
- `DEPLOY_USER` — `root`
- `DEPLOY_SSH_KEY` — SSH private key for the server
- `DEPLOY_PATH` (optional) — `/root/barbershop`

## Repository

```bash
git remote -v
# origin  git@github.com:mx95/barbershop.git
```

When you are ready to publish:

```bash
git push -u origin main
```

## License

Private — The Temple Of Men
