# Design System Master File — SocietyOS

> **LOGIC:** When building a specific page, first check `design-system/societyos/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** SocietyOS  
**Product Type:** Full-Stack Residential Society Management & Security Operations Platform  
**Target Roles:** Resident (Mobile-first PWA), Security Officer (Operations Console), Society Administrator (Command Center)  
**Visual Style:** Swiss Minimalist Civic Operations — Calm, Dependable, Precise, Human, Well-spaced  

---

## 1. Core Color System (PRD & UI/UX Pro Max Refined)

Strictly adhere to this civic-tech residential operations palette. **Zero purple/pink gradients, zero neon, zero random gradients.**

### Semantic Color Tokens

| Role / Token | Hex Value | CSS Variable | Semantic Usage |
|--------------|-----------|--------------|----------------|
| **Canvas / Background** | `#F6F6F1` | `--color-background` | Primary page canvas, warm off-white background |
| **Surface (Card / Panel)** | `#FFFFFF` | `--color-surface` | Elevated containers, cards, tables, modal surfaces |
| **Secondary Surface (Subtle)** | `#E4ECE5` | `--color-surface-subtle` | Sidebar active background, badge containers, secondary panels (Sage) |
| **Surface Muted / Well** | `#EFF3EF` | `--color-surface-muted` | Input wells, table header rows, code blocks |
| **Main Ink / Foreground** | `#17231D` | `--color-foreground` | Deep charcoal / green-black for primary text and titles |
| **Muted Ink** | `#66716A` | `--color-foreground-muted`| Metadata, secondary labels, helper descriptions |
| **Subtle Ink** | `#8A968E` | `--color-foreground-subtle`| Placeholder text, disabled labels |
| **Primary Brand** | `#276749` | `--color-primary` | Deep Forest Green — Primary buttons, brand accents, active indicators |
| **Primary Brand Hover** | `#1F523A` | `--color-primary-hover`| Hover state for primary interactive elements |
| **Primary Brand Subtle** | `#EAF3ED` | `--color-primary-subtle`| Light tint background for active items and primary chips |
| **On Primary** | `#FFFFFF` | `--color-on-primary` | Text / icons displayed over primary brand fill |
| **Neutral Border** | `#D9DED8` | `--color-border` | Standard card, divider, and input borders |
| **Muted Border** | `#E8ECE7` | `--color-border-subtle` | Table dividers, inner card dividers |
| **Strong Border / Ring** | `#276749` | `--color-ring` | Keyboard focus ring (with 2px offset), selected card outlines |
| **Notice / Action Accent** | `#B86A2B` | `--color-accent` | Restrained Amber — Pending badges, warnings, caution alerts |
| **Notice Accent Subtle** | `#FDF6EE` | `--color-accent-subtle` | Amber chip background |
| **Destructive / Emergency** | `#B42318` | `--color-destructive` | Accessible Red — SOS trigger, high-priority emergency, delete/deny actions |
| **Destructive Subtle** | `#FEF3F2` | `--color-destructive-subtle` | Emergency alert banners, critical chip backgrounds |
| **Success / Verified** | `#1570EF` / `#166534` | `--color-success` | Checked-in visitors, verified passes, resolved tickets |

---

## 2. Typography Hierarchy

