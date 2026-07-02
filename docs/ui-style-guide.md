# UI Style Guide — Angular · TailwindCSS · PrimeNG

> **Stack:** Angular 17+ · TailwindCSS 3 · PrimeNG  
> **Contexto:** Proyectos ERP/CRM corporativos  
> **Versión:** 1.0

Este archivo define los estándares de UI del equipo. Está pensado para ser leído por **GitHub Copilot** y **Claude** como contexto de proyecto. Inclúyelo en la raíz del repositorio o referéncialo en tu `.github/copilot-instructions.md`.

---

## Principio rector

> Cada decisión visual debe poder justificarse con:  
> **¿esto ayuda al usuario a encontrar o entender información más rápido?**  
> Si la respuesta no es clara, la decisión no va.

El usuario objetivo es un perfil financiero o administrativo que trabaja 6+ horas diarias en la interfaz. La claridad y la densidad de información son productividad, no preferencia estética.

---

## 01 — Paleta y Sistema de Marca

### Arquitectura de tres capas

La plantilla se **copia por cliente** (un repo por proyecto). El único archivo que cambia entre proyectos es `brand.config.ts`.

| Capa | Archivo | Qué contiene | ¿Cambia por cliente? |
|---|---|---|---|
| Dinámica | `brand.config.ts` | Colores, logos, nombre, favicon | ✅ Sí |
| Servicio | `brand.service.ts` | Inyecta CSS variables al DOM | ❌ Nunca |
| Estática | `tailwind.config.ts` | Consume `var(--color-*)` | ❌ Nunca |

### Clientes registrados

| Cliente | Primary | Hover | Sidebar |
|---|---|---|---|
| Flyback | `#172554` | `#1e3a8a` | `#172554` |
| VacationFin | `#0c4a6e` | `#0e5a87` | `#0c4a6e` |
| Vacation Center | `#894366` | `#a05278` | `#894366` |
| Travelife | `#172554` | `#1e3a8a` | `#172554` |

### tailwind.config.ts — idéntico en todos los proyectos

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          primary:         'var(--color-primary)',
          'primary-hover': 'var(--color-primary-hover)',
          sidebar:         'var(--color-sidebar)',
        }
      }
    }
  }
} satisfies Config;
```

### brand.config.ts — el único archivo que varía

```typescript
export const BRAND_CONFIG: BrandConfig = {
  companyName:  'VacationFin',
  projectName:  'VacationFin App',
  shortName:    'VacationFin',
  copyright:    'VacationFin',
  assets: {
    logo:                'vacationfin/logo-vertical.png',
    logoWhite:           'vacationfin/logo-blanco.png',
    logoHorizontalWhite: 'vacationfin/logo-horizontal-blanco.png',
    background:          'vacationfin/bg-login.jpg',
    favicon:             '/vacationfin/favicon.ico',
  },
  colors: {
    primary:      '#0c4a6e',
    primaryHover: '#0e5a87',
    sidebar:      '#0c4a6e',
  }
};
```

### Uso en templates Angular

```html
<!-- ✅ Correcto — clases semánticas -->
<nav class="bg-brand-sidebar text-white">...</nav>
<button class="bg-brand-primary hover:bg-brand-primary-hover text-white">
  Guardar
</button>

<!-- ❌ Incorrecto — valor hardcodeado -->
<nav class="bg-[#172554]">...</nav>
<button style="background: #172554">Guardar</button>
```

### Colores estáticos — todos los proyectos

```
bg-gray-50   → #F8FAFC  Fondo de página
bg-gray-100  → #F1F5F9  Fondo de tarjetas
bg-gray-200  → #E2E8F0  Separadores
text-slate-700 → #334155  Texto principal (nunca text-black)
text-slate-400 → #94A3B8  Texto secundario / muted
```

### Regla de oro

- `tailwind.config.ts` y `brand.service.ts` son **idénticos** en todos los proyectos
- Para agregar un cliente nuevo: solo editar `brand.config.ts`
- Ningún color se define fuera de estas dos capas

---

## 02 — Glassmorphism

### Criterio técnico para decidir

> ¿El efecto ayuda a distinguir una capa de información de otra **sin distraer** la atención del contenido?  
> Si sí → puede aplicarse en los contextos permitidos. Si no → no va.

### Valores técnicos permitidos

| Propiedad | ✅ Permitido | ❌ Prohibido |
|---|---|---|
| `backdrop-blur` | `blur-sm` (4px máx.) | `blur-md`, `blur-lg`, `blur-xl` |
| Opacidad de fondo | `bg-white/80` o `bg-white/90` | `bg-white/40` o menos |
| Color de borde | `border-white/20` · `border-slate-200/50` | Bordes de colores vibrantes |
| Gradiente de borde | No se usa | `border-image`, gradient borders |
| Máx. por vista | 3 componentes glass | Sin límite definido |

### Contextos donde aplica

| Contexto | Decisión |
|---|---|
| Widget KPI en dashboard | ✅ Sí — máx. 3 por vista |
| Modal de confirmación sobre fondo oscuro | ✅ Sí |
| Panel lateral de filtros | ✅ Sí |
| Tabla de datos o listado | ❌ Nunca |
| Formulario de captura | ❌ Nunca |
| Liquid gradients animados | ❌ Nunca |
| Más de 1 capa de blur apilada | ❌ Nunca |

### Implementación aprobada

```html
<!-- ✅ Correcto: glass sutil en widget KPI -->
<div class="
  bg-white/85
  backdrop-blur-sm
  border border-white/20
  rounded-xl
  shadow-sm
  p-6
