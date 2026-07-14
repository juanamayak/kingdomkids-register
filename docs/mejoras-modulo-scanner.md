# Propuesta de Mejoras — Módulo de Escaneo QR (Check-in)

## Diagnóstico del Estado Actual

El flujo de check-in está dividido en dos componentes: `ScannerComponent` y `VerificationComponent`. Funciona, pero tiene varios problemas de UX, robustez y código que vale la pena resolver.

### Problemas identificados

| Área | Problema |
|---|---|
| **UX / Flujo** | El escaneo lleva a una pantalla de verificación en una ruta separada. El operador pierde el contexto del escáner y debe navegar de regreso manualmente. |
| **UX / Feedback** | No hay indicador visual de que el QR fue leído (la cámara sigue activa y no hay confirmación inmediata). |
| **UX / Check-out** | Solo existe el botón de "Registrar entrada". No hay forma de registrar la salida del niño desde esta pantalla. |
| **Código** | `ScannerComponent` usa `@ViewChild` y `any` para acceder a la cámara. Hay código muerto comentado del intento anterior con `ngx-scanner-qrcode`. |
| **Código** | `VerificationComponent` usa `@Input()` con tipo `any` y `OnInit` en lugar de los patrones modernos de Angular 19 (`input()`, signals). |
| **Código** | Ambos servicios (`kids.service.ts`, `checkin.service.ts`) importan desde `environment.development` en lugar de `environment`. |
| **Seguridad** | El endpoint `/api/checkin` no requiere autenticación. Cualquiera que conozca la URL puede registrar check-ins. |
| **Robustez** | Si el QR escaneado no corresponde a un niño registrado, la pantalla de verificación queda en blanco sin mensaje de error. |
| **Rendimiento** | El escáner corre a 10 fps de forma continua. No se detiene al detectar un QR válido, lo que puede causar llamadas duplicadas a la API. |

---

## Propuesta de Mejoras

### 1. Flujo unificado: Escanear + Confirmar en una sola pantalla

**Problema:** Navegar a `/verificacion/:id` rompe el flujo del operador, que tiene que presionar "Registrar entrada" y luego volver al escáner manualmente.

**Propuesta:** Convertir el flujo en un **panel lateral (drawer) o modal** que aparece sobre el escáner sin abandonar la pantalla. El escáner se pausa al detectar un QR, muestra los datos del niño en el panel, y al confirmar el check-in, el panel se cierra y el escáner se reactiva automáticamente.

```
[Pantalla del escáner activo]
        ↓  QR detectado
[Panel lateral / modal deslizante]
  - Foto / nombre del niño
  - Edad, alergias, condiciones médicas (highlight si aplica)
  - Botón: ✅ Registrar Entrada | 🔄 Registrar Salida
        ↓  Confirmar
[Toast de éxito → escáner se reactiva]
```

**Componente sugerido:** `p-drawer` o `p-dialog` de PrimeNG.

---

### 2. Mostrar información crítica de forma prominente

**Problema:** La pantalla de verificación muestra todos los campos con el mismo peso visual. El operador tarda en encontrar lo importante.

**Propuesta:** Resaltar visualmente los datos que el operador necesita validar en segundos:

- **Alergias y condiciones médicas**: mostrar con badge rojo/amarillo si aplican.
- **Nombre y foto** (si se agrega en el futuro): tamaño grande al tope.
- **Estado del check-in del día**: indicar si el niño ya tiene entrada registrada (para hacer check-out) o si aún no ha entrado.

---

### 3. Soporte para Check-out desde el escáner

**Problema:** No existe flujo para registrar la salida del niño desde esta interfaz.

**Propuesta:** Al detectar el QR, consultar el estado actual del niño en el evento del día:

- Si **no tiene check-in**: mostrar botón "Registrar Entrada".
- Si **ya tiene check-in activo**: mostrar botón "Registrar Salida" con el tiempo transcurrido desde la entrada.
- Si **ya tiene checkout**: mostrar aviso informativo ("Ya registró entrada y salida hoy").

