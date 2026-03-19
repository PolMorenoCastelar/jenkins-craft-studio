# JenkinsFlow Architect

> Constructor visual de Jenkinsfiles declarativos — diseña, previsualiza y exporta pipelines de Jenkins sin escribir Groovy manualmente.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white)

## 🚀 Características

- **Editor Visual de Pipelines** — Construye pipelines declarativos arrastrando stages y configurando steps desde una interfaz intuitiva.
- **Vista Previa en Tiempo Real** — El código Groovy se genera al instante mientras editas, en un split-view con syntax highlighting.
- **9 Tipos de Steps** — `sh`, `echo`, `git`, `archiveArtifacts`, `junit`, `slackSend`, `emailext`, `withCredentials` y bloques `script` personalizados.
- **Configuración Global** — Define `agent`, variables de entorno, parámetros (`string`, `boolean`, `choice`, `text`) y acciones `post` (success/failure/always).
- **Scripting Avanzado** — Editor para funciones Groovy personalizadas que se insertan fuera del bloque `pipeline {}`.
- **Exportación** — Copia al portapapeles o descarga como `Jenkinsfile` con un clic.
- **Persistencia en la Nube** — Registro/login con email y contraseña. Cada usuario gestiona sus propios proyectos (crear, editar, clonar, eliminar).
- **Dark Mode DevOps** — Tema oscuro por defecto con acentos azul/púrpura y tipografía monoespaciada para el código.

## 🛠️ Tech Stack

| Capa | Tecnología |
|---|---|
| Framework | React 18 + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Iconos | Lucide React |
| Estado del servidor | TanStack React Query |
| Routing | React Router v6 |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| Build | Vite |

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── editor/
│   │   ├── GlobalConfigPanel.tsx   # Agent, env vars, params, post actions
│   │   ├── StageBuilder.tsx        # Gestión visual de stages y steps
│   │   └── CodePreview.tsx         # Vista previa Groovy + copiar/descargar
│   └── ui/                         # Componentes shadcn/ui
├── hooks/
│   ├── useAuth.tsx                 # Contexto de autenticación
│   └── useProjects.ts             # CRUD de proyectos (React Query)
├── lib/
│   ├── generateGroovy.ts           # Motor de generación de Jenkinsfiles
│   ├── supabase.ts                 # Cliente Supabase
│   └── utils.ts
├── pages/
│   ├── Auth.tsx                    # Login / Registro
│   ├── Dashboard.tsx               # Lista de proyectos
│   └── Editor.tsx                  # Editor visual (3 columnas)
└── types/
    └── pipeline.ts                 # Interfaces y tipos del pipeline
```

## ⚡ Inicio Rápido

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd jenkinsflow-architect

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase:
#   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
#   VITE_SUPABASE_PUBLISHABLE_KEY=tu-anon-key

# Iniciar en desarrollo
npm run dev
```

## 🗄️ Base de Datos

La app utiliza una tabla `projects` con Row Level Security (RLS) — cada usuario solo puede acceder a sus propios pipelines:

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | UUID | Identificador único |
| `user_id` | UUID | Referencia al usuario autenticado |
| `name` | TEXT | Nombre del proyecto |
| `description` | TEXT | Descripción opcional |
| `json_config` | JSONB | Configuración visual del pipeline |
| `generated_groovy` | TEXT | Jenkinsfile generado |
| `created_at` | TIMESTAMPTZ | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | Última modificación (auto) |

## 📸 Flujo de Uso

1. **Regístrate** con email y contraseña.
2. **Crea un proyecto** desde el Dashboard.
3. **Configura** el agente, variables de entorno y parámetros en el panel izquierdo.
4. **Añade stages** y configura sus steps en el panel central.
5. **Previsualiza** el Jenkinsfile generado en tiempo real en el panel derecho.
6. **Exporta** — copia al portapapeles o descarga como archivo `Jenkinsfile`.

## 📝 Licencia

MIT

---

Desarrollado como proyecto final del curso de Jenkins — CodeStars, marzo 2026.
