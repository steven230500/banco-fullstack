# banco-web (frontend Angular)

Interfaz web del ejercicio técnico Banco: gestión de **Clientes**, **Cuentas**, **Movimientos** y
**Reportes** (estado de cuenta en pantalla y descarga en PDF). Consume la API REST del backend
(contrato en Swagger UI: `http://localhost:8080/swagger-ui.html`).

| Tecnología | Versión |
|---|---|
| Angular (standalone, signals, zoneless) | 21.2 |
| Node | 24.6 (local) / `node:24-alpine` (Docker) |
| Pruebas unitarias | Jest 30 + jest-preset-angular 17 (jsdom) |
| Lint | ESLint 10 + angular-eslint 21 (incluye reglas de accesibilidad de plantillas) |
| Servidor en Docker | `nginxinc/nginx-unprivileged:alpine` (usuario no root, puerto 8080) |

Sin frameworks de estilos ni librerías de componentes: todo el CSS está escrito a mano con
*design tokens* (custom properties) en `src/styles.css`.

## Scripts

| Comando | Descripción |
|---|---|
| `npm start` | `ng serve` en `http://localhost:4200`, con proxy de `/api` → `http://localhost:8080` (`proxy.conf.json`) |
| `npm run build` | Build de producción en `dist/banco-web/browser` |
| `npm test` | Pruebas unitarias con Jest |
| `npm run test:coverage` | Pruebas + reporte de cobertura (`coverage/`; umbral global 80 % de líneas) |
| `npm run test:watch` | Jest en modo watch |
| `npm run lint` | ESLint (TS + plantillas HTML) vía `ng lint` |
| `npm run typecheck` | Chequeo de tipos de la app y de las pruebas (`tsc --noEmit`) |
| `npm run format` | Prettier sobre `src/` |

```bash
npm ci
npm start                # requiere el backend en :8080
npm test
npm run test:coverage
npm run build
docker build -t banco-web .
```

## Estructura

```
src/
├── app/
│   ├── app.ts / app.html / app.css   Layout: cabecera "BANCO", menú lateral, <router-outlet>, toasts
│   ├── app.config.ts                 Zoneless, router (lazy + input binding), HttpClient + interceptor
│   ├── app.routes.ts                 Rutas raíz con loadChildren por funcionalidad
│   ├── core/                         Infraestructura transversal (sin UI)
│   │   ├── api/api-base-url.token.ts     InjectionToken API_BASE_URL = '/api'
│   │   ├── http/api-error.ts             ApiError + toApiError (Problem Details → error tipado)
│   │   ├── http/error.interceptor.ts     Interceptor funcional que normaliza todos los errores HTTP
│   │   ├── models/                       Modelos y enums del contrato (uniones de literales)
│   │   └── notifications/                NotificationService (toasts con signals)
│   ├── shared/                       Piezas reutilizables y sin lógica de negocio
│   │   ├── components/                   alert, confirm-dialog, field-error, list-toolbar,
│   │   │                                 page-header, search-box, toast-container
│   │   ├── table/                        data-table genérica, Columna<T>, ListaCrud<T> (estado de listados)
│   │   ├── forms/                        validadores, mensajes, mapeo de errores del servidor, EnvioFormulario
│   │   ├── search/search-filter.ts       Búsqueda rápida (función pura)
│   │   ├── format/                       Formato de moneda/fecha/estado (funciones puras + pipes)
│   │   └── download/download-file.ts     base64 → Blob → object URL → descarga
│   └── features/
│       ├── clientes/    data-access/ · cliente-list/ · cliente-form/ · clientes.routes.ts
│       ├── cuentas/     data-access/ · cuenta-list/  · cuenta-form/  · cuentas.routes.ts
│       ├── movimientos/ data-access/ · movimiento-list/ · movimiento-form/ · movimientos.routes.ts
│       └── reportes/    data-access/ · reporte-page/ · reporte-resumen/ · reportes.routes.ts
├── testing/                          Utilidades y datos de prueba (solo para Jest)
└── styles.css                        Tokens de diseño + estilos globales
```