">
  <p-card>...</p-card>
</div>

<!-- ❌ Incorrecto: blur sobre tabla -->
<div class="backdrop-blur-md bg-blue-500/30 border-2 border-purple-400">
  <p-table>...</p-table>
</div>
```

---

## 03 — Tipografía y Densidad

### Escala tipográfica permitida

| Clase | Tamaño | Uso |
|---|---|---|
| `text-xl` | 20px | Solo h1 de la vista — nunca en componentes internos |
| `text-lg` | 18px | Subtítulos de sección, encabezados de cards |
| `text-base` | 16px | Texto de formularios y etiquetas principales |
| `text-sm` | 14px | Celdas de tabla, texto secundario — la más usada en ERP |

> ❌ No usar `text-2xl` o superior en componentes de tabla o formulario  
> ❌ No usar `text-xs` en celdas — ilegible para usuarios en uso prolongado

### Pesos tipográficos

| Clase | Uso |
|---|---|
| `font-bold` | **Solo** cifras financieras clave: montos, totales, KPIs |
| `font-medium` | Énfasis en etiquetas, estados activos, navegación activa |
| `font-normal` | Todo el texto de contenido estándar |

### Reglas de densidad

```html
<!-- Celdas de tabla — py-3 px-4 mínimo -->
<td class="py-3 px-4 text-sm text-slate-700">Contrato #4821</td>

<!-- Inputs -->
<input class="py-2.5 px-4 text-sm rounded-md" />

<!-- Espaciado entre campos de formulario -->
<form class="flex flex-col gap-6">...</form>

<!-- Separación entre secciones mayores -->
<div class="flex flex-col gap-8">...</div>
```

> ✅ Color de texto base: `text-slate-700` — **nunca** `text-black` puro  
> ✅ Máximo 4 niveles de jerarquía visual en una sola vista

---

## 04 — Componentes PrimeNG

### Regla principal

Antes de crear cualquier componente, verificar que PrimeNG no lo tenga — casi siempre lo tiene. Ver: `primeng.org/components`

### Reglas de theming

- Tema base: `lara-light-blue` (o el acordado al inicio del proyecto)
- Todos los overrides van **exclusivamente** en `styles/primeng-overrides.scss`
- `::ng-deep` solo con `ViewEncapsulation.None` documentado en comentario
- No instalar librerías adicionales sin aprobación del equipo

### Override correcto

```scss
/* styles/primeng-overrides.scss */

/* Override justificado: alinear altura con diseño de formularios ERP */
.p-inputtext {
  height: 2.5rem;
  border-radius: 0.375rem; /* rounded-md */
}

