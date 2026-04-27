# AFK Waitlist Page

Vite + React waitlist signup for the AFK Chrome Extension. Saves leads to Supabase.

## Quick Start

npm install
npm run dev

## Supabase — Run this SQL first

create table public.waitlist (
  id           bigserial primary key,
  name         text        not null,
  email        text        not null unique,
  phone        text        not null,
  country_code text        not null,
  country      text        not null,
  source       text        default 'afk-waitlist',
  referral     text        default null,
  created_at   timestamptz default now()
);
alter table public.waitlist enable row level security;
create policy "Allow public insert"
  on public.waitlist for insert to anon with check (true);

## Env vars (.env)

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx

## Deploy (Vercel)

npx vercel  — then add env vars in dashboard.

## Validation

Name  : Required, 2-80 chars, letters/spaces/hyphens only
Email : Required, valid format, max 254 chars
Phone : Required, digits only, length validated per country code
Dupe email -> friendly "already on waitlist" message