Esto requiere que el endpoint `GET /api/checkinAndOut/index/:register_id` devuelva el estado del día actual, o que se cree un endpoint `GET /api/checkin/estado/:register_id` que retorne el estado de la sesión actual.

---

### 4. Deduplicación de escaneos (evitar doble check-in)

**Problema:** El escáner corre continuamente. Si el QR permanece en el encuadre, puede disparar la navegación/callback múltiples veces.

**Propuesta:** 
- Detener el escáner inmediatamente al detectar un QR válido: `this.html5QrCode.stop()`.
- Reactivar solo después de que el operador confirme o cancele la acción en el panel.
- Agregar un `debounce` o flag `isProcessing` para ignorar lecturas mientras se procesa una.

---

### 5. Manejo de errores visible para el operador

**Problema actual:** Si el QR no corresponde a un registro, la pantalla queda en blanco sin feedback.

**Propuesta:**
- Si `getKidRegister()` falla con 404: mostrar mensaje claro "QR no reconocido. Este niño no está registrado." con opción de escanear otro.
- Si falla la conexión: mostrar "Sin conexión con el servidor. Intenta de nuevo."
- Usar el `AlertsService` ya existente o los toasts de PrimeNG.

---

### 6. Refactorización de código (deuda técnica)

#### `ScannerComponent`
- Eliminar el código comentado de `ngx-scanner-qrcode` (es código muerto).
- Tipar correctamente los dispositivos de cámara: usar el tipo `CameraDevice` de `html5-qrcode`.
- Extraer la lógica de selección de cámara trasera a un método privado `getBackCamera(devices: CameraDevice[])`.
- Manejar el caso en que `getCameras()` retorne un array vacío (sin permisos de cámara).

#### `VerificationComponent`
- Migrar `@Input() id: any` → `id = input<string>()` (input signal de Angular 19).
- Reemplazar `public register: any` con una interfaz tipada `KidDetailResponse`.
- Reemplazar `implements OnInit` + `ngOnInit` con un `effect()` que reaccione al `id` input.
- Eliminar el `constructor()` vacío en `CheckinService`.

#### Servicios
- **Crítico**: Cambiar `environment.development` por `environment` en `kids.service.ts` y `checkin.service.ts`.
- Tipar el método `registerCheckin(data: any)` con un DTO: `registerCheckin(data: CheckinPayload)`.

---

### 7. Indicador de estado de conexión

**Contexto de uso:** El escáner opera en un ambiente de evento donde la conexión puede ser inestable (muchos dispositivos conectados al mismo WiFi).

**Propuesta:** Agregar un pequeño indicador en la UI del escáner que muestre si hay conectividad con la API (ping periódico o detección del error de red). Si no hay conexión, mostrar un banner visible antes de intentar escanear.

---

## Priorización Sugerida

| Prioridad | Mejora |
|---|---|
| 🔴 Inmediata | Fix de `environment.development` → `environment` en servicios |
| 🔴 Inmediata | Detener escáner al detectar QR (evitar duplicados) |
| 🟠 Alta | Manejo de errores visible (QR no reconocido, sin conexión) |
| 🟠 Alta | Soporte para Check-out desde el escáner |
| 🟡 Media | Flujo unificado con panel lateral (no navegar a ruta separada) |
| 🟡 Media | Resaltar alergias y condiciones médicas |
| 🟢 Baja | Refactorización de código (tipado, inputs modernos) |
| 🟢 Baja | Indicador de estado de conexión |

---

## Cambios en Backend Requeridos

Para implementar el soporte de check-out y el estado del día, se necesita:

1. **Nuevo endpoint** (o modificar el existente): `GET /api/checkin/estado/:register_id`  
   Retorna el estado de check-in del niño en la fecha actual:
   ```json
   {
     "status": "sin_entrada" | "con_entrada" | "completo",
     "checkin_id": 42,
     "entrada": "2026-07-11T10:30:00Z",
     "salida": null
   }
   ```

2. El endpoint debe incluir middleware de autenticación (deuda técnica crítica ya documentada).

