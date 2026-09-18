-- ==============================================================================
-- GharYahan Hyperlocal Rental Marketplace - Complete & Idempotent Schema
-- Run this complete script in your Supabase Dashboard -> SQL Editor
-- It safely drops previous iterations, recreates all tables, adds PostGIS,
-- sets up triggers, row level security, storage buckets, and seeds reference data.
-- ==============================================================================

-- 1. Enable PostGIS Extension (Required for spatial proximity queries)
create extension if not exists postgis with schema extensions;

-- 2. Drop existing triggers & functions safely
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.get_nearby_properties(double precision, double precision, double precision) cascade;
drop function if exists public.is_admin(uuid) cascade;

-- 3. Drop existing tables safely in reverse dependency order
drop table if exists public.agreements cascade;
drop table if exists public.favorites cascade;
drop table if exists public.property_images cascade;
drop table if exists public.properties cascade;
drop table if exists public.locations cascade;
drop table if exists public.profiles cascade;

-- ==============================================================================
-- 4. PROFILES TABLE (Linked directly to Supabase auth.users)
-- ==============================================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  phone text,
  whatsapp_number text,
  cnic text,
  role text not null check (role in ('tenant', 'landlord', 'admin')) default 'tenant',
  avatar_url text,
  city text default 'Lahore',
  area text default 'Singhpura',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Partial unique indexes on phone and CNIC (ensures uniqueness only when provided)
create unique index if not exists profiles_phone_unique_idx on public.profiles (phone) where phone is not null and phone <> '';
create unique index if not exists profiles_cnic_unique_idx on public.profiles (cnic) where cnic is not null and cnic <> '';
create index if not exists profiles_role_idx on public.profiles (role);

-- ==============================================================================
-- 5. LOCATIONS REFERENCE TAXONOMY (Hyperlocal areas across Pakistan)
-- ==============================================================================
create table public.locations (
  id uuid default gen_random_uuid() primary key,
  city text not null default 'Lahore',
  area text not null,
  parent_area_id uuid references public.locations(id) on delete set null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  constraint locations_city_area_unique unique (city, area)
);

create index if not exists locations_city_idx on public.locations (city);
create index if not exists locations_area_idx on public.locations (area);

-- ==============================================================================
-- 6. PROPERTIES TABLE
-- ==============================================================================
create table public.properties (
  id uuid default gen_random_uuid() primary key,
  landlord_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  property_type text not null check (property_type in ('house', 'portion', 'flat', 'room')),
  bedrooms integer default 1 not null,
  bathrooms integer default 1 not null,
  has_electricity boolean default true not null,
  has_gas boolean default true not null,
  has_water boolean default true not null,
  is_furnished boolean default false not null,
  has_drainage boolean default true not null,
  has_roof_leakage boolean default false not null,
  lease_duration text default '1 Year',
  has_discount boolean default false not null,
  discounted_price numeric,
  video_url text,
  rent_price numeric not null,
  deposit_amount numeric,
  status text not null check (status in ('available', 'in_deal', 'sealed')) default 'available',
  expected_vacancy_date date,
  city text not null default 'Lahore',
  area text not null,
  street_address text,
  lat double precision,
  lng double precision,
  location geography(Point, 4326),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Spatial and performance indexes
create index if not exists properties_location_gist on public.properties using gist (location);
create index if not exists properties_area_idx on public.properties (area);
create index if not exists properties_city_idx on public.properties (city);
create index if not exists properties_status_idx on public.properties (status);
create index if not exists properties_landlord_idx on public.properties (landlord_id);
create index if not exists properties_rent_price_idx on public.properties (rent_price);

-- ==============================================================================
-- 7. PROPERTY IMAGES TABLE
-- ==============================================================================
create table public.property_images (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  storage_path text not null,
  sort_order integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists property_images_prop_id_idx on public.property_images (property_id);

-- ==============================================================================
-- 8. FAVORITES TABLE (Saved rentals for tenants)
-- ==============================================================================
create table public.favorites (
  id uuid default gen_random_uuid() primary key,
  tenant_id uuid references public.profiles(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  constraint favorites_user_property_unique unique (tenant_id, property_id)
);

create index if not exists favorites_tenant_idx on public.favorites (tenant_id);

-- ==============================================================================
-- 9. AGREEMENTS TABLE (Lightweight tenancy records)
-- ==============================================================================
create table public.agreements (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references public.properties(id) on delete cascade not null,
  landlord_id uuid references public.profiles(id) on delete cascade not null,
  tenant_id uuid references public.profiles(id) on delete set null,
  start_date date not null,
  lock_in_period_months integer default 12 not null,
  notes text,
  status text check (status in ('active', 'ended')) default 'active' not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists agreements_landlord_idx on public.agreements (landlord_id);
create index if not exists agreements_tenant_idx on public.agreements (tenant_id);

-- ==============================================================================
-- 10. HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Admin check helper
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
$$ language sql security definer set search_path = public;

-- Automatic Profile Creation Trigger on Supabase Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone, whatsapp_number, cnic, role, area, city)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1), 'User'),
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

-- Bind trigger to auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Automatic backfill: guarantees any existing auth.users record immediately gets a profile
insert into public.profiles (id, full_name, phone, whatsapp_number, cnic, role, area, city)
select 
  u.id,
  coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), split_part(u.email, '@', 1), 'User'),
  nullif(u.raw_user_meta_data->>'phone', ''),
  nullif(coalesce(u.raw_user_meta_data->>'whatsapp_number', u.raw_user_meta_data->>'phone'), ''),
  nullif(u.raw_user_meta_data->>'cnic', ''),
  case when u.raw_user_meta_data->>'role' = 'landlord' then 'landlord' else 'tenant' end,
  coalesce(nullif(u.raw_user_meta_data->>'area', ''), 'Gulshan, Karachi'),
  coalesce(nullif(u.raw_user_meta_data->>'city', ''), 'Karachi')
