-- Script de creación de tabla para "Huellas a Casa"
-- Copia y pega este código en el SQL Editor de Supabase

-- 1. Crear la tabla de perros (pets)
create table if not exists pets (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  raza text not null,
  foto_url text not null,
  descripcion text,
  fecha_registro timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar Seguridad a Nivel de Fila (Row Level Security - RLS)
-- Esto es una buena práctica en Supabase.
alter table pets enable row level security;

-- 3. Crear políticas de acceso
-- Permite que cualquier persona (incluyendo usuarios no autenticados) pueda ver la lista de perros
create policy "Cualquiera puede ver los perros" 
on pets for select 
using (true);

-- Permite que cualquier persona pueda registrar un perro nuevo
-- (En una app madura, esto podría restringirse a usuarios autenticados)
create policy "Cualquiera puede registrar un perro" 
on pets for insert 
with check (true);

-- Política para permitir que cualquiera marque un perro como encontrado (borrar)
create policy "Cualquiera puede borrar un perro"
on pets for delete
using (true);

-- 4. Configuración de Supabase Storage
-- Nota: Algunos entornos de Supabase no permiten crear buckets vía SQL directamente.
-- Si esto falla, crea un bucket llamado 'app-dog-directory-storage' manualmente en el panel de Storage.

/*
-- Crear bucket 'app-dog-directory-storage'
insert into storage.buckets (id, name, public)
values ('app-dog-directory-storage', 'app-dog-directory-storage', true);

-- Política para permitir subidas públicas al bucket 'app-dog-directory-storage'
create policy "Subidas públicas"
on storage.objects for insert
with check ( bucket_id = 'app-dog-directory-storage' );

-- Política para permitir lectura pública del bucket 'app-dog-directory-storage'
create policy "Lectura pública"
on storage.objects for select
using ( bucket_id = 'app-dog-directory-storage' );
*/

-- 5. Tabla de Comentarios
create table if not exists comments (
  id uuid default gen_random_uuid() primary key,
  pet_id uuid references pets(id) on delete cascade not null,
  autor text not null,
  contenido text not null,
  fecha_comentario timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS para comentarios
alter table comments enable row level security;

-- Política para permitir lectura pública
create policy "Lectura pública de comentarios"
on comments for select
using (true);

-- Política para permitir inserción pública
create policy "Inserción pública de comentarios"
on comments for insert
with check (true);

-- 6. Insertar datos de ejemplo (Opcional)
/*
insert into pets (nombre, raza, foto_url, descripcion)
values 
('Max', 'Golden Retriever', 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400', 'Perro muy amigable, se perdió cerca del parque central.'),
('Luna', 'Siberian Husky', 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=400', 'Tiene ojos azules, es muy juguetona.');
*/