Pairing: **Plus Jakarta Sans** (Primary Display & Headings) + **Inter** (Data, Controls & Body Text) + **JetBrains Mono** (Codes, Timestamps, Pass Tokens).

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
```

- **Font Family Tokens:**
  - `font-display`: `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`
  - `font-sans`: `'Inter', system-ui, -apple-system, sans-serif`
  - `font-mono`: `'JetBrains Mono', ui-monospace, SFMono-Regular, monospace`

### Type Scale & Leading

| Level | Size (rem / px) | Weight | Line Height | Tracking | Usage |
|-------|-----------------|--------|-------------|----------|-------|
| `display-1` | `2.5rem` (40px) | 800 | `1.15` | `-0.025em` | Hero titles |
| `heading-1` | `2.0rem` (32px) | 700 | `1.2` | `-0.02em` | Main dashboard titles |
| `heading-2` | `1.5rem` (24px) | 600 | `1.25` | `-0.015em` | Section headers |
| `heading-3` | `1.25rem` (20px) | 600 | `1.3` | `-0.01em` | Card titles, modal headers |
| `body-lg` | `1.125rem` (18px) | 400/500 | `1.5` | `0` | Intro text, prominent lead copy |
| `body-base` | `1.0rem` (16px) | 400/500 | `1.5` | `0` | Standard body copy, inputs |
| `body-sm` | `0.875rem` (14px) | 400/500/600 | `1.45` | `0` | Table cells, form helper text |
| `caption` | `0.75rem` (12px) | 500/600 | `1.4` | `+0.01em` | Status chips, timestamps, badges |
| `mono-code` | `0.875rem` (14px) | 500/600 | `1.4` | `0` | Visitor pass codes, incident IDs |

---

## 3. Spacing, Elevation & Layout System

### Spacing Scale
- `--space-2xs`: `2px`
- `--space-xs`: `4px`
- `--space-sm`: `8px`
- `--space-md`: `16px`
- `--space-lg`: `24px`
- `--space-xl`: `32px`
- `--space-2xl`: `48px`
- `--space-3xl`: `64px`

### Shadows & Borders
- `--radius-sm`: `6px` (chips, tiny badges)
- `--radius-md`: `8px` (inputs, buttons, select menus)
- `--radius-lg`: `12px` (cards, alert banners)
- `--radius-xl`: `16px` (modals, slide-overs)
- `--shadow-sm`: `0 1px 2px 0 rgba(23, 35, 29, 0.05)`
- `--shadow-md`: `0 4px 6px -1px rgba(23, 35, 29, 0.08), 0 2px 4px -2px rgba(23, 35, 29, 0.04)`
- `--shadow-lg`: `0 10px 15px -3px rgba(23, 35, 29, 0.08), 0 4px 6px -4px rgba(23, 35, 29, 0.03)`
- `--shadow-modal`: `0 20px 25px -5px rgba(23, 35, 29, 0.12), 0 8px 10px -6px rgba(23, 35, 29, 0.04)`

### Layout Dimensions
- **Max Content Width:** `1536px` (`2xl`) for operations command centers; `1280px` (`xl`) for focused resident forms.
- **Side Nav Desktop:** `260px` fixed, collapsible to `72px` icon rail.
- **Top Bar Height:** `64px` with breadcrumb, live connection heartbeat, notification bell, user profile.
- **Balanced Outer Gutters:** Responsive padding `px-4 sm:px-6 lg:px-8`. No giant 400px empty gutters.

---

## 4. UI Component Specifications

### 4.1 Buttons
- **Primary Action (`.btn-primary`):** Background `#276749`, text `#FFFFFF`, border none, 8px radius, font weight 600, `hover:bg-[#1F523A]`, `active:scale-[0.99]`.
- **Secondary Action (`.btn-secondary`):** Background `#FFFFFF`, text `#17231D`, border `1px solid #D9DED8`, `hover:bg-[#EFF3EF]`, `active:scale-[0.99]`.
- **Emergency Action (`.btn-emergency`):** Background `#B42318`, text `#FFFFFF`, border none, bold font, distinct confirmation barrier to prevent accidental clicks while keeping tap target $\ge 56\text{px}$.
- **Destructive Action (`.btn-destructive`):** Background `#FEF3F2`, text `#B42318`, border `1px solid #FECDCA`, `hover:bg-[#FEE4E2]`.
- **Ghost Action (`.btn-ghost`):** Background transparent, text `#66716A`, `hover:text-[#17231D]`, `hover:bg-[#EFF3EF]`.

