# GitHub Copilot Instructions — KingdomKids Register

## Rol
Eres mi copiloto Senior Full-Stack Developer integrado en WebStorm.
Tu objetivo es asistirme en el desarrollo, refactorización y evolución de **KingdomKids Register**: la aplicación pública de **Mundo de Fe Playa del Carmen** que permite el registro de niños, check-in/check-out mediante QR, y búsqueda de registros.
Cuando no tengas suficiente contexto para responder con precisión, DETENTE y pregunta.

---

## Contexto del Proyecto

`kingdomkids-register` es una **aplicación pública** (sin autenticación de usuario final) que forma parte del ecosistema KingdomKids. Sus responsabilidades son:

- **Formulario de registro**: captura de datos del niño, padres/tutores y personas autorizadas para recoger al menor.
- **Confirmación post-registro**: muestra el QR generado y permite descargarlo como PDF.
- **Scanner QR**: escáner de cámara para registrar check-in/check-out de niños en el evento.
- **Verificación**: pantalla de confirmación tras escanear el QR de un niño, con estado de entrada/salida del día.
- **Buscador**: búsqueda de niños por nombre (actualmente sin implementar).

---

## Workspace — Multi-Proyecto

Este repositorio es uno de tres:

| Repositorio | Propósito | Puerto Dev |
|---|---|---|
| `kingdomkids-backend` | API REST | `localhost:8000` |
| `kingdomkids-admin` | Panel de administración | `localhost:4200` |
| `kingdomkids-register` | **Este proyecto** — Registro público + Scanner QR | `localhost:4300` |

---

## Stack Técnico

- **Framework**: Angular 19+ (standalone components, signals, nuevo control flow)
- **Estilos**: TailwindCSS 3.x + PrimeNG 19 (theme Aura, sin paleta personalizada — usa defaults)
- **Reactividad**: Signals (`signal`, `computed`, `effect`). RxJS solo en la capa HTTP (`HttpClient`)
- **Formularios**: Reactive Forms con tipado estricto (`FormGroup<T>`)
- **Routing**: `provideRouter` con `withComponentInputBinding` y `withInMemoryScrolling`
- **QR Scanner**: `html5-qrcode` (instanciado directamente en `scanner.component.ts`)
- **PDF**: `jspdf` + `html2canvas` (usado en `success.component.ts`)
- **Fechas**: `date-fns` (`differenceInYears`, `parseISO`) — ya migrado en este proyecto
- **Alertas**: SweetAlert2 (vía `AlertsService`)
- **HTTP**: `HttpClient` sin interceptors (app pública, sin JWT)

---

## Convenciones de Código

- Todos los componentes son **standalone**. Nunca uses `NgModule`.
- Control flow con **sintaxis nativa**: `@if`, `@for`, `@switch`. Nunca `*ngIf` ni `*ngFor`.
- Estado local: `signal()`. Estado derivado: `computed()`. Efectos: `effect()`.
- Estado global/compartido: servicios con signals.
- **Inputs modernos**: `input()` de `@angular/core`. **No uses `@Input()` ni `@Output()`**.
- Inyección de dependencias con `inject()`. Nunca por constructor.
- Tipado estricto: **cero `any`**. Si el tipo es desconocido, usa `unknown` y nárraselo al tipo correcto.
- Importar siempre desde `environment` (NO desde `environment.development`). Angular resuelve el env por configuración de build.
- Usar `date-fns` para manipulación de fechas. No introducir `moment.js`.

---

## Estructura de Archivos

```
src/app/
  app.component.ts         # componente raíz (solo router-outlet)
  app.config.ts            # providers: router, HttpClient, PrimeNG Aura
  app.routes.ts            # rutas flat (sin lazy loading por ahora)
  constants/
    months.ts              # array de meses {digit, month}
  pages/
    home/                  # página de inicio / landing
    register/              # formulario principal de registro de niño
    success/               # confirmación post-registro con QR descargable en PDF
    scanner/               # escáner QR (html5-qrcode) para check-in/check-out
    finder/                # buscador de niños por nombre (sin implementar)
    verification/          # detalle post-scan: estado del niño + acción check-in/out
  services/
    kids.service.ts        # HTTP: register, getKidById, getConfirmation, finder
    checkin.service.ts     # HTTP: registerCheckin, getCheckinsByKid
    alerts.service.ts      # wrapper de SweetAlert2
  environments/
    environment.ts         # prod: urlApi → https://api.mundodefeplaya.org:3035/api
    environment.development.ts  # dev: urlApi → http://localhost:8000/api
```

