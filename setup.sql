-- Script de configuración para "Huellas a Casa"
-- Copia y pega este código en el SQL Editor de Supabase

-- 1. Tabla de Perros
create table if not exists pets (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  raza text not null,
  foto_url text not null,
  descripcion text,
  fecha_registro timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabla de Comentarios
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  pet_id uuid references pets(id) on delete cascade not null,
  autor text not null,
  contenido text not null,
  fecha_comentario timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Políticas RLS (Seguridad)
alter table pets enable row level security;
alter table comments enable row level security;

-- Políticas para Pets
create policy "Lectura pública de pets" on pets for select using (true);
create policy "Registro público de pets" on pets for insert with check (true);
create policy "Borrado público de pets" on pets for delete using (true);

-- Políticas para Comentarios
create policy "Lectura pública de comentarios" on comments for select using (true);
create policy "Registro público de comentarios" on comments for insert with check (true);