### 4.2 Status Chips & Badges
**Rule: Never rely on color alone.** Every badge must have an icon/symbol and text.
- `OPEN / PENDING`: Restrained Amber `#B86A2B` on `#FDF6EE` with warning dot/clock icon.
- `IN_PROGRESS / ACTIVE`: Blue `#1570EF` on `#EFF8FF` with pulse icon.
- `RESOLVED / OCCUPIED`: Forest Green `#276749` on `#EAF3ED` with check icon.
- `CRITICAL / EMERGENCY`: Red `#B42318` on `#FEF3F2` with alert icon.
- `VACANT`: Slate `#475467` on `#F2F4F7` with vacancy icon.
- `MAINTENANCE`: Amber/Brown `#9A3412` on `#FFEDD5` with wrench icon.

### 4.3 Forms & Inputs
- **Base Input:** Background `#FFFFFF`, border `1px solid #D9DED8`, radius `8px`, height `42px`, padding `0 12px`, text `16px` (prevents iOS Safari zoom).
- **Focus State:** Border `#276749`, box-shadow `0 0 0 3px rgba(39, 103, 73, 0.15)`.
- **Error State:** Border `#B42318`, box-shadow `0 0 0 3px rgba(180, 35, 24, 0.15)`, error message immediately below the field with an alert icon and `aria-live="polite"`.
- **Labels:** Explicit visible `<label>` bound via `htmlFor`. No placeholder-as-label.

### 4.4 Tables & Data Lists
- **Header:** Background `#EFF3EF`, text `#66716A`, font-size `12px`, uppercase, tracking `+0.05em`.
- **Row:** Height `52px`, border-bottom `1px solid #E8ECE7`, hover background `#F9FAF9`, transition `background-color 150ms`.
- **Empty States:** Clear SVG illustration/icon, non-technical explanation, single primary action.
- **Skeleton States:** Animated pulse using `#E4ECE5` placeholders matching exact row dimensions.

---

## 5. Micro-Interactions & Animation Rules

- Use `motion` from `motion/react` selectively.
- Duration tiers:
  - Micro-transitions (hover, focus, toggles): `150ms - 200ms ease-out`
  - Expansion / Drawer / Dropdown: `250ms - 300ms cubic-bezier(0.16, 1, 0.3, 1)`
  - Emergency highlight / Realtime update pulse: `400ms soft single pulse`, never constant looping animation.
- **Accessibility:** Must strictly respect `@media (prefers-reduced-motion: reduce)`. All animations degrade to instantaneous or simple opacity fades.

---

## 6. Prohibited Anti-Patterns (Zero Tolerance)

1. ❌ **No Purple or Pink Gradients** — No AI-template purples (`#8B5CF6`, `#A855F7`, `#EC4899`, etc.).
2. ❌ **No Neon or Cyberpunk Colors** — No electric greens, hyper blues, or glowing borders.
3. ❌ **No Emoji Icons** — Zero emojis used as icons in UI. All icons must be Lucide SVG icons.
4. ❌ **No Fake Live Feeds / Simulated CCTV** — Feeds without verified WebRTC/HLS credentials must state *“Camera integration not configured”*.
5. ❌ **No Fabricated Stats, Testimonials, or Fake Metrics** — Empty databases display purposeful empty states.
6. ❌ **No Inactive / Decorative Buttons** — Every interactive element must trigger a real action, dialog, or display an honest *Not Configured* badge.
7. ❌ **No Giant Empty Side Gutters** — Content must breathe while utilizing standard responsive container widths.
8. ❌ **No Color-Only Indicators** — All state must be communicated with text + icon + color.

---

## 7. Pre-Delivery Quality Checklist

- [ ] Text contrast meets WCAG 2.2 AA (minimum 4.5:1 for normal text, 3:1 for large text & UI boundaries).
- [ ] Keyboard navigation fully supported (`Tab`, `Shift+Tab`, `Enter`, `Escape` for dialogs).
- [ ] Visible focus rings on all interactive components.
- [ ] Minimum touch target size $44 \times 44\text{px}$ on mobile.
- [ ] Screen widths verified at 360px, 375px, 768px, 1024px, 1440px, 1920px.
- [ ] No horizontal scrolling on mobile viewports.
- [ ] Loading skeletons provided for all async data queries.
- [ ] Server-side authorization verified before rendering or executing mutations.
