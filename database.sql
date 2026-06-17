-- 1. Limpieza de tablas antiguas
drop table if exists public.perfiles cascade;
drop table if exists public.profiles cascade;

-- 2. Crear la tabla pública de 'profiles' con todos los campos solicitados
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  email text,
  role text check (role in ('ADMINISTRADOR', 'ENCARGADO', 'EMPLEADO')) default 'EMPLEADO',
  is_active boolean default true,
  phone text,
  avatar_url text,
  address text,
  last_login_at timestamp with time zone,
  login_count integer default 0,
  failed_attempts integer default 0,
  locked_until timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  create_by uuid -- id del usuario que creó este registro (si aplica)
);

-- 3. Habilitar Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 4. Políticas de seguridad
create policy "Los perfiles son visibles para usuarios autenticados" 
on public.profiles for select using (auth.role() = 'authenticated');

create policy "Usuarios pueden editar su propio perfil limitado" 
on public.profiles for update using (auth.uid() = id);

-- 5. Función para sincronización automática desde auth.users
create or replace function public.manejador_nuevo_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    is_active, 
    created_at, 
    updated_at
  )
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'nombre', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    -- Si viene un rol en la metadata, usarlo. Si no, aplicar lógica por defecto.
    coalesce(
      new.raw_user_meta_data->>'role',
      case when not exists (select 1 from public.profiles) then 'ADMINISTRADOR' else 'EMPLEADO' end
    ),
    true,
    now(),
    now()
  );
  return new;
end;
$$;

-- 6. Crear el trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.manejador_nuevo_usuario();

-- 7. Función para actualizar el timestamp de updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ==========================================
-- ESTRUCTURAS MINIMAS DE FASES 3 y 5
-- ==========================================

-- Las tablas de animales ya existen en el sistema original.
-- Omitimos la creación de public.animals para evitar el error ERROR: 42P07: relation "animals" already exists

-- 9. Tabla de Lotes/Grupos de Animales (Ej: Lote de Gallinas)
create table public.animal_batches (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- ej: Lote 1 - Ponedoras Libres
  species text check (species in ('GALLINA', 'CERDO', 'OTRO')) not null,
  quantity integer not null default 0,
  status text check (status in ('ACTIVO', 'INACTIVO')) default 'ACTIVO',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.animal_batches enable row level security;
create policy "Batches visibles para usuarios autenticados" on public.animal_batches for select using (auth.role() = 'authenticated');
create policy "Batches modificables por Módulo" on public.animal_batches for all using (auth.role() = 'authenticated');
create trigger set_animal_batches_updated_at before update on public.animal_batches for each row execute procedure public.handle_updated_at();

-- 10. Módulo Producción - Registro de Leche
create table public.milk_production (
  id uuid default gen_random_uuid() primary key,
  animal_id uuid references public.animals(id) on delete restrict not null,
  date date not null default current_date,
  shift text check (shift in ('MAQUINARIA', 'MAÑANA', 'TARDE', 'NOCHE')) not null default 'MAÑANA',
  quantity_liters decimal(10,2) not null check (quantity_liters > 0),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.milk_production enable row level security;
create policy "Producción Leche visible para usuarios autenticados" on public.milk_production for select using (auth.role() = 'authenticated');
create policy "Producción Leche modificable por usuarios autenticados" on public.milk_production for all using (auth.role() = 'authenticated');

-- 11. Módulo Producción - Registro de Huevos
create table public.egg_production (
  id uuid default gen_random_uuid() primary key,
  batch_id uuid references public.animal_batches(id) on delete restrict not null,
  date date not null default current_date,
  total_quantity integer not null check (total_quantity > 0),
  damaged_quantity integer default 0 check (damaged_quantity >= 0),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.egg_production enable row level security;
create policy "Producción Huevos visible para usuarios" on public.egg_production for select using (auth.role() = 'authenticated');
create policy "Producción Huevos modificable por usuarios" on public.egg_production for all using (auth.role() = 'authenticated');

-- ==========================================
-- ESTRUCTURAS MINIMAS DE FASE 6 (Auditoría)
-- ==========================================

-- 12. Tabla de Logs de Auditoría
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  table_name text not null,
  record_id uuid not null,
  action text check (action in ('INSERT', 'UPDATE', 'DELETE')) not null,
  old_data jsonb,
  new_data jsonb,
  modified_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.audit_logs enable row level security;
-- Solo Administradores pueden leer la auditoría
create policy "Audit logs visibles para administradores" on public.audit_logs for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'ADMINISTRADOR')
);

-- 13. Función global de Trigger para registrar en auditoría
create or replace function public.log_table_audit()
returns trigger as $$
declare
  user_id uuid;
begin
  -- Extraer ID el usuario desde la sesión de Supabase
  user_id := auth.uid();
  
  if (TG_OP = 'INSERT') then
    insert into public.audit_logs (table_name, record_id, action, new_data, modified_by)
    values (TG_TABLE_NAME, new.id, 'INSERT', row_to_json(new)::jsonb, user_id);
    return new;
  elsif (TG_OP = 'UPDATE') then
    insert into public.audit_logs (table_name, record_id, action, old_data, new_data, modified_by)
    values (TG_TABLE_NAME, new.id, 'UPDATE', row_to_json(old)::jsonb, row_to_json(new)::jsonb, user_id);
    return new;
  elsif (TG_OP = 'DELETE') then
    insert into public.audit_logs (table_name, record_id, action, old_data, modified_by)
    values (TG_TABLE_NAME, old.id, 'DELETE', row_to_json(old)::jsonb, user_id);
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- 14. Anexar triggers a tablas operativas (Descomenta al crear en base de datos)
drop trigger if exists audit_animals_changes on public.animals;
create trigger audit_animals_changes
  after insert or update or delete on public.animals
  for each row execute procedure public.log_table_audit();

drop trigger if exists audit_supplies_changes on public.supplies;
create trigger audit_supplies_changes
  after insert or update or delete on public.supplies
  for each row execute procedure public.log_table_audit();

drop trigger if exists audit_milk_changes on public.milk_production;
create trigger audit_milk_changes
  after insert or update or delete on public.milk_production
  for each row execute procedure public.log_table_audit();

drop trigger if exists audit_egg_changes on public.egg_production;
create trigger audit_egg_changes
  after insert or update or delete on public.egg_production
  for each row execute procedure public.log_table_audit();

