RESUMEN: Monorepo (Next.js + FastAPI) en Railway
El Problema
Monorepo con npm workspaces + dos servicios diferentes (Next.js y FastAPI) = conflictos de config, dependencias no resueltas, healthchecks incompatibles.

La Solución (en 6 pasos)
1. DOCKERFILES SEPARADOS
Dockerfile.web: Copia monorepo completo → npm ci desde raíz → npm run build -w @quantum-ops/web → npm start -w @quantum-ops/web
Dockerfile.api: Copia monorepo → instala Python deps → uvicorn app.main:app
2. HEALTHCHECKS DIFERENTES
API: /health (endpoint FastAPI)
Web: / (Next.js homepage)
NO compartas railway.json entre servicios
3. VARIABLES DE REFERENCIA
API → Web: QUANTUM_API_CORS_ORIGINS=${{ web.RAILWAY_PUBLIC_DOMAIN }}
Web → API: QUANTUM_API_SERVER_URL=http://quantum.railway.internal:8000
4. NEXT.JS STANDALONE
output: "standalone" en next.config.ts ✅
Pero usa npm start (no node server.js) ✅
Copia monorepo completo en Dockerfile (resuelve @quantum-ops/shared-types) ✅
5. CAPACITOR ANDROID
export CAPACITOR_SERVER_URL=https://web-production-0c140.up.railway.app
npx cap sync android
# LUEGO compilar
6. RAILWAY CONFIG
API: railway.json en raíz + Dockerfile custom
Web: Dockerfile custom + healthcheck /
Database: Variables de referencia automáticas
Checklist para próximos proyectos
✅ Dockerfiles en infrastructure/docker/
✅ Copia monorepo completo (no rootDirectory)
✅ Instala desde raíz (npm ci en /app)
✅ Healthchecks diferentes por servicio
✅ Variables de referencia entre servicios
✅ Para mobile: CAPACITOR_SERVER_URL antes de compilar


😂 Capítulo 8: "The Port Wars"

Escena: 15:13 UTC, web-production-0c140.up.railway.app

Después de 2 horas de batallas:

✅ Dockerfiles funcionando
✅ Healthchecks correctos
✅ Dependencias resueltas
✅ Monorepo compilando
El frontend está ONLINE. La app responde. Todo funciona.

Pero cuando abres la URL... "Application failed to respond"

Los logs dicen:

- Local:         http://localhost:8080
- Network:       http://10.250.13.187:8080
Next.js está escuchando en 8080.

Railway está esperando 3000.

El Problema:

ENV PORT=3000 en el Dockerfile ✅
EXPOSE 3000 ✅
Pero npm start -w @quantum-ops/web ignora la variable
La Solución:

PORT=3000 npm start -w @quantum-ops/web
Forzar la variable en el comando.

Moraleja: Environment variables en Dockerfiles no siempre se heredan a los procesos hijo. A veces tienes que pasarlas explícitamente en el comando.

Lección para el libro: