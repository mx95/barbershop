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