from auth.users u
on conflict (id) do update set
  full_name = excluded.full_name,
  phone = coalesce(excluded.phone, public.profiles.phone),
  whatsapp_number = coalesce(excluded.whatsapp_number, public.profiles.whatsapp_number),
  cnic = coalesce(excluded.cnic, public.profiles.cnic),
  role = excluded.role,
  area = coalesce(excluded.area, public.profiles.area),
  city = coalesce(excluded.city, public.profiles.city),
  updated_at = now();

-- Proximity Query RPC function for searching properties near coordinates
create or replace function public.get_nearby_properties(
  user_lat double precision,
  user_lng double precision,
  max_distance_meters double precision default 25000
)
returns table (
  id uuid,
  landlord_id uuid,
  title text,
  description text,
  property_type text,
  bedrooms integer,
  bathrooms integer,
  has_electricity boolean,
  has_gas boolean,
  has_water boolean,
  is_furnished boolean,
  has_drainage boolean,
  has_roof_leakage boolean,
  lease_duration text,
  has_discount boolean,
  discounted_price numeric,
  video_url text,
  rent_price numeric,
  deposit_amount numeric,
  status text,
  expected_vacancy_date date,
  city text,
  area text,
  street_address text,
  lat double precision,
  lng double precision,
  distance_meters double precision,
  created_at timestamptz
) as $$
begin
  return query
  select 
    p.id,
    p.landlord_id,
    p.title,
    p.description,
    p.property_type,
    p.bedrooms,
    p.bathrooms,
    p.has_electricity,
    p.has_gas,
    p.has_water,
    p.is_furnished,
    p.has_drainage,
    p.has_roof_leakage,
    p.lease_duration,
    p.has_discount,
    p.discounted_price,
    p.video_url,
    p.rent_price,
    p.deposit_amount,
    p.status,
    p.expected_vacancy_date,
    p.city,
    p.area,
    p.street_address,
    p.lat,
    p.lng,
    case 
      when p.location is not null then extensions.st_distance(p.location, extensions.st_setsrid(extensions.st_makepoint(user_lng, user_lat), 4326)::geography)
      else null
    end as distance_meters,
    p.created_at
  from public.properties p
  order by distance_meters asc nulls last, p.created_at desc;
end;
$$ language plpgsql security definer set search_path = public, extensions;

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.locations enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.favorites enable row level security;
alter table public.agreements enable row level security;

-- Drop previous policies to guarantee error-free re-runs
drop policy if exists "Public profiles viewable" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admin full access on profiles" on public.profiles;

create policy "Public profiles viewable" on public.profiles for select using (true);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id or public.is_admin(auth.uid()));
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id or public.is_admin(auth.uid()));
create policy "Admin full access on profiles" on public.profiles for all using (public.is_admin(auth.uid()));

-- Locations policies
drop policy if exists "Locations viewable by all" on public.locations;
drop policy if exists "Admin manage locations" on public.locations;

create policy "Locations viewable by all" on public.locations for select using (true);
create policy "Admin manage locations" on public.locations for all using (public.is_admin(auth.uid()));

-- Properties policies
drop policy if exists "Properties viewable by all" on public.properties;
drop policy if exists "Landlords can insert own properties" on public.properties;
drop policy if exists "Landlords can update own properties" on public.properties;
drop policy if exists "Landlords can delete own properties" on public.properties;
drop policy if exists "Admin full access on properties" on public.properties;

create policy "Properties viewable by all" on public.properties for select using (true);
create policy "Landlords can insert own properties" on public.properties for insert with check (auth.uid() = landlord_id or public.is_admin(auth.uid()));
create policy "Landlords can update own properties" on public.properties for update using (auth.uid() = landlord_id or public.is_admin(auth.uid()));
create policy "Landlords can delete own properties" on public.properties for delete using (auth.uid() = landlord_id or public.is_admin(auth.uid()));
create policy "Admin full access on properties" on public.properties for all using (public.is_admin(auth.uid()));

-- Property Images policies
drop policy if exists "Images viewable by all" on public.property_images;
drop policy if exists "Landlord manage images" on public.property_images;
drop policy if exists "Admin manage images" on public.property_images;

