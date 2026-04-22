# Guía de agente: Capacitor + Android a partir de Next.js (replicar en otro proyecto)

Documento de procedimiento **inferido del repo `municipis-cat`**. Un agente debe seguirlo en orden, adaptando nombres de app, `appId` y rutas. No sustituye la documentación de [Capacitor](https://capacitorjs.com/docs) ni de Google Play.

---

## 0) Modelo de arquitectura (decisión fija en este patrón)

- **Web embebida:** export estático de Next → carpeta `out/` → `webDir` de Capacitor.
- **Backend:** **no** va dentro del bundle; la app llama a una API remota (HTTPS) vía `NEXT_PUBLIC_*` incrustadas en el JS en tiempo de build.
- **Rutas `app/api` de Next:** en build estático **no existen** en el cliente. Se **apartan temporalmente** del árbol `src` durante `next build` (carpeta stash) y se restauran al finalizar, para no romper el repo mientras se genera `out/`.
- **CORS y auth:** el servidor debe aceptar el origen del WebView (`capacitor://localhost`, etc.); el JWT en móvil suele ir en **Bearer** + `@capacitor/preferences`, no en cookies HttpOnly cross-origin.

Si el otro proyecto **no** usa Next o **no** tiene carpetas a excluir, elimina o simplifica el paso del stash y solo exporta/empaqueta con la herramienta que corresponda (Vite, CRA, etc.) hacia el `webDir` definido en `capacitor.config.*`.

---

## 1) Dependencias npm (alinear versiones de Capacitor)

- Instalar y fijar la **misma major** en `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` (en este repo: **7.x**).
- Añadir plugins según producto, por ejemplo:
  - `@capacitor/preferences` (persistencia segura de tokens u opciones)
  - `@capacitor/camera` (si aplica)
  - `@capacitor-community/admob` (anuncios)
  - plugin de compras in-app (ej. `@adplorg/capacitor-in-app-purchase`) solo si hace falta; puede requerir **parches** (ver sección 10).
- Dev: `@capacitor/assets` para iconos/splash, `patch-package` si hay parches a `node_modules`.

Tras añadir plugins: `npx cap sync` (o el script `android:sync` del `package.json`).

---

## 2) `capacitor.config.ts` (o `.json`) en la raíz del front

Configurar como mínimo:

- `appId`: identificador Android inverso (ej. `com.empresa.app`) — **debe coincidir** con `applicationId` / namespace en Gradle.
- `appName`: nombre visible.
- `webDir`: carpeta de salida del build web; aquí es **`out`** (export Next).

```ts
// Referencia mínima (ajustar valores)
const config = { appId: "com.jemplo.app", appName: "mi-app", webDir: "out" };
```

---

## 3) Next.js: condicionar `output: "export"` solo para el build Capacitor

En `next.config.*`:

- Leer una variable (ej. `CAPACITOR_STATIC=1`) **y** `NODE_ENV === "production"` antes de activar:
  - `output: "export"`
  - `images: { unoptimized: true }` (o equivalente si el export no soporta optimización remota de imágenes).
- Normalizar URLs públicas (ej. `NEXT_PUBLIC_API_URL`) a **URL absoluta con `https://`**, para que workbox y el cliente se comporten igual en web y en APK.
- Cualquier lógica PWA/Workbox que use rutas `/api` en mismo origen: en app nativa la API es **otro origen**; añade reglas `NetworkOnly` o patrones al **origin** del `NEXT_PUBLIC_API_URL` (como en este repo: regex sobre el origin del API).

**No** activar `CAPACITOR_STATIC` en `next dev` salvo sabiendo que **no** tendrás rutas `app/api` locales en desarrollo.

---

## 4) Script de build: variable de entorno + stash de `src/app/api` + `next build` + `cap sync`

**Patrón Windows (`build-capacitor.ps1`):**

1. Comprobar que no quede un stash previo (carpeta tipo `.api-server-only-stash`).
2. `Move-Item` de `src\app\api` → carpeta de stash.
3. ` $env:CAPACITOR_STATIC = '1'`
4. `npm run build` (que ejecuta `next build` y genera `out/`)
5. `npx cap sync`
6. En `finally`: restaurar `src\app\api` desde el stash.

**Patrón Unix (`build-capacitor.sh`):** mismo flujo con `mv`, `export CAPACITOR_STATIC=1`, `trap` para restaurar al salir.

**Comprobación lightningcss (Tailwind 4+):** si el `npm install` se hizo en un SO y el build en otro (p. ej. Windows vs WSL Linux), faltan binarios opcionales. El script bash de este repo **falla** si no hay `lightningcss-linux-*` en WSL. Solución: reinstalar `node_modules` en el mismo SO que ejecuta el build, o un solo entorno (recomendado: **Windows nativo** para el pipeline que genera el AAB).

**Entradas de `package.json` a replicar:**

- `build:capacitor`: nodo que carga `.env` + `.env.capacitor.production` y delega al script PS1 o `.sh` (ver `scripts/run-capacitor-build.mjs` en el repo).
- `cap:sync` / `android:sync`, `android:open`, `android:bundle` (Gradle `bundleRelease`), `android:icons` (Capacitor Assets).

---

## 5) Variables de entorno del build móvil

- Plantilla versionada: `scripts/capacitor-build.env.example` → el desarrollador copia a **`.env.capacitor.production`** en la raíz (**no** commitear secretos; `.gitignore` debe ignorarla).
- El loader (ej. `run-capacitor-build.mjs`) debe: cargar `.env` si existe, luego **`.env.capacitor.production` con override** — todo antes de `next build`, para inyectar `NEXT_PUBLIC_*` en el JS.
- Mínimo habitual: `NEXT_PUBLIC_API_URL`, flags de auth/privacidad y, si hay anuncios, flags AdMob.
- Aviso en script si `NEXT_PUBLIC_API_URL` está vacío: el build puede completarse pero la app quedará sin API.

---

## 6) Plataforma Android: primera creación e integración

1. `npm install`
2. Tras el primer `out/` generado (o carpeta `webDir` existente y no vacía): `npx cap add android` (una vez; el repo ya incluye `android/`).
3. Cualquier vez que cambies plugins o versiones: `npx cap sync` o `npx cap sync android`.

Estructura relevante (no regenerar a mano lo que `cap sync` reescribe sin motivo):

- `android/capacitor.settings.gradle` — incluido por `android/settings.gradle` vía `apply from: 'capacitor.settings.gradle'`.
- `android/app/capacitor.build.gradle` — generado/actualizado por Capacitor; **no editar** a mano (comentario en el propio fichero).
- `android/variables.gradle` y `android/gradle.properties` — versiones SDK, dependencias (ej. UMP, Play Services Ads alineados con el plugin AdMob).

---

## 7) Android nativo: personalizar este repo (puntos clave)

| Área | Qué mirar en `municipis-cat` |
|------|------------------------------|
| **IDs y nombres** | `android/app/build.gradle` → `namespace`, `applicationId`, `versionCode`, `versionName` |
| **Firma release** | `keystore.properties` (rutas, alias) + secretos en `keystore.local.properties` o variables de entorno `ANDROID_KEYSTORE_PASSWORD` / `ANDROID_KEY_PASSWORD` |
| **Bloqueo Gradle** | Tarea `whenReady`: exige contraseñas de release si el keystore está definido, para no generar AAB no firmado por error |
| **AdMob** | `AndroidManifest.xml` → `meta-data` con `@string/admob_app_id`; `res/values/strings.xml` con el **App ID** de consola; permiso `AD_ID` si aplica política de anuncios |
| **UMP (GDPR)** | dependencia UMP en `app/build.gradle` (versión alineada con `variables.gradle`); `MainActivity` registra un plugin custom `ConsentPlugin` (Java) que expone UMP a JS |
| **MainActivity** | extiende `com.getcapacitor.BridgeActivity`; registrar plugins nativos con `registerPlugin(...)` **antes** de `super.onCreate` |

**Nota estructural:** los `.java` viven bajo un path de paquetes; el `package` debe ser coherente con el directorio o Android Studio/Gradle quejan. Ajusta carpetas a `com/tu/app/` si replicás desde cero (este repo nombra el paquete `com.geodiari.app`).

---

## 8) `google-services.json` (opcional, FCM u otros)

Si existe y tiene contenido, se aplica el plugin `com.google.gms.google-services` en `app/build.gradle` (try/catch). Si no, se omite y el log indica que push puede no configurarse.

---

## 9) Iconos y splash

- Fuente recomendada: `assets/logo.png` (tamaño suficiente, p. ej. ≥1024px).
- Comando de referencia en `package.json`: `android:icons` con `npx capacitor-assets generate` (colores de fondo según diseño).
- Volver a `cap sync` si el tooling lo requiere tras regenerar recursos.

---

## 10) `patch-package` (cuando un plugin de Capacitor no compila o está roto)

Este repo aplica un parche a `@adplorg/capacitor-in-app-purchase` (p. ej. acceso a `notifyListeners`); `postinstall` ejecuta `patch-package`.

- Si actualizas la versión del paquet npm, **revalida** el parche: puede hacer falta `npx patch-package <paquete>` tras arreglar `node_modules` manualmente.
- No versionar `node_modules`; sí versionar `patches/*.patch`.

---

## 11) Flujo de trabajo de publicación (resumen operativo)

1. Subir `versionCode` (entero creciente) y `versionName` en `android/app/build.gradle`.
2. Tener listo `.env.capacitor.production` con todas las `NEXT_PUBLIC_*` de producción.
3. `npm run build:capacitor` (export + `npx cap sync`).
4. Configurar credenciales de keystore (archivo local o env vars).
5. `cd android && ./gradlew bundleRelease` (o `gradlew.bat` en Windows) / script `android:bundle`.
6. Comprobar firma: `jarsigner -verify -verbose:summary` sobre el `.aab` generado.
7. Subir el **AAB** a la pista de pruebas o producción en Play Console.

(Detalle alineado con `flujo-prod.md` y el README del proyecto.)

---

## 12) Checklist de verificación para el agente

- [ ] Misma versión major en `@capacitor/core`, `cli` y `android`.
- [ ] `webDir` == salida real del build (ej. `out`).
- [ ] `CAPACITOR_STATIC=1` solo en el script que hace el export, no en dev accidental.
- [ ] Stash de `app/api` restaurado **siempre** (try/finally o trap), incluso con fallo de build.
- [ ] `NEXT_PUBLIC_API_URL` definida en el entorno de build o en `.env.capacitor.production`.
- [ ] `npx cap sync` ejecutado tras cada build web o cambio de plugins.
- [ ] `applicationId` / namespace coherentes con `appId` de Capacitor.
- [ ] AAB de release firmado; Play rechaza `versionCode` no incrementado.
- [ ] WSL/Windows: no mezclar `node_modules` entre sistemas; preferir un solo entorno de build.

---

## 13) Comandos de referencia (raíz del repo, tras adaptar nombres)

```bash
npm install
# Crear .env.capacitor.production desde la plantilla de scripts

npm run build:capacitor
# o en Windows, sin loader de env: npm run build:capacitor:direct

npm run android:open
npm run android:bundle
```

---

*Fin. Ajusta solo lo necesario: si el otro stack no es Next, sustituye las secciones 3–4 por el pipeline SSG/SPA que produzca archivos estáticos en el `webDir` y mantén el resto (Capacitor, Gradle, firmas, Play) igual.*
