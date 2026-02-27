# 🐾 Huellas a Casa: Directorio de Perros Perdidos

"Huellas a Casa" es una aplicación web de ayuda social diseñada para facilitar el registro y la búsqueda de perros extraviados, ayudándolos a reunirse con sus familias.

## 🚀 Tecnologías

- **Backend:** Node.js, TypeScript, Express.js.
- **Frontend:** HTML5, JavaScript Vanilla (ES6+), Tailwind CSS.
- **Base de Datos:** Supabase (PostgreSQL).
- **Despliegue:** Configuración lista para Vercel.

## 📂 Estructura del Proyecto

```text
/
├── api/             # Funciones adicionales
├── public/          # Frontend del proyecto
│   ├── app.js       # Lógica de la interfaz
│   └── index.html   # Estructura principal
├── index.ts         # Servidor principal (Express)
├── vercel.json      # Configuración de despliegue
├── package.json     # Dependencias
├── tsconfig.json    # Configuración de TypeScript
└── .env.example     # Plantilla de variables de entorno
```

## 🛠️ Configuración Local

### 1. Requisitos Previos
- Node.js instalado.
- Un proyecto creado en [Supabase](https://supabase.com/).

### 2. Base de Datos (Supabase)
Ejecuta el siguiente SQL en el editor de tu proyecto de Supabase para crear la tabla necesaria:

```sql
create table pets (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  raza text not null,
  foto_url text not null,
  descripcion text,
  fecha_registro timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar acceso de lectura y escritura público (Opcional)
alter table pets enable row level security;
create policy "Public Read Access" on pets for select using (true);
create policy "Public Insert Access" on pets for insert with check (true);
```

### 3. Instalación
```bash
# Clonar el repositorio
# Entrar al directorio
cd AppDogDirectory

# Instalar dependencias
npm install
```

### 4. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto y añade tus credenciales de Supabase:
```text
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key
PORT=3000
```

### 5. Ejecutar
```bash
# Modo desarrollo con recarga automática
npm run dev

# Compilar TypeScript
npm run build

# Iniciar servidor producción
npm start
```

## 🌐 Despliegue en Vercel

El proyecto está listo para ser desplegado en Vercel:

1. Instala el CLI de Vercel: `npm i -g vercel`
2. Ejecuta `vercel` en la raíz del proyecto.
3. Asegúrate de configurar las **Environment Variables** (`SUPABASE_URL` y `SUPABASE_KEY`) en el panel de control de Vercel.

---
*Desarrollado con ❤️ para ayudar a los peluditos a volver a casa.*