create policy "Images viewable by all" on public.property_images for select using (true);
create policy "Landlord manage images" on public.property_images for all using (
  exists (select 1 from public.properties where id = property_id and landlord_id = auth.uid()) or public.is_admin(auth.uid())
);
create policy "Admin manage images" on public.property_images for all using (public.is_admin(auth.uid()));

-- Favorites policies
drop policy if exists "Users can view own favorites" on public.favorites;
drop policy if exists "Users can manage own favorites" on public.favorites;

create policy "Users can view own favorites" on public.favorites for select using (auth.uid() = tenant_id or public.is_admin(auth.uid()));
create policy "Users can manage own favorites" on public.favorites for all using (auth.uid() = tenant_id or public.is_admin(auth.uid()));

-- Agreements policies
drop policy if exists "Parties view own agreements" on public.agreements;
drop policy if exists "Landlords can create agreements" on public.agreements;
drop policy if exists "Landlords can update agreements" on public.agreements;

create policy "Parties view own agreements" on public.agreements for select using (
  auth.uid() = landlord_id or auth.uid() = tenant_id or public.is_admin(auth.uid())
);
create policy "Landlords can create agreements" on public.agreements for insert with check (auth.uid() = landlord_id or public.is_admin(auth.uid()));
create policy "Landlords can update agreements" on public.agreements for update using (auth.uid() = landlord_id or public.is_admin(auth.uid()));

-- ==============================================================================
-- 12. SEED REFERENCE LOCATIONS (Lahore, Karachi, Islamabad, Rawalpindi)
-- ==============================================================================
insert into public.locations (city, area) values
  -- Lahore Areas
  ('Lahore', 'Singhpura'),
  ('Lahore', 'Bhagwanpura'),
  ('Lahore', 'Gulberg'),
  ('Lahore', 'Model Town'),
  ('Lahore', 'Johar Town'),
  ('Lahore', 'DHA (Defence)'),
  ('Lahore', 'Shadman'),
  ('Lahore', 'Allama Iqbal Town'),
  ('Lahore', 'Faisal Town'),
  ('Lahore', 'Walled City (Androon Lahore)'),
  -- Karachi Areas
  ('Karachi', 'Gulshan, Karachi'),
  ('Karachi', 'Clifton, Karachi'),
  ('Karachi', 'DHA, Karachi'),
  ('Karachi', 'North Nazimabad, Karachi'),
  ('Karachi', 'PECHS, Karachi'),
  ('Karachi', 'Bahria Town, Karachi'),
  -- Islamabad Areas
  ('Islamabad', 'F-6, Islamabad'),
  ('Islamabad', 'F-7, Islamabad'),
  ('Islamabad', 'F-8, Islamabad'),
  ('Islamabad', 'F-10, Islamabad'),
  ('Islamabad', 'F-11, Islamabad'),
  ('Islamabad', 'G-11, Islamabad'),
  ('Islamabad', 'DHA, Islamabad'),
  ('Islamabad', 'Bahria Town, Islamabad'),
  -- Rawalpindi Areas
  ('Rawalpindi', 'Saddar, Rawalpindi'),
  ('Rawalpindi', 'Satellite Town, Rawalpindi'),
  ('Rawalpindi', 'Westridge, Rawalpindi'),
  ('Rawalpindi', 'Bahria Town, Rawalpindi')
on conflict (city, area) do nothing;

-- ==============================================================================
-- 13. STORAGE BUCKETS & STORAGE POLICIES
-- ==============================================================================
insert into storage.buckets (id, name, public)
values 
  ('property-images', 'property-images', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Drop existing storage policies to allow safe re-runs
drop policy if exists "Public Property Images Access" on storage.objects;
drop policy if exists "Authenticated Property Images Uploads" on storage.objects;
drop policy if exists "Authenticated Property Images Updates" on storage.objects;
drop policy if exists "Authenticated Property Images Deletes" on storage.objects;
drop policy if exists "Public Avatars Access" on storage.objects;
drop policy if exists "Authenticated Avatars Uploads" on storage.objects;
drop policy if exists "Authenticated Avatars Updates" on storage.objects;
drop policy if exists "Authenticated Avatars Deletes" on storage.objects;
drop policy if exists "Authenticated Uploads" on storage.objects;

-- Property Images Storage Policies
create policy "Public Property Images Access" on storage.objects
for select using (bucket_id = 'property-images');

create policy "Authenticated Property Images Uploads" on storage.objects
for insert with check (bucket_id = 'property-images' and auth.role() = 'authenticated');

create policy "Authenticated Property Images Updates" on storage.objects
for update using (bucket_id = 'property-images' and auth.role() = 'authenticated');

create policy "Authenticated Property Images Deletes" on storage.objects
for delete using (bucket_id = 'property-images' and auth.role() = 'authenticated');

-- Avatars Storage Policies
create policy "Public Avatars Access" on storage.objects
for select using (bucket_id = 'avatars');

create policy "Authenticated Avatars Uploads" on storage.objects
for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Authenticated Avatars Updates" on storage.objects
for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Authenticated Avatars Deletes" on storage.objects
for delete using (bucket_id = 'avatars' and auth.role() = 'authenticated');
