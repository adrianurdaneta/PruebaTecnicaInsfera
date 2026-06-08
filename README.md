Watchlist - Prueba técnica

Estructura:
- WatchlistAPI/ : proyecto backend en .NET
- watchlist-front/ : frontend (Vite + React)
 - database/: scripts SQL para MySQL

Pasos rápidos:
1. Crear la base de datos: ejecutar database/schema.sql y database/seed.sql en MySQL.
2. Configurar cadena en WatchlistAPI/appsettings.ConnectionExample.json y renombrar a appsettings.json en el proyecto.
3. Backend: dotnet build WatchlistAPI
4. Frontend: desde watchlist-front/ ejecutar npm install && npm run dev