Rutas: `/clientes`, `/clientes/nuevo`, `/clientes/:clienteId/editar`, `/cuentas`, `/cuentas/nuevo`,
`/cuentas/:numeroCuenta/editar`, `/movimientos`, `/movimientos/nuevo`, `/movimientos/:id/editar`,
`/reportes`.

## Decisiones de arquitectura

- **Standalone + signals + zoneless + OnPush.** Todo el estado de pantalla vive en `signal`/`computed`;
  no hay `zone.js`. Todos los componentes usan `ChangeDetectionStrategy.OnPush` (regla de lint).
- **Capas por responsabilidad.** `core` (infraestructura), `shared` (UI genérica y funciones puras),
  `features` (una carpeta por agregado del dominio). Cada funcionalidad tiene su servicio
  `data-access` tipado (único lugar con `HttpClient`), una página de listado y una de formulario.
- **Carga diferida.** Cada funcionalidad se carga con `loadChildren`/`loadComponent`; los parámetros de
  ruta llegan como `input()` gracias a `withComponentInputBinding()`.
- **Composición en lugar de herencia.** `ListaCrud<T>` encapsula carga, búsqueda y eliminación con
  confirmación; `EnvioFormulario` encapsula validación al enviar, llamada a la API, toast de éxito y
  errores del servidor. Las páginas solo declaran columnas, formularios y qué servicio llamar.
- **Errores uniformes.** El interceptor convierte cualquier `HttpErrorResponse` en `ApiError`
  (`status`, `codigo`, `detalle`, `errores[]`). Los formularios muestran `detalle` en una alerta
  visible y asignan cada `errores[].campo` al control con el mismo nombre (error `servidor`), que se
  muestra bajo el campo. Los errores al eliminar (p. ej. 409) se muestran como toast.
- **Validación espejo del contrato.** Formularios reactivos tipados (`NonNullableFormBuilder`) con los
  patrones/rangos del backend; los mensajes aparecen bajo cada campo tras tocarlo o al enviar.
  Los requests se construyen con funciones puras (`*-form.model.ts`), fáciles de probar.
- **Edición con PUT.** Campos inmutables (`clienteId`, `numeroCuenta`, cuenta del movimiento) se
  deshabilitan en edición. La contraseña del cliente solo se envía si se escribe una nueva.
  Movimientos: el backend solo permite editar/eliminar el último de cada cuenta; la UI muestra su 409.
- **Búsqueda rápida.** `filtrarFilas` filtra sobre el *texto visible* de cada columna (lo mismo que
  ve el usuario: montos formateados, "Activo", "Depósito"…), sin distinguir mayúsculas ni tildes y
  exigiendo todas las palabras.
- **Fechas sin desfase.** Las fechas se formatean a partir del texto ISO (sin `new Date`), para
  mostrar la hora registrada por el banco independientemente de la zona del navegador.
- **PDF.** `GET /api/reportes/pdf` devuelve base64; se decodifica a `Blob`, se descarga con un
  `<a download>` temporal y se revoca la object URL.
- **Accesibilidad.** Enlace "Saltar al contenido", `aria-current` en el menú, `label` en todos los
  campos, `aria-invalid` + `aria-describedby` hacia el error y la ayuda, `role="alert"` en errores,
  toasts en región `aria-live`, modal con `role="alertdialog"`, foco inicial en "Cancelar" y cierre
  con Escape, foco visible con `:focus-visible`, respeto de `prefers-reduced-motion`.
- **Responsivo.** Bajo 768 px el menú lateral pasa a barra horizontal superior; bajo 640 px las
  tablas se muestran como tarjetas apiladas (cada celda con su encabezado).

## Docker

`Dockerfile` multi-etapa: `node:24-alpine` (`npm ci` + `npm run build`) →
`nginxinc/nginx-unprivileged:alpine` (usuario 101, puerto 8080, `HEALTHCHECK` en `/healthz`).

`nginx.conf`:

- SPA: `try_files $uri $uri/ /index.html`.
- `location /api/` → `proxy_pass http://api:8080` (servicio `api` de docker-compose). Se resuelve
  por petición con el DNS de Docker, así nginx arranca aunque la API aún no esté disponible.
