import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error("Missing Supabase env vars. Check your .env file.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/*
  ─────────────────────────────────────────────────────────────
  Run this SQL in your Supabase SQL Editor to create the table:
  ─────────────────────────────────────────────────────────────

  create table public.waitlist (
    id           bigserial primary key,
    name         text        not null,
    email        text        not null unique,
    phone        bigint      not null,
    country_code text        not null,
    country      text        not null,
    created_at   timestamptz default now(),
    updated_at   timestamptz default now()
  );

  -- Enable Row Level Security
  alter table public.waitlist enable row level security;

  -- Allow anonymous inserts (for the waitlist form)
  create policy "Allow public insert"
    on public.waitlist for insert
    to anon
    with check (true);

  ─────────────────────────────────────────────────────────────
*/