/* ❌ Nunca en el componente individual */
/* ::ng-deep .p-inputtext { ... } sin justificación */
```

---

## 05 — Spacing, Radii y Botones

### Escala de padding — tokens permitidos

La unidad base es 4px. Solo se usan los siguientes valores:

| Token Tailwind | Valor | Uso principal |
|---|---|---|
| `p-1` / `gap-1` | 4px | Badges, chips, separaciones internas mínimas |
| `p-2` / `gap-2` | 8px | Padding interno de inputs pequeños, iconos |
| `p-3` / `gap-3` | 12px | Padding de celdas de tabla — mínimo recomendado |
| `p-4` / `gap-4` | 16px | Padding estándar de inputs, botones, cards pequeñas |
| `p-5` / `gap-5` | 20px | Padding de secciones de formulario |
| `p-6` / `gap-6` | 24px | Padding de tarjetas (cards), espaciado entre campos |
| `p-8` / `gap-8` | 32px | Separación entre secciones mayores de una vista |
| `p-12` / `gap-12` | 48px | Padding de contenedores de página, zonas vacías |

> ❌ No usar valores arbitrarios: `p-[13px]`, `p-[22px]`, etc.  
> Si ningún token encaja, revisar el layout — no parchear con valores custom.

### Escala de border-radius

`rounded-3xl` (24px) es el **máximo permitido**. A mayor tamaño de elemento, mayor radio permitido.

| Token | Valor | Uso |
|---|---|---|
| `rounded` | 4px | Badges, chips, tags inline |
| `rounded-md` | 6px | Inputs, selects, botones — estándar de elementos interactivos |
| `rounded-lg` | 8px | Cards de datos, paneles, dropdowns — **el más usado** |
| `rounded-xl` | 12px | Modales, sidebars flotantes, widgets KPI con glass |
| `rounded-2xl` | 16px | Contenedores de sección prominentes, banners de estado |
| `rounded-3xl` | 24px | **Máximo.** Solo elementos de presentación: login, splash, onboarding |

### Regla de proporcionalidad

| Elemento | Tamaño aprox. | Radio correcto | Por qué |
|---|---|---|---|
| Badge / chip | 20–28px alto | `rounded` o `rounded-full` | Elemento pequeño — el radio lo contiene |
| Input / botón | 36–40px alto | `rounded-md` | Interactivo — radio discreto |
| Card de datos | Cualquier ancho | `rounded-lg` | Radio de referencia — 80% de los casos |
| Modal / panel | 400–700px | `rounded-xl` | Superficie grande — radio visible sin exagerar |
| Banner / hero card | Full-width | `rounded-2xl` | Solo sobre fondo diferenciado |
| Login / splash | Pantalla completa | `rounded-3xl` | Solo en entrada — **nunca en flujos operativos** |

```html
<!-- ✅ rounded-3xl correcto: card de pantalla de login -->
<div class="rounded-3xl p-10 bg-white shadow-xl">
  <h1>Bienvenido a Flyback</h1>
</div>

<!-- ❌ rounded-3xl incorrecto: en tabla o formulario operativo -->
<p-table class="rounded-3xl overflow-hidden">...</p-table>
<input class="rounded-3xl px-4 py-2" />
```

> Todos los inputs y botones de un mismo formulario deben compartir el mismo radio.  
> `rounded-3xl` nunca convive con tablas o formularios en la misma vista.

### Jerarquía de botones

#### Primario — una sola acción por vista

```html
<button class="
  bg-brand-primary hover:bg-brand-primary-hover
  text-white font-medium text-sm
  px-4 py-2 rounded-md
  transition-colors duration-150
  disabled:opacity-45 disabled:cursor-not-allowed
">
  Guardar contrato
</button>
```

#### Secundario — acciones de apoyo

```html
<button class="
  bg-white hover:bg-gray-50
  text-slate-700 font-medium text-sm
  border border-gray-200 hover:border-gray-300
  px-4 py-2 rounded-md
  transition-colors duration-150
">
  Cancelar
</button>
```

#### Destructivo — eliminación o acción irreversible

```html
<!-- Filled: acción confirmada -->
<button class="bg-red-600 hover:bg-red-700 text-white font-medium text-sm px-4 py-2 rounded-md">
  Eliminar contrato
</button>

<!-- Outline: paso previo a confirmación -->
<button class="border border-red-300 text-red-600 hover:bg-red-50 font-medium text-sm px-4 py-2 rounded-md">
  Eliminar contrato
</button>
```

#### Ghost / Icono — acciones inline o en tablas

```html
<!-- Ghost texto -->
<button class="text-brand-primary hover:underline text-sm font-medium bg-transparent border-none">
  Ver detalle →
</button>

<!-- Icon button en tabla -->
<button class="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-gray-100">
  <svg>...</svg>
