# Design

## Visual Theme

Clinical precision meets modern software. Clean, confident, and purposeful — nothing decorative, nothing wasted. Inspired by Apple Health's data elegance applied to a professional clinical context.

## Color Palette

### Primary
- **Accent**: `#1d4ed8` (blue-700) — primary actions, active states, brand identity
- **Accent hover**: `#2563eb` (blue-600)
- **Accent light**: `#eff6ff` — subtle accent backgrounds

### Neutrals
- **Background**: `#f8fafc` (slate-50) — page canvas
- **Surface**: `#f1f5f9` (slate-100) — inset areas, inputs
- **Elevated**: `#ffffff` — cards, modals
- **Border subtle**: `#e2e8f0` (slate-200)
- **Border medium**: `#cbd5e1` (slate-300)

### Text
- **Primary**: `#0f172a` (slate-900)
- **Secondary**: `#334155` (slate-700)
- **Muted**: `#64748b` (slate-500)

### Semantic / Alerts
- **Red** (danger/allergy): `#dc2626` on `#fef2f2`
- **Amber** (warning): `#d97706` on `#fffbeb`
- **Green** (success/live): `#059669` on `#ecfdf5`
- **Purple** (referral/info): `#7c3aed` on `#f5f3ff`

## Typography

### Font Stack
- **Display**: `'Literata', Georgia, serif` — headings, hero text, stats
- **Body**: `'Source Sans 3', system-ui, sans-serif` — all UI text, labels, paragraphs

### Scale
- Hero: 5xl–7xl display font, bold, tight tracking (`leading-[1.08]`)
- Section headings: 2xl–3xl display font, bold
- Card headers: `text-sm font-semibold` body font
- Body: `text-sm` (14px default)
- Micro labels: `text-[10px] font-bold uppercase tracking-wide`
- Badges/pills: `text-xs font-semibold`

## Spacing & Layout

- Page max-width: `1600px`
- Page padding: `px-4 sm:px-6 py-6`
- Card padding: `p-4` or `p-5`
- Card gap: `gap-5` (grid), `space-y-4` (stack)
- Grid: 12-column on `lg:`, typically 4/8 split (controls / content)
- Border radius: `rounded-xl` (cards), `rounded-lg` (inputs, buttons), `rounded-full` (pills, dots)

## Components

### Elevated Card
```css
background: white;
border: 1px solid #e2e8f0;
box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
border-radius: 12px;
```
Hover lifts shadow slightly. Used for all content panels.

### Buttons
- **Primary**: `bg-blue-700 hover:bg-blue-800 text-white rounded-lg px-5 py-2.5 font-semibold shadow-sm`
- **Secondary**: `bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl`
- **Pill/Tab active**: `bg-white text-blue-700 shadow-sm border border-blue-200 rounded-md`

### Badges & Status Indicators
- Breathing dot: `w-1.5 h-1.5 rounded-full animate-breathe` — signals active processing
- Status pill: `px-2.5 py-1 rounded-full bg-[color]-50 border border-[color]-200 text-[10px] font-semibold`
- Count badge: `text-xs font-medium bg-slate-100 px-2 py-0.5 rounded-full`

### Inputs
- Select: `bg-slate-100 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-medium`
- Focus ring: `ring-2 ring-blue-500/30 border-blue-500`

### Empty States
- Centered flex column with muted icon (slate-300, w-10 h-10)
- Title: `text-sm font-medium text-slate-600`
- Description: `text-xs text-muted max-w-[240px] leading-relaxed`
- Optional: category pills showing what will appear

## Motion & Animation

### Principles
- Subtle and purposeful. No bounce, no overshoot.
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out with snap)
- Duration: 200ms (transitions), 350ms (entrance animations)

### Patterns
- **fade-in-up**: `translateY(6px) → 0` with opacity. Used for transcript lines, action cards.
- **slide-in**: `translateX(20px) → 0`. Used for log entries.
- **breathe**: Scale 0.9→1.1 at 2s infinite. Used for "live" indicator dots.
- **card-enter**: `translateY(8px) → 0` at 400ms. Used for panel reveals.
- **shimmer**: Gradient sweep for loading states.
- **recording-pulse**: Box-shadow pulse for active mic recording.

### Reduced Motion
Respect `prefers-reduced-motion`: disable breathing, shimmer, and entrance animations. Keep opacity transitions only.

## Iconography

- Source: Heroicons (outline, strokeWidth 1.5–2)
- Size: `w-4 h-4` inline with text, `w-5 h-5` in buttons, `w-8–10 h-8–10` in empty states
- Color: matches contextual text color (slate-600 for neutral, blue-700 for accent)

## Responsive Behavior

- Mobile-first, single column below `lg:`
- Grid collapses from 12-col to stacked at `lg:` breakpoint
- Hero text scales: 5xl → 6xl → 7xl
- Cards fill width on mobile with consistent padding
