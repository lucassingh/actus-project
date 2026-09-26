# UI — Dashboard restyle

Status: **first pass done** on branch `ui-dashboard-restyle` (built on top of `ui-landing-restyle`,
which carries the fonts and brand colors). Design context: [`PRODUCT.md`](../../../PRODUCT.md).

## Direction

Vercel-dashboard feel in a light theme: quiet surfaces, 1px hairlines, dense but readable data.
The design serves the task (impeccable's *product* register): one family (Inter) for all UI,
fixed type scale, brand color only for primary actions, current selection and state.

## System

| Token / rule | Value |
|---|---|
| Canvas (content area) | `#F5F5F7` (`bg-canvas`) |
| Sidebar, top bar, cards | white |
| Lines | `#E4E4E9` (`border-line`), rows `#EFEFF2` (`border-line-subtle`) |
| Text | `text-fg` `#0E1123`, `text-fg-muted` `#4B5066`, `text-fg-subtle` `#6B7085` (≥4.5:1 on white and canvas) |
| Radius | cards 8px, controls 6px, no decorative shadows |
| Primary action | navy `#242F5B`; orange only as the "Abierto" state accent |
| Motion | 150-200ms color/transform transitions, nothing decorative |

Primitives live in `apps/web/src/components/dashboard/ui.tsx` (Page, PageHeader, Card, CardHeader,
CardFooter, StatGroup/Stat, Badge, EmptyState, Alert, Field, `buttonStyles`, `inputStyles`, `table`,
Avatar, `formatDate`). Event labels/tones: `components/dashboard/event-meta.ts`. **New screens must use
these instead of ad-hoc classes.**

## Shell

`components/dashboard/DashboardShell.tsx`: white sidebar (logo, workspace + role, nav with sub-items
shown for the active section, collapse to icons, support link) and a top bar (breadcrumb, user name +
role, Clerk `UserButton` with the Google avatar and sign-out). Below `lg` the sidebar becomes a drawer.

## Auth

`components/auth/AuthShell.tsx`: 70/30 split. Left: React Bits `Grainient` (navy to orange, grain,
static under reduced motion) with a scrim for contrast and what the dashboard does. Right: `#F5F5F7`
with the logo and the Clerk form. Clerk is localized with `esUY` (voseo) and themed via
`ClerkProvider` variables + `cssLayerName: "clerk"`.

## Pending

- Visual pass on every screen with real data (supervisor view has few events today).
- Re-capture the dashboard screenshots used on the landing (`src/assets/screens/*.svg`).
- Operators have no "last access" (they never log in); the column shows the registration date.
