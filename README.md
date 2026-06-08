# 🎬 Watchlist Netflix - Prueba Técnica

Sistema de gestión de listas de seguimiento para películas y series, desarrollado con **.NET 10**, **MySQL** y **React**.

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Configuración del Entorno](#-configuración-del-entorno)
- [Ejecución del Proyecto](#-ejecución-del-proyecto)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Características Implementadas](#-características-implementadas)
- [Notas de Seguridad](#-notas-de-seguridad)

---

## 📖 Descripción

Aplicación web que permite a los usuarios:
- Autenticarse mediante JWT
- Crear múltiples listas de seguimiento personalizadas
- Buscar películas y series con filtros avanzados
- Ver información detallada de cada contenido
- Añadir/eliminar contenido de sus listas

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **.NET 10.0** (ASP.NET Core Web API)
- **MySQL 8.0** (Base de datos relacional)
- **Entity Framework Core 9.0** (ORM para escrituras)
- **Dapper + SqlKata** (Micro-ORM para lecturas optimizadas)
- **BCrypt.Net** (Hashing de contraseñas)
- **JWT Bearer Authentication** (Autenticación segura)
- **Swagger/OpenAPI** (Documentación de API)

### Frontend
- **React 18**
- **Vite** (Build tool)
- **React Router** (Navegación)
- **Axios** (Cliente HTTP)

### Herramientas
- **Visual Studio 2026 / VS Code**
- **phpMyAdmin / MySQL Workbench** (Gestión de BD)
- **Git** (Control de versiones)

---

## 🏗️ Arquitectura del Proyecto

**Patrón CQRS simplificado:**
- **Entity Framework Core**: Operaciones de escritura (Create, Update, Delete)
- **Dapper + SqlKata**: Operaciones de lectura optimizadas con queries complejas

**Capas:**
```
WatchlistAPI/
├── Controllers/        # Endpoints de la API
├── Services/           # Lógica de negocio
├── Data/              # Contexto EF Core
├── Models/            # Entidades de dominio
├── DTOs/              # Data Transfer Objects
└── Infrastructure/    # Configuraciones y utilidades
```

---

## ✅ Requisitos Previos

- **.NET SDK 10.0+** → [Descargar](https://dotnet.microsoft.com/download)
- **MySQL 8.0+** → [Descargar](https://dev.mysql.com/downloads/)
- **Node.js 18+** (para el frontend) → [Descargar](https://nodejs.org/)
- **Git** → [Descargar](https://git-scm.com/)

---

## ⚙️ Configuración del Entorno

### 1. Clonar el Repositorio

```bash
git clone https://github.com/adrianurdaneta/PruebaTecnicaInsfera.git
cd PruebaTecnicaInsfera
```

### 2. Configurar la Base de Datos

#### Opción A: Usando phpMyAdmin
1. Acceder a phpMyAdmin
2. Crear base de datos: `netflix`
3. Importar `database/schema.sql.txt`
4. Importar `database/seed.sql.txt`

#### Opción B: Usando línea de comandos
```bash
mysql -u root -p
CREATE DATABASE netflix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE netflix;
SOURCE database/schema.sql.txt;
SOURCE database/seed.sql.txt;
EXIT;
```

### 3. Configurar User Secrets (Backend)

**User Secrets** permite almacenar credenciales de forma segura sin exponerlas en el repositorio.

```bash
cd WatchlistAPI

# Inicializar User Secrets (si no está configurado)
dotnet user-secrets init

# Configurar conexión a MySQL
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost;Port=3306;Database=netflix;User=TU_USUARIO;Password=TU_CONTRASEÑA;"

# Configurar JWT Settings
dotnet user-secrets set "JwtSettings:Secret" "TU_CLAVE_SECRETA_MINIMO_32_CARACTERES"
dotnet user-secrets set "JwtSettings:Issuer" "WatchlistAPI"
dotnet user-secrets set "JwtSettings:Audience" "WatchlistFront"
dotnet user-secrets set "JwtSettings:ExpirationInMinutes" "120"
```

> **📌 Nota:** Reemplaza `TU_USUARIO`, `TU_CONTRASEÑA` y `TU_CLAVE_SECRETA_MINIMO_32_CARACTERES` con tus valores reales.

**Alternativa:** Si prefieres usar `appsettings.json` (solo para desarrollo local):
1. Copia `appsettings.Example.json` a `appsettings.json`
2. Edita las credenciales con tus valores reales
3. **NUNCA** hagas commit de `appsettings.json` (está en `.gitignore`)

### 4. Verificar Configuración

```bash
# Listar User Secrets configurados
dotnet user-secrets list
```

---

## 🚀 Ejecución del Proyecto

### Backend (API)

```bash
cd WatchlistAPI

# Restaurar dependencias
dotnet restore

# Compilar
dotnet build

# Ejecutar
dotnet run --urls "http://localhost:5286"
```

La API estará disponible en: **http://localhost:5286**  
Swagger UI: **http://localhost:5286/swagger**

### Frontend

```bash
cd watchlist-front

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

El frontend estará disponible en: **http://localhost:5173**

---

## 🔌 Endpoints de la API

### 🔐 Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | ❌ |
| POST | `/api/auth/login` | Iniciar sesión (devuelve JWT) | ❌ |

**Ejemplo de Login:**
```json
POST /api/auth/login
{
  "username": "user1",
  "password": "password123"
}
```

### 🎬 Media (Catálogo)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/media` | Listar películas/series con filtros | ✅ |
| GET | `/api/media/{id}` | Obtener detalle de contenido | ✅ |
| GET | `/api/media/genres` | Listar géneros disponibles | ✅ |

**Parámetros de búsqueda:**
- `?search=titulo` - Búsqueda por título
- `?type=Movie|Series` - Filtrar por tipo
- `?genre=Action` - Filtrar por género
- `?year=2024` - Filtrar por año

### 📋 Watchlist (Listas de Seguimiento)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/watchlist` | Obtener listas del usuario | ✅ |
| POST | `/api/watchlist` | Crear nueva lista | ✅ |
| PUT | `/api/watchlist/{id}` | Actualizar lista | ✅ |
| DELETE | `/api/watchlist/{id}` | Eliminar lista | ✅ |
| POST | `/api/watchlist/{id}/items` | Añadir contenido a lista | ✅ |
| DELETE | `/api/watchlist/{id}/items/{mediaId}` | Eliminar contenido de lista | ✅ |

---

## 📁 Estructura del Proyecto

```
PruebaTecnicaInsfera/
│
├── WatchlistAPI/                    # Backend (.NET)
│   ├── Controllers/
│   │   ├── AuthController.cs        # Autenticación
│   │   ├── MediaController.cs       # Catálogo de contenido
│   │   └── WatchlistController.cs   # Gestión de listas
│   ├── Data/
│   │   └── WatchlistDbContext.cs    # Contexto EF Core
│   ├── DTOs/
│   │   ├── AuthDto.cs
│   │   ├── MediaDto.cs
│   │   └── WatchlistDto.cs
│   ├── Models/
│   │   ├── User.cs
│   │   ├── Watchlist.cs
│   │   └── WatchlistItem.cs
│   ├── Services/
│   │   └── MediaReadService.cs      # Servicio de lecturas con Dapper
│   ├── Program.cs                   # Punto de entrada
│   ├── appsettings.Example.json     # Plantilla de configuración
│   └── WatchlistAPI.csproj
│
├── watchlist-front/                 # Frontend (React)
│   ├── src/
│   │   ├── components/              # Componentes reutilizables
│   │   ├── pages/                   # Páginas
│   │   ├── services/                # Servicios HTTP
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── schema.sql.txt               # Esquema de base de datos
│   └── seed.sql.txt                 # Datos de prueba
│
├── .gitignore
└── README.md
```

---

## ✨ Características Implementadas

### Funcionalidades Core
✅ Sistema de autenticación con JWT  
✅ Registro e inicio de sesión de usuarios  
✅ Hashing seguro de contraseñas (BCrypt)  
✅ Gestión completa de listas de seguimiento (CRUD)  
✅ Catálogo de películas/series con búsqueda avanzada  
✅ Filtros por título, tipo, género y año  
✅ Añadir/eliminar contenido de listas  
✅ Validación de propietario de listas (seguridad)  

### Características Técnicas
✅ Patrón CQRS (EF Core + Dapper)  
✅ Modelo de datos normalizado  
✅ Consultas SQL optimizadas con SqlKata  
✅ Documentación automática con Swagger  
✅ CORS configurado para frontend  
✅ User Secrets para credenciales  
✅ Arquitectura en capas  

---

## 🔒 Notas de Seguridad

### Producción vs Desarrollo

⚠️ **Este es un proyecto de prueba técnica**. Para un entorno de producción, considerar:

1. **Secretos y Credenciales:**
   - Usar Azure Key Vault o AWS Secrets Manager
   - Rotar claves JWT regularmente
   - Implementar refresh tokens

2. **Autenticación:**
   - Añadir rate limiting en login
   - Implementar bloqueo de cuentas tras intentos fallidos
   - Validar fortaleza de contraseñas

3. **Base de Datos:**
   - Usar prepared statements (ya implementado)
   - Configurar SSL para conexiones MySQL
   - Backups automáticos

4. **API:**
   - Implementar throttling/rate limiting
   - Validar y sanitizar todos los inputs
   - Logs de auditoría

---

## 👤 Credenciales de Prueba

```
Usuario: user1
Contraseña: password123

Usuario: admin
Contraseña: admin123
```

---

## 📝 Notas del Desarrollador

### Decisiones Técnicas

1. **CQRS Simplificado:** 
   - EF Core para escrituras (transaccionalidad)
   - Dapper para lecturas (rendimiento en queries complejas)

2. **User Secrets:**
   - Evita exposición de credenciales en repositorio
   - Fácil configuración local

3. **Modelo Normalizado:**
   - Tabla intermedia `watchlist_items` (relación N:N)
   - Tabla `media_genres` para géneros múltiples

4. **JWT sin Refresh Token:**
   - Simplificación para prueba técnica
   - Expiración configurada en 120 minutos

---

## 📧 Contacto

**Autor:** Adrián Urdaneta  
**GitHub:** [github.com/adrianurdaneta](https://github.com/adrianurdaneta)

---

## 📄 Licencia

Este proyecto es una prueba técnica para **Insfera** y no tiene licencia de distribución pública.

---

**Fecha de desarrollo:** Junio 2026  
**Versión:** 1.0.0