- gzip; `Cache-Control: immutable` (1 año) para JS/CSS con hash y `no-cache` para `index.html`.
- Cabeceras de seguridad: `Content-Security-Policy` (`default-src 'self'`, `script-src 'self'`,
  `style-src 'self' 'unsafe-inline'` porque Angular inserta los estilos de componentes como
  `<style>`, `blob:`/`data:` para la descarga del PDF, `frame-ancestors 'none'`),
  `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`,
  `Permissions-Policy`.
- En `angular.json` se desactivó `inlineCritical` en producción: el CSS crítico en línea usa un
  `onload` en el `<link>` que la CSP (sin `'unsafe-inline'` en scripts) bloquearía.

## Pruebas

Jest con `jest-preset-angular` en modo zoneless (`setup-jest.ts`). Cubren: servicios HTTP
(`HttpTestingController`), interceptor de errores, `toApiError`, notificaciones (timers falsos),
búsqueda, formato, descarga base64→PDF, validadores y mensajes, componentes compartidos (tabla,
diálogo de confirmación, error de campo, toasts, alertas, barra de búsqueda), listados (render,
búsqueda, flujo de eliminación con confirmación, 409), formularios de cliente, cuenta y movimiento
(validación, POST/PUT, errores del backend mapeados a campos) y la página de reportes (totales,
tarjetas por cuenta, tabla, PDF).

## `data-testid` (para pruebas automatizadas)

| data-testid | Elemento |
|---|---|
| `brand` | Marca "BANCO" en la cabecera |
| `topbar` | Cabecera |
| `nav-clientes`, `nav-cuentas`, `nav-movimientos`, `nav-reportes` | Enlaces del menú |
| `page-title` | Título (h1) de cada página |
| `search-input` | Caja de búsqueda rápida |
| `btn-nuevo` | Botón "Nuevo" del listado |
| `tabla-clientes`, `tabla-cuentas`, `tabla-movimientos`, `tabla-reporte` | Contenedor de cada tabla |
| `table-row` | Fila de datos (atributo `data-row-key` = `clienteId`, `numeroCuenta` o `id`) |
| `celda-<columna>` | Celda dentro de una fila (p. ej. `celda-nombre`, `celda-valor`, `celda-saldo`) |
| `empty-state` | Mensaje de tabla vacía / cargando |
| `btn-editar`, `btn-eliminar` | Acciones de cada fila |
| `confirm-dialog` | Modal de confirmación |
| `btn-confirmar`, `btn-cancelar-confirmacion` | Botones del modal |
| `form-cliente`, `form-cuenta`, `form-movimiento`, `form-reporte` | Formularios |
| `input-<campo>` | Campos (`input-clienteId`, `input-nombre`, `input-genero`, `input-edad`, `input-identificacion`, `input-direccion`, `input-telefono`, `input-contrasena`, `input-estado`, `input-numeroCuenta`, `input-tipoCuenta`, `input-saldoInicial`, `input-tipoMovimiento`, `input-valor`, `input-fechaInicio`, `input-fechaFin`) |
| `field-error-<campo>` | Mensaje de validación bajo cada campo; `field-error-rango` para el rango de fechas |
| `saldo-cuenta` | Saldo disponible de la cuenta elegida en el formulario de movimiento |
| `btn-guardar`, `btn-cancelar` | Acciones de formularios |
| `alert-error`, `alert-info` | Alertas en línea (errores de API / avisos) |
| `toast-exito`, `toast-error`, `toast-info` | Notificaciones flotantes |
| `btn-generar`, `btn-descargar-pdf` | Reportes: generar y descargar PDF |
| `reporte-resumen` | Bloque de resumen del estado de cuenta |
| `total-creditos`, `total-debitos`, `total-cuentas`, `total-movimientos` | Totales del reporte |
| `reporte-cuenta` | Tarjeta por cuenta (atributo `data-row-key` = número de cuenta) |
| `cuenta-saldo-disponible` | Saldo disponible dentro de cada tarjeta |
| `reporte-sin-cuentas` | Mensaje cuando el cliente no tiene cuentas |
