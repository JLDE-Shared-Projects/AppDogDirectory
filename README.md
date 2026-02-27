# 🐾 Huellas a Casa: Directorio de Perros Perdidos

"Huellas a Casa" es una aplicación web de ayuda social diseñada para facilitar el registro y la búsqueda de perros extraviados, ayudándolos a reunirse con sus familias.

## ✨ Características

- **Galería Dinámica**: Visualización de mascotas registradas con búsqueda en tiempo real.
- **Registro Flexible**: Permite subir fotos directamente a Supabase Storage o usar una URL externa.
- **Editor Enriquecido**: Las descripciones de las mascotas soportan formato Markdown gracias a EasyMDE.
- **Sistema de Comentarios**: Cada mascota tiene un muro de avistamientos para que la comunidad colabore.
- **Gestión de Estatus**: Botón "¡Lo Encontré!" para marcar mascotas como reunidas con su dueño.

## 🚀 Tecnologías

- **Backend:** Node.js, TypeScript, Express.js.
- **Frontend:** HTML5 semántico, vanilla JS, Tailwind CSS.
- **Librerías:** EasyMDE (Markdown), Marked, Multer.
- **Base de Datos:** Supabase (PostgreSQL + Storage).
- **Despliegue:** Configuración lista para Vercel.

## 📂 Estructura del Proyecto

```text
/
├── backend/            # Lógica del servidor (API)
│   ├── index.ts        # Punto de entrada de la API
│   └── tsconfig.json   # Configuración de TypeScript
├── frontend/           # Interfaz de usuario
│   ├── index.html      # Estructura principal
│   └── app.js          # Lógica del cliente
├── vercel.json         # Configuración de despliegue
├── package.json        # Dependencias y scripts
├── setup.sql           # Script de base de datos
└── .env.example        # Plantilla de variables de entorno
```

## 🛠️ Configuración Local

### 1. Requisitos Previos
- Node.js (v18+) instalado.
- Un proyecto creado en [Supabase](https://supabase.com/).

### 2. Base de Datos (Supabase)
Ejecuta el siguiente SQL en el **SQL Editor** de Supabase para crear las tablas y políticas necesarias:

```sql
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

create policy "Lectura pública de pets" on pets for select using (true);
create policy "Registro público de pets" on pets for insert with check (true);
create policy "Borrado público de pets" on pets for delete using (true);

create policy "Lectura pública de comentarios" on comments for select using (true);
create policy "Registro público de comentarios" on comments for insert with check (true);
```

### 3. Almacenamiento (Supabase Storage)
1. Ve a la sección de **Storage** en Supabase.
2. Crea un nuevo bucket llamado `app-dog-directory-storage` y márcalo como **Public**.
3. Asegúrate de que las políticas permitan la inserción de objetos si deseas que los usuarios suban fotos.

### 4. Instalación
```bash
# Clonar e instalar
cd AppDogDirectory
npm install
```

### 5. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales:
```text
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key
PORT=3000
```

### 6. Ejecutar
```bash
# Desarrollo (nodemon + ts-node)
npm run dev

# Construcción y Producción
npm run build
npm start
```

## 🌐 Despliegue en Vercel

El proyecto usa la estructura de carpetas configurada en `vercel.json`:

1. Instala el CLI de Vercel: `npm i -g vercel`.
2. Ejecuta `vercel` y sigue los pasos.
3. Configura `SUPABASE_URL` y `SUPABASE_KEY` en el dashboard de Vercel.

---
*Desarrollado con ❤️ para ayudar a los peluditos a volver a casa.*