</button>
```

### Reglas de botones

| Regla | Detalle |
|---|---|
| Un solo primario por vista | Si hay dos acciones igual de importantes, revisar el flujo |
| Tamaño estándar | `px-4 py-2` con `text-sm font-medium` — no reducir en botones principales |
| Border-radius fijo | `rounded-md` para todos los botones de acción |
| Sin shadow en botones | No usar `shadow-md` — genera jerarquía falsa |
| Estados requeridos | Todo botón: `hover:`, `disabled:opacity-45`, `disabled:cursor-not-allowed` |
| Estado loading | Deshabilitar y cambiar texto durante el submit |

---

## 06 — UI Dark Mode

### Principio

Dark mode no es inversión de colores — es una paleta diseñada desde cero. El error más común es usar negro puro como fondo, lo que crea contraste excesivo con el texto blanco y genera fatiga visual en sesiones largas.

### Escala de superficies oscuras

Cada capa tiene un nivel de luminosidad ligeramente diferente para crear profundidad sin sombras agresivas.

| Token CSS | Hex | Uso |
|---|---|---|
| `--bg` | `#0a0a0f` | Fondo base de la página — el nivel más profundo |
| `--bg-card` | `#111118` | Cards, paneles, sidebar |
| `--bg-subtle` | `#16161f` | Hover states, headers de tabla |
| `--bg-hover` | `#1a1a26` | Estado hover de filas, items de nav, dropdowns |
| `--bg-code` | `#0d0d14` | Bloques de código |

> ❌ No usar `#000000` ni `bg-black` como fondo  
> ❌ No usar `#ffffff` ni `text-white` como texto base

### Escala de texto en dark mode

| Token CSS | Valor | Uso |
|---|---|---|
| `--text-primary` | `#f0f0f5` | Títulos, valores clave — no blanco puro |
| `--text-secondary` | `#8a8aa0` | Cuerpo de texto, labels de formulario |
| `--text-muted` | `#55556a` | Placeholders, metadatos, fechas |

> `#f0f0f5` tiene ratio ~17:1 sobre `#0a0a0f` — legible y confortable para uso prolongado.  
> `#ffffff` puro tiene ratio 21:1 — excesivo, genera tensión visual.

### Bordes — opacidad, no color sólido

```scss
/* ✅ Correcto */
border: 1px solid rgba(255, 255, 255, 0.07);  /* --border */
border: 1px solid rgba(255, 255, 255, 0.13);  /* --border-strong */

/* ❌ Incorrecto */
border: 1px solid #333333;   /* fijo, no se adapta */
border: 1px solid gray-700;  /* demasiado visible */
```

### Colores de marca en dark mode

Los botones primarios **mantienen** `bg-brand-primary` en ambos modos. Lo que cambia son los badges y estados:

```html
<!-- Badge en light mode -->
<span class="bg-blue-900/10 text-blue-900 border border-blue-900/15">Activo</span>

<!-- Badge en dark mode — usar opacidad y tono claro -->
<span class="bg-brand-primary/12 text-blue-300 border border-brand-primary/20">Activo</span>
```

### Implementación en Angular

```typescript
// theme.service.ts
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private theme = signal<'light' | 'dark'>('dark');

  setTheme(t: 'light' | 'dark'): void {
    this.theme.set(t);
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('theme', t);
  }

  initTheme(): void {
    const saved = localStorage.getItem('theme') as 'light' | 'dark';
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
    this.setTheme(saved ?? preferred);
  }
}
```

```scss
/* styles.scss */
:root[data-theme="dark"] {
  --bg:             #0a0a0f;
  --bg-card:        #111118;
  --bg-subtle:      #16161f;
  --text-primary:   #f0f0f5;
  --text-secondary: #8a8aa0;
  --border:         rgba(255, 255, 255, 0.07);
  --border-strong:  rgba(255, 255, 255, 0.13);
}

:root[data-theme="light"] {
  --bg:             #f7f7fb;
  --bg-card:        #ffffff;
  --bg-subtle:      #f0f0f7;
  --text-primary:   #0f0f1a;
  --text-secondary: #4a4a65;
  --border:         rgba(0, 0, 0, 0.08);
  --border-strong:  rgba(0, 0, 0, 0.14);
}

/* Los colores de marca NO cambian por tema */
:root {
  --color-primary:       var(--brand-primary);
  --color-primary-hover: var(--brand-primary-hover);
  --color-sidebar:       var(--brand-sidebar);
}
```

### Checklist de dark mode

- [ ] No hay `#000000` ni `bg-black` como fondo de página o card
- [ ] No hay `#ffffff` ni `text-white` como color base de texto
- [ ] Los bordes usan `rgba(255,255,255,0.07)` — no grises sólidos
- [ ] Los badges en dark usan `bg-brand/12 text-brand-300`, no el sólido
- [ ] El tema respeta `prefers-color-scheme` y persiste en `localStorage`
- [ ] Todas las vistas revisadas en ambos modos antes del PR

---

## 07 — Checklist UI — requerido en todo PR con cambios de interfaz

