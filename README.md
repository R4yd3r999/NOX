# NOX — Notas & Rutinas

App modular local (sin backend, sin cuentas, sin suscripciones): Notas + Rutinas de Gym.
Todo se guarda en el dispositivo (localStorage) — 100% offline.

## Cambios de esta entrega

- **Ícono/branding**: la imagen `Nox.png` que enviaste ahora es el ícono de la app
  en todos lados — PWA, favicon, ventana y ejecutable de Windows (Electron), y el
  set completo de íconos/splash de Android (legacy, adaptativo `mipmap-anydpi-v26`
  y las 11 resoluciones de splash). También aparece dentro de la interfaz, junto
  al logo "N0X" de la barra superior. De paso corregí el fondo del ícono
  adaptativo de Android, que estaba en blanco por defecto (`#FFFFFF` sin usar) y
  quedaba con un halo blanco alrededor del ícono en el launcher — ahora es
  `#08080A`, el mismo tono que el resto de la app.
- **Fix — interfaz superpuesta con la barra de estado (batería/hora)**: el
  proyecto está compilado contra `targetSdkVersion 36`, que fuerza el modo
  edge-to-edge (el contenido dibuja detrás de la barra de estado siempre, no es
  opcional desde Android 15). El CSS no tenía relleno para eso, así que la barra
  superior de la app quedaba debajo de los íconos del sistema. Se agregó
  `padding-top: env(safe-area-inset-top)` a la barra superior, y además se
  incorporó `@capacitor/status-bar` para pintar la barra de estado nativa del
  mismo color que la app en vez de dejarla con el estilo por defecto del sistema.
- **Fix — lag en Android**: el fondo animado de partículas usaba
  `ctx.shadowBlur` (sombra recalculada por partícula en cada frame — muy costoso
  en el renderer de canvas de Android), corría a la resolución de pantalla completa
  (hasta 2x) y sin límite de FPS, y quedaba debajo de tres paneles con
  `backdrop-filter: blur()` que WebView tiene que recomponer en cada frame que el
  canvas cambia. Se quitó el `shadowBlur`, se bajó a resolución 1x y ~16
  partículas en nativo, se topeó la animación a ~30fps, y se desactivó el
  `backdrop-filter` específicamente en el build nativo de Android (se reemplaza
  por un fondo sólido un poco más opaco, visualmente casi igual).

> Estos tres puntos requieren volver a correr `npm install` una vez (se agregó
> una dependencia nueva, `@capacitor/status-bar`) y luego `npx cap sync android`
> antes de recompilar el APK — ver pasos abajo.

Este paquete ya incluye:
- **PWA** (instalable en Android desde el navegador, sin tienda).
- **Electron** (para compilar `.exe` de Windows / `.AppImage` de Linux), con barra de
  título integrada al tema (sin flash blanco al abrir, controles nativos coloreados)
  y sidebar de navegación en pantallas grandes (no la barra inferior de móvil).
- **Capacitor** (proyecto Android nativo ya generado en `android/`, listo para compilar `.apk`).

## Novedades de esta versión (Rutinas)

- Cada ejercicio se puede **reordenar arrastrando** (drag & drop, funciona con mouse y
  dedo) — solo disponible cuando el día está en modo **EDITAR**.
- El botón de editar ahora vive en el **día**, no en cada ejercicio: al activar
  "EDITAR" aparecen el asa de arrastre, el botón de eliminar por ejercicio y "+ EJERCICIO".
  Fuera de modo edición, la rutina se ve limpia, solo para consulta.
- Junto a la letra de variante (A/B/C…) hay un botón **"+"** para crear una variante
  nueva en blanco al instante, sin tener que duplicar y borrar ejercicios.
- La vista "vertical" ahora es una **vista enfocada por día**: pestañas horizontales
  arriba para elegir el día, y abajo solo esa rutina, centrada y grande — nada de
  tarjetas apiladas.
- Filas de ejercicio rediseñadas con chips grandes (series / reps / peso) para mejor legibilidad.

---

## 0. Requisitos únicos (una sola vez, con internet)

```bash
npm install
```

---

## 1. PC — Windows portable (.exe)

Ya te entregué `NOX-Portable.exe` compilado, listo para usar: cópialo a cualquier PC
Windows y ábrelo con doble clic. **No instala nada, no pide permisos de administrador,
no necesita .NET/Java/runtimes adicionales, no necesita internet.** Bórralo y no queda rastro.

Si quieres volver a generarlo tú (por ejemplo tras modificar el código):

```bash
npm run dist:win
```

El archivo queda en `release/NOX-Portable.exe`.

---

## 2. Android — APK instalable

### Camino A — El más simple: instalar como PWA (sin APK, sin Android Studio)

1. Sube la carpeta `dist/` (o el zip `nox-app-web-pwa.zip` descomprimido) a cualquier
   hosting gratuito: GitHub Pages, Netlify, Vercel, Cloudflare Pages.
2. Abre esa URL en Chrome de tu Android.
3. Menú (⋮) → **"Instalar app"** / **"Agregar a pantalla de inicio"**.
4. Queda como app real, con ícono, pantalla completa, funciona offline.

### Camino B — APK real para sideload (solo terminal, sin Android Studio)

Necesitas: **Java JDK 17** instalado (el Gradle Wrapper se descarga solo).

```bash
npm run build          # genera dist/
npx cap sync android    # copia dist/ al proyecto android/
cd android
./gradlew assembleDebug
```

El `.apk` queda en `android/app/build/outputs/apk/debug/app-debug.apk`.

### Camino C — Generar el APK 100% online (cero instalación)

1. Sube `dist/` a un hosting gratuito (igual que en el Camino A).
2. Ve a **https://www.pwabuilder.com**, pega la URL.
3. "Package for stores" → Android → descarga el `.apk`/`.aab` ya firmado.

---

## Backup de rutinas

Los botones **Exportar/Importar** del módulo de Rutinas generan/leen un `.json`
con todos los días, versiones y ejercicios — funciona igual en la versión web,
Windows o Android.

## Estructura del proyecto

```
src/                 # código React (notas, gym, componentes, estilos)
electron/            # proceso principal de Electron (ventana de escritorio)
android/             # proyecto nativo Android generado por Capacitor
capacitor.config.json
branding/            # ícono fuente en alta resolución
public/               # íconos PWA, favicon
```
