# UI — Landing restyle plan

Status: **plan, not started**. Scope: the public landing served by `apps/web` at `/`
(`src/app/page.tsx`). The dashboard gets its own plan in [`../ui-dashboard.md`](../ui-dashboard.md).

## Goal

A complete visual reset, not a polish pass. The current landing reads as amateur: rounded
"friendly" type (Baloo + Nunito), a mix of Aceternity / Magic UI snippets with no shared
language, and too many competing effects. The target is an industrial-B2B product that looks
serious and premium, built on one component source (React Bits) adapted to the Actus brand.

Rule for every section: **current component → is there a React Bits equivalent? → yes: replace
it and adapt it to brand colors + fonts / no: rebuild it on the new foundations.**

---

## 1. Foundations (do these first — every section depends on them)

### Typography

| Role | Font | Weights | Usage |
|---|---|---|---|
| Headlines | **Montserrat** | 800 (ExtraBold), 900 (Black) | `h1`–`h3`, big statements, numbers |
| Body / UI | **Inter** | 400, 500, 600 | paragraphs, nav, buttons, forms, labels |

- Load both with `next/font/google` in `src/app/layout.tsx`, replacing `Baloo_Bhaina_2` and
  `Nunito`. Keep the existing CSS variable contract so nothing else breaks:
  `--font-heading` → Montserrat, `--font-sans` → Inter (`src/app/globals.css`, `@theme inline`).
- Headlines: Montserrat 900, tight tracking (`tracking-tight` / `-0.02em`), line-height ~1.05.
  Never use Montserrat for body copy.
- Type scale (desktop → mobile): H1 72→40, H2 48→32, H3 28→22, body 18→16, small 14.
- The dashboard will use the same pair (see `ui-dashboard.md`).

### Color tokens — decision needed

The logo / favicon use **navy `#242F5B` + orange `#EA580E`** (`src/app/icon.svg`), but the site
tokens are **`#0A2463` + `#F97316`** (`globals.css`, `src/config/theme.ts`). The two blues and
two oranges are visibly different. Pick one set and make it the single source of truth:

- **Recommended:** align the site to the logo (`#242F5B` / `#EA580E`) and derive the light/dark
  shades from them. The dashboard mockups already lean towards that navy.
- `src/config/theme.ts` duplicates the CSS tokens in JS — reduce it to what WebGL/canvas
  components need (they take hex/RGB props, not CSS variables).
- Check every text/background pair against WCAG AA (4.5:1 body, 3:1 large text). Orange on
  white fails for body text — use it for accents, large headlines and buttons with white text only
  after checking contrast.

### Installing React Bits

- Variant: **TypeScript + Tailwind** (`-TS-TW`). Install per component with the shadcn CLI:
  `npx shadcn@latest add @react-bits/<Name>-TS-TW` — the code is copied into the repo, so it is
  ours to edit.
- Put them in `src/components/reactbits/` (one folder per component) so they are easy to tell
  apart from our own components.
- License: MIT + Commons Clause — fine for commercial use of the site.
- New dependencies some components pull in: `gsap` (+ `@gsap/react`; all GSAP plugins incl.
  `SplitText` and `InertiaPlugin` are free), `lenis` (ScrollStack), `ogl` (WebGL backgrounds).
  Avoid the ones that need `three` / `@react-three/*` (e.g. `Beams`) — too heavy for a landing.
- Some components assume other stacks: `PillNav` imports `react-router-dom` → swap for
  `next/link`; `CardNav` uses `react-icons` → swap for `lucide-react` (already installed).
- Standardize animation libs: the project has both `framer-motion` and `motion`. Use
  `motion/react` (what React Bits uses) and GSAP; remove `framer-motion` once the old
  components are gone.

### Motion & performance rules

- Every animated component must respect `prefers-reduced-motion` (static fallback, no
  scroll-jacking).
- **At most one WebGL background visible at a time.** Load them with
  `next/dynamic({ ssr: false })`, pause them off-screen, and give them a static CSS gradient
  fallback.
- No smooth-scroll hijacking on the whole page. `ScrollStack` brings Lenis — scope it to its
  own container, never globally.
- Budget: the landing must stay fast on a mid-range Android on 4G (the audience is plant
  managers, often on mobile). Check Lighthouse before/after each phase.

### Accessibility baseline

Semantic landmarks (`header`/`nav`/`main`/`section` with headings/`footer`), a single `h1`,
visible focus states on everything interactive, keyboard-operable nav and FAQ, `alt` on every
image, text effects must keep the real text in the DOM (screen readers must not read split
letters one by one).

---

## 2. Section by section