```
[ ] 1. Colores usando bg-brand-primary / text-brand-primary — nunca hex hardcodeado
[ ] 2. backdrop-blur máximo blur-sm (4px) si se usa glassmorphism
[ ] 3. Glass solo en contexto aprobado: KPI widget, modal oscuro, panel de filtros
[ ] 4. Sin estilos hardcodeados fuera de Tailwind o primeng-overrides.scss
[ ] 5. PrimeNG verificado antes de crear componente nuevo
[ ] 6. Overrides de PrimeNG en primeng-overrides.scss — no en el componente
[ ] 7. Vista probada en resolución 1280px
[ ] 8. Contraste WCAG AA verificado
[ ] 9. Dark mode revisado — sin negro puro ni blanco puro
[ ] 10. rounded-3xl solo en elementos de presentación (login, splash) — no en flujos operativos
```

---

## 08 — Referencia rápida de clases

### Clases de marca

```
bg-brand-primary              Fondo primario del cliente
text-brand-primary            Texto en color primario
hover:bg-brand-primary-hover  Estado hover de botones
bg-brand-sidebar              Fondo del sidebar de navegación
border-brand-primary          Borde en color primario
```

### Colores estáticos

```
bg-gray-50 / bg-gray-100 / bg-gray-200   Fondos de página y superficie
text-slate-700                            Texto principal
text-slate-400                            Texto secundario / muted
```

### Radii de referencia rápida

```
rounded      → badges, chips
rounded-md   → inputs, botones
rounded-lg   → cards (el más usado)
rounded-xl   → modales
rounded-2xl  → banners, hero cards
rounded-3xl  → login, splash (máximo)
```

### Spacing de referencia rápida

```
py-3 px-4   → celdas de tabla
py-2.5 px-4 → inputs
p-6         → cards
py-6 px-8   → modales
gap-6       → entre campos de formulario
gap-8       → entre secciones de vista
```

---

## 09 — Glosario

| Término | Definición |
|---|---|
| `brand.*` | Clases Tailwind que resuelven colores de marca via CSS variables inyectadas por `BrandService` en runtime |
| Glass sutil | `backdrop-blur-sm` + `bg-white/85` — el único nivel de glassmorphism aprobado |
| `primeng-overrides.scss` | Único archivo donde se modifican estilos internos de componentes PrimeNG |
| Plantilla base | Repo raíz que se copia por cliente — `tailwind.config.ts` y `brand.service.ts` son idénticos en todas las copias |
| `rounded-3xl` máximo | 24px es el radio máximo permitido — solo en elementos de presentación |
| `--text-primary` | `#f0f0f5` en dark — nunca blanco puro para evitar fatiga visual |

---

## 10 — Instrucciones para IA (Copilot / Claude)

Al generar o modificar código en este proyecto, aplicar siempre estas reglas:

**Colores:**
- Usar `bg-brand-primary`, `text-brand-primary`, `bg-brand-sidebar` — nunca valores hex directos
- Para colores estáticos: `bg-gray-50/100/200`, `text-slate-700`, `text-slate-400`

**Spacing:**
- Solo valores de la escala de 4px: `p-1`, `p-2`, `p-3`, `p-4`, `p-5`, `p-6`, `p-8`, `p-12`
- Nunca valores arbitrarios como `p-[13px]`

**Border-radius:**
- `rounded-md` para inputs y botones
- `rounded-lg` para cards y paneles (default)
- `rounded-xl` para modales
- `rounded-3xl` solo en pantallas de login o splash — nunca en formularios ni tablas

**Tipografía:**
- Escala: `text-sm` a `text-xl` — nunca `text-2xl` o superior en componentes internos
- `font-bold` solo para cifras financieras clave
- `text-slate-700` como base — nunca `text-black`

**Glassmorphism:**
- Solo con `backdrop-blur-sm` (4px máx.) y `bg-white/85` mínimo
- Solo en: KPI widgets (máx. 3), modales sobre fondo oscuro, panel de filtros
- Nunca sobre tablas, formularios o listas

**Botones:**
- Un solo primario por vista
- Siempre con `hover:`, `disabled:opacity-45`, `disabled:cursor-not-allowed`
- `rounded-md` en todos los botones de acción

**Dark mode:**
- Fondo base: `#0a0a0f` — nunca `#000000`
- Texto base: `#f0f0f5` — nunca `#ffffff`
- Bordes: `rgba(255,255,255,0.07)` — nunca grises sólidos

**PrimeNG:**
- Verificar que el componente no exista en PrimeNG antes de crear uno custom
- Overrides solo en `styles/primeng-overrides.scss`

---

*UI Style Guide v1.0 · Equipo Frontend ERP/CRM · Angular + TailwindCSS + PrimeNG*  
*Documento vivo — actualizar cuando una regla no esté funcionando en la práctica*
