-- ==============================================================================
-- GharYahan Migration: Add email to public.profiles & update trigger
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Add email column to public.profiles if it does not exist
alter table public.profiles add column if not exists email text;

-- 2. Backfill email for existing profiles from auth.users
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and (p.email is null or p.email = '');

-- 3. Update the handle_new_user trigger to include email on new signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phone, whatsapp_number, cnic, role, area, city)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1), 'User'),
    new.email,
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(coalesce(new.raw_user_meta_data->>'whatsapp_number', new.raw_user_meta_data->>'phone'), ''),
    nullif(new.raw_user_meta_data->>'cnic', ''),
    case 
      when new.raw_user_meta_data->>'role' = 'landlord' then 'landlord'
      else 'tenant'
    end,
    coalesce(nullif(new.raw_user_meta_data->>'area', ''), 'Gulshan, Karachi'),
    coalesce(nullif(new.raw_user_meta_data->>'city', ''), 'Karachi')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = coalesce(excluded.email, public.profiles.email),
    phone = coalesce(excluded.phone, public.profiles.phone),
    whatsapp_number = coalesce(excluded.whatsapp_number, public.profiles.whatsapp_number),
    cnic = coalesce(excluded.cnic, public.profiles.cnic),
    role = excluded.role,
    area = coalesce(excluded.area, public.profiles.area),
    city = coalesce(excluded.city, public.profiles.city),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer set search_path = public;
