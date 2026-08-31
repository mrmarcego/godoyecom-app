-- =============================================================================
-- Godoyecom App — esquema de base de datos para Supabase
-- =============================================================================
-- Cómo usar este archivo:
--   1. Entra a tu proyecto de Supabase -> SQL Editor -> New query.
--   2. Pega todo este archivo y dale "Run".
--   3. Se crean las tablas, los índices, las funciones y las políticas de
--      seguridad (Row Level Security) que hacen que cada estudiante solo
--      pueda ver y modificar sus propios datos, y que los administradores
--      puedan ver todo pero no puedan auto-asignarse el rol de admin desde
--      el cliente (eso solo se hace desde el servidor, ver README).
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tipos
-- -----------------------------------------------------------------------------

do $$ begin
  create type public.user_role as enum ('admin', 'student');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('efectivo', 'zelle', 'transferencia', 'tarjeta', 'otro');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- Perfiles (1:1 con auth.users)
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null,
  role public.user_role not null default 'student',
  phone text,
  instagram_username text,
  instagram_connected boolean not null default false,
  avatar_url text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil público de cada usuario (estudiante o administrador). El rol NUNCA se confía desde el cliente: siempre se crea como student y solo se promueve a admin desde el servidor.';

-- Crea automáticamente el perfil cuando alguien se registra en Supabase Auth.
-- El rol se fuerza SIEMPRE a 'student' aquí, sin importar qué metadata mande
-- el cliente, para que nadie pueda auto-asignarse admin llamando directo a
-- la API de Auth. La promoción a admin ocurre aparte (ver README /
-- src/lib/actions/admin-auth.ts), usando la service role key.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'student'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Métricas de Instagram (carga manual por el estudiante)
-- -----------------------------------------------------------------------------

create table if not exists public.instagram_metrics (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  metric_date date not null,
  followers integer not null default 0 check (followers >= 0),
  following integer not null default 0 check (following >= 0),
  posts_count integer not null default 0 check (posts_count >= 0),
  reach integer not null default 0 check (reach >= 0),
  profile_visits integer not null default 0 check (profile_visits >= 0),
  notes text,
  created_at timestamptz not null default now(),
  unique (student_id, metric_date)
);

create index if not exists idx_instagram_metrics_student on public.instagram_metrics(student_id, metric_date desc);

-- Reels / publicaciones individuales, para ver cuál "pegó" más.
create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  posted_at date not null default current_date,
  title text not null,
  url text,
  views integer not null default 0 check (views >= 0),
  likes integer not null default 0 check (likes >= 0),
  comments integer not null default 0 check (comments >= 0),
  shares integer not null default 0 check (shares >= 0),
  saves integer not null default 0 check (saves >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_reels_student on public.reels(student_id, posted_at desc);

-- -----------------------------------------------------------------------------
-- Negocio de reventa: inversión (productos) y ventas
-- -----------------------------------------------------------------------------

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text,
  cost_per_unit numeric(12,2) not null default 0 check (cost_per_unit >= 0),
  quantity_purchased integer not null default 1 check (quantity_purchased >= 0),
  purchase_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_student on public.products(student_id, purchase_date desc);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1 check (quantity >= 1),
  unit_cost numeric(12,2) not null default 0 check (unit_cost >= 0),
  unit_price numeric(12,2) not null default 0 check (unit_price >= 0),
  payment_method public.payment_method not null default 'efectivo',
  sale_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_sales_student on public.sales(student_id, sale_date desc);

-- -----------------------------------------------------------------------------
-- Feedback privado (administrador -> estudiante)
-- -----------------------------------------------------------------------------

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  admin_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists idx_feedback_student on public.feedback(student_id, created_at desc);

-- Marca un feedback como leído. Corre con privilegios elevados para poder
-- tocar la columna read_at sin darle a los estudiantes permiso de UPDATE
-- general sobre la tabla (así no pueden editar el mensaje del admin).
create or replace function public.mark_feedback_read(feedback_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.feedback
  set read_at = now()
  where id = feedback_id and student_id = auth.uid() and read_at is null;
end;
$$;

-- -----------------------------------------------------------------------------
-- Helper: ¿el usuario que hace la consulta es administrador?
-- -----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.instagram_metrics enable row level security;
alter table public.reels enable row level security;
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.feedback enable row level security;

-- profiles: cada quien ve su fila; el admin ve todas. Nadie puede cambiar su
-- propio rol (ver GRANT de columnas más abajo).
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- instagram_metrics
create policy "ig_metrics_select" on public.instagram_metrics
  for select using (student_id = auth.uid() or public.is_admin());
create policy "ig_metrics_insert" on public.instagram_metrics
  for insert with check (student_id = auth.uid());
create policy "ig_metrics_update" on public.instagram_metrics
  for update using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "ig_metrics_delete" on public.instagram_metrics
  for delete using (student_id = auth.uid());

-- reels
create policy "reels_select" on public.reels
  for select using (student_id = auth.uid() or public.is_admin());
create policy "reels_insert" on public.reels
  for insert with check (student_id = auth.uid());
create policy "reels_update" on public.reels
  for update using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "reels_delete" on public.reels
  for delete using (student_id = auth.uid());

-- products
create policy "products_select" on public.products
  for select using (student_id = auth.uid() or public.is_admin());
create policy "products_insert" on public.products
  for insert with check (student_id = auth.uid());
create policy "products_update" on public.products
  for update using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "products_delete" on public.products
  for delete using (student_id = auth.uid());

-- sales
create policy "sales_select" on public.sales
  for select using (student_id = auth.uid() or public.is_admin());
create policy "sales_insert" on public.sales
  for insert with check (student_id = auth.uid());
create policy "sales_update" on public.sales
  for update using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "sales_delete" on public.sales
  for delete using (student_id = auth.uid());

-- feedback: el estudiante solo lee lo suyo; solo un admin puede escribir.
create policy "feedback_select" on public.feedback
  for select using (student_id = auth.uid() or public.is_admin());
create policy "feedback_insert_admin" on public.feedback
  for insert with check (public.is_admin() and admin_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Privilegios (las políticas de arriba filtran FILAS; esto habilita las
-- OPERACIONES para el rol "authenticated" de Supabase).
-- -----------------------------------------------------------------------------

grant usage on schema public to authenticated;

grant select on public.profiles to authenticated;
-- Ningún usuario autenticado puede tocar su columna "role" (ni la suya ni la
-- de nadie) desde el cliente: eso evita que un estudiante se autopromueva a
-- administrador. Promover a alguien a admin se hace desde el servidor.
grant update (full_name, phone, instagram_username, instagram_connected, avatar_url)
  on public.profiles to authenticated;

grant select, insert, update, delete on public.instagram_metrics to authenticated;
grant select, insert, update, delete on public.reels to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.sales to authenticated;
grant select, insert on public.feedback to authenticated;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.mark_feedback_read(uuid) to authenticated;

-- Marca TODO el feedback pendiente del estudiante actual como leído (se usa
-- al entrar a la pantalla de feedback).
create or replace function public.mark_all_feedback_read()
returns void
language sql
security definer
set search_path = public
as $$
  update public.feedback
  set read_at = now()
  where student_id = auth.uid() and read_at is null;
$$;

grant execute on function public.mark_all_feedback_read() to authenticated;

-- =============================================================================
-- Fin del esquema. Después de correr esto, sigue los pasos del README para
-- crear tu primera cuenta de administrador.
-- =============================================================================