Current order in `src/app/page.tsx`: Navbar → Hero → ProductDefinition → ProblemSection →
SolutionSection (intro + dashboard stack + operators) → Faqsection → ContactSection → Footer →
BackToTop.

### 2.1 Navbar — `components/landing/Navbar.tsx` + `components/ui/floating-navbar.tsx`

- **Today:** floating navy pill, hides on scroll down, 4 anchors + "Iniciar sesión". Icons are
  mismatched (a `$` icon for "La Solución").
- **React Bits:** **`CardNav`** (recommended) — compact bar that expands into link cards; room for
  logo, 2–3 grouped link cards and a CTA. Alternative: `PillNav` if we want to stay close to the
  current pill. `StaggeredMenu` for the mobile full-screen menu if CardNav's mobile doesn't
  convince.
- **Adapt:** Actus logo, navy/orange tokens, Inter 500 for links, `lucide-react` icons,
  smooth-scroll to anchors, "Iniciar sesión" as secondary action and the primary CTA as the
  filled button (see open decision on the primary CTA).

### 2.2 Hero — `components/landing/Hero.tsx`

- **Keep:** the phone with the WhatsApp-style animation (`animated-assets/HeroAnimatedAsset.tsx`
  and `assets/ws-ui/*`). Only restyle its frame/shadow to the new palette if needed.
- **Replace everything else:**
  - Headline in Montserrat Black with **`SplitText`** (staggered reveal on load) — or
    `BlurText` if we want something calmer.
  - The "Para siempre." line → **`RotatingText`** cycling short outcomes, or keep it static in
    orange if rotating feels gimmicky.
  - Background → one subtle WebGL background: **`SoftAurora`** or **`Grainient`** in navy tones,
    or **`DotGrid`** (interactive dots, lighter) — prototype two and choose.
  - CTA → filled button with **`StarBorder`** or **`Magnet`** micro-interaction; secondary text
    link to "Iniciar sesión".
  - Optional trust row under the CTA (pilot/partner logos) with **`LogoLoop`** once we have logos.

### 2.3 ProductDefinition — `components/landing/ProductDefinition.tsx`

- **Today:** a long centered paragraph in three blocks with `ColourfulText` highlights over a
  dot pattern.
- **React Bits:** **`ScrollReveal`** — the text lights up word by word as you scroll. Ideal for
  a manifesto-style statement. Highlight "Actus IA", "asiste", "aprende", "conserva" in orange.
- **Adapt:** shorten the copy (it is three paragraphs today — aim for 2 sentences), Montserrat
  800 at large size, drop the dot pattern.

### 2.4 ProblemSection ("El desafío", `#desafio`) — `components/landing/ProblemSection.tsx`

- **Today:** dark header, a Bento grid with 4 pain points (each with a custom animated SVG:
  Brain, Link, Puzzle, Graphic), `AnimatedWorkflow`, and a closing "¿Cuánto más puede…?" CTA
  block. Mixes BentoGrid, BorderBeam, DottedGlowBackground and DotPattern.
- **React Bits:** **`MagicBento`** for the 4 pain points (spotlight + border glow, keeps a bento
  layout). Lighter alternative: `SpotlightCard` in a plain grid.
- **Adapt:** keep the 4 custom SVG illustrations if they survive the new palette, otherwise
  replace with `lucide` icons. If we have real numbers, add **`CountUp`** stats. Re-evaluate
  `AnimatedWorkflow` (605 lines) — keep only if it still explains something the cards don't.
  Closing CTA: rebuild with the new button.

### 2.5 SolutionSection intro — `components/landing/SolutionSection.tsx` + `components/ui/HeroSection.tsx`

- **Today:** section hero with `BackgroundRippleEffect`, gradient text with `animate-pulse`.
- **React Bits:** headline with **`SplitText`** or `ScrollFloat`; no background effect here (the
  hero already has one) — solid navy or white.
- **Adapt:** remove the pulsing gradient text.

### 2.6 Dashboard showcase (stacked screens) — `components/cards-parallax/*`

- **Today:** 4 dashboard screenshots (operators, events, files, dashboard) that stack and scale
  on scroll (`CardParallax`, SCSS modules, data in `src/data/mockData.ts`). The concept works
  and stays.
- **React Bits:** **`ScrollStack`** — same idea (cards pin and stack while scrolling), cleaner
  and configurable. Alternative: `CardSwap` (auto-cycling 3D stack) if we want it to animate on
  its own instead of on scroll.
- **Adapt:** each card is a browser-frame mockup with a real dashboard screenshot, a title and
  one line of copy (the `description` fields are empty today). Remove the SCSS modules.