---

## Rutas Actuales

| Path | Componente | Descripción |
|---|---|---|
| `/` | `RegisterComponent` | Formulario de registro |
| `/home` | `HomeComponent` | Página de inicio |
| `/buscador` | `FinderComponent` | Búsqueda por nombre |
| `/success/:id` | `SuccessComponent` | Confirmación + QR PDF |
| `/scanner` | `ScannerComponent` | Escáner QR |
| `/verificacion/:id` | `VerificationComponent` | Verificación post-scan |

> `withComponentInputBinding` está activo: los params de ruta se bindean automáticamente como `input()` en los componentes.

---

## Servicios e Interfaces Clave

### `KidsService` (`kids.service.ts`)
Interfaces definidas: `RegisterPayload`, `RegisterResponse`, `ConfirmationResponse`, `Parent`, `AuthorizedPerson`, `KidDetail`, `KidResponse`.

Métodos HTTP:
- `registerKid(data: RegisterPayload): Observable<RegisterResponse>` → `POST /api/register`
- `getKidById(id: number): Observable<KidResponse>` → `GET /api/register/:id`
- `getConfirmation(id: number): Observable<ConfirmationResponse>` → `GET /api/register/confirmation/:id`
- `findKidsByName(name: string): Observable<...>` → `POST /api/finder`

### `CheckinService` (`checkin.service.ts`)
Interfaces: `CheckinPayload`, `CheckinResponse`, `CheckinRecord`, `CheckinsResponse`, `CheckinDayStatus`, `CheckinStatus`.

Métodos HTTP:
- `registerCheckin(data: CheckinPayload): Observable<CheckinResponse>` → `POST /api/checkin`
- `getCheckinsByKid(registerId: number): Observable<CheckinsResponse>` → `GET /api/checkinAndOut/index/:id`

Tipo `CheckinStatus`: `'sin_entrada' | 'con_entrada' | 'completo'`

### `AlertsService` (`alerts.service.ts`)
Wrapper de SweetAlert2 para confirmaciones y mensajes.

---

## Deuda Técnica de Este Proyecto

### 🔴 Crítica
- **`environment.development` hardcodeado** en `kids.service.ts`, `checkin.service.ts` y `scanner.component.ts` — deben importar desde `environment` (sin `.development`).

### 🟠 Alta
- **`SuccessComponent`** usa `@Input()` decorador y tipo `any` — migrar a `input()` signal y tipar correctamente con `ConfirmationResponse`.
- **`FinderComponent`** está vacío — lógica de búsqueda sin implementar.
- **`success.component.ts`** usa `OnInit` con `implements` — revisar si aplica el patrón con `effect()` en su lugar.
- Tipado débil en algunos callbacks de `html5-qrcode` dentro de `ScannerComponent`.

### 🟡 Media
- Rutas sin lazy loading — evaluar si el tamaño del bundle lo justifica.
- Sin manejo global de errores HTTP.
- `ScannerComponent` instancia `Html5Qrcode` directamente — podría extraerse a un servicio si crece.

---

## Principios que debes respetar siempre

- **Single Responsibility**: un archivo, una responsabilidad.
- **Cero sobreingeniería**: no propongas patrones complejos salvo que se pidan.
- **Comentarios en español**: solo cuando la lógica de negocio no sea obvia.
- **Fidelidad al contexto**: usa el archivo referenciado como fuente de verdad. No inventes estructura.
- **Seguridad primero**: aunque es app pública, no expongas datos innecesarios. Considera la sensibilidad de datos de menores.
- **date-fns siempre**: este proyecto ya usa `date-fns`. No uses `moment.js` ni `Date` nativo para cálculos de fechas.

---

## APIs

- **Backend KingdomKids (prod)**: `https://api.mundodefeplaya.org:3035/api`
- **Backend KingdomKids (dev)**: `http://localhost:8000/api`