- **Dependency:** the screenshots (`src/assets/screens/*.svg`) show the *current* dashboard. After
  the dashboard restyle (`ui-dashboard.md`) they must be re-captured — until then, keep the
  current images.
- Fix the typo "Adminstración" → "Administración" in `mockData.ts`.

### 2.7 Operators subsection (WhatsApp) — `components/landing/OperatorsSubsection.tsx`

- **Today:** dark section, 3 inputs (Texto / Audio / Imagen) → rotating AI agent SVG → phone,
  connected with `AnimatedBeam`. Copy still talks about an "app".
- **React Bits:** no direct equivalent for the beams diagram. Options: keep `AnimatedBeam`
  restyled, and add **`AnimatedList`** to show WhatsApp messages arriving (text / voice note /
  photo) next to the phone — it tells the WhatsApp story better than icons.
- **Adapt:** rewrite copy for WhatsApp ("sin instalar nada, desde el WhatsApp que ya usan"),
  new palette, Montserrat headline.

### 2.8 FAQ — `components/landing/Faqsection.tsx`

- **Today:** custom accordion over an animated `Boxes` background, 335 lines.
- **React Bits:** no accordion component (`AccordionGallery` is an image gallery). Rebuild on
  an accessible accordion (Radix / shadcn `Accordion`) with our styling; drop `Boxes`.
- **Copy risk — review before publishing:** several answers promise things the product doesn't
  do today: integrations with SAP / IBM Maximo / Fiix / UpKeep, on-premise storage, customers
  in automotive/mining/pharma, "ROI in the first month", "40–60% less time per event", offline
  queueing. Keep only what's true for the pilot.

### 2.9 Contact — `components/landing/ContactSection.tsx`

- **Today:** navy section with contact info + form. **The form does nothing**: `handleSubmit`
  only does `console.log("Form submitted")` — leads are silently lost.
- **React Bits:** wrap the form card in **`BorderGlow`** or `SpotlightCard`; submit button with
  the new button style.
- **Needs a backend decision:** a Server Action that emails the lead (e.g. Resend) or stores it
  in the DB. Until then, replace the form with a `mailto:` / WhatsApp link rather than a form
  that drops data.

### 2.10 Footer — `components/landing/Footer.tsx`

- **Today:** 405 lines, big animated stroke logo, links to `/features`, `/solutions`, `/about`,
  `/contact` — **none of those routes exist (404)** — and placeholder social links
  (instagram.com, linkedin.com).
- **Rebuild:** simple 3-column footer (logo + tagline, section anchors, contact/legal) with the
  real links only. Optional: **`CurvedLoop`** or `ScrollVelocity` with a short "Actus IA" marquee
  as the closing visual. Add legal name/CUIT here when available (needed for Meta business
  verification).

### 2.11 BackToTop — `components/ui/BackToTop.tsx`

Keep, restyle to the new tokens.

### 2.12 Unused today

`PricingSection.tsx` (376 lines) is not rendered on the page. Decide: add pricing to the
landing, or delete it.

---

## 3. Cleanup after the migration

Delete the old snippet components once no section imports them: `floating-navbar`,
`bento-grid`, `border-beam`, `dotted-glow-background`, `dot-pattern`, `colourful-text`,
`background-ripple-effect`, `Boxes`, `text-generate-effect`, `encrypted-text`, `HeroSection`,
`cards-parallax/*` (+ SCSS), and `framer-motion` from `package.json`. Check with a grep before
each deletion — the dashboard may import some of them.

## 4. Execution order

Each phase is one PR-sized step, reviewed on the Vercel preview before moving on.

1. **Foundations:** fonts, color tokens (after the decision), React Bits folder + deps.
2. **Navbar + Hero** — the first impression; validates the whole direction.
3. **ProductDefinition + ProblemSection.**
4. **SolutionSection + dashboard stack + Operators.**
5. **FAQ + Contact + Footer** (+ copy review, contact backend decision).
6. **Cleanup** of old components and dependencies; Lighthouse + accessibility pass.

## 5. Open decisions

1. **Brand colors:** align to the logo (`#242F5B` / `#EA580E`) or keep the current tokens?
2. **Primary CTA:** today the main button everywhere is "Iniciar sesión". A marketing landing
   usually leads with "Agendar demo" / "Hablar con nosotros", with login as secondary. Which?
3. **Hero background:** SoftAurora vs Grainient vs DotGrid — prototype and choose.
4. **FAQ claims:** which answers stay (see 2.8).
5. **Contact form backend:** email (Resend), DB, or WhatsApp link.
6. **Pricing section:** show it or delete it.
