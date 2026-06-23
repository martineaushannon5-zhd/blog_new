# Debug Session: button-qa-audit

- Status: OPEN
- Scope: Audit clickable UI actions across the front-end pages and identify broken buttons, dead links, inconsistent interactions, and UX risks.
- Goal: Produce an evidence-based bug list and improvement suggestions before any code fixes.
- Constraints: No business logic modification before runtime and code evidence are collected.

## Hypotheses

1. Some buttons or links point to valid routes but produce broken behavior because required backend data or API configuration is missing.
2. Some CTA buttons are visually present but are wired to incomplete or placeholder actions, causing no-op or misleading behavior.
3. Some page actions work on desktop/local machine but break under mobile/LAN/proxy scenarios because URLs are environment-sensitive.
4. Some navigation or admin actions have state-dependent behavior that is not obvious, creating UX confusion even when technically functional.
5. Some clickable elements are semantically weak (anchor/button mismatch, missing target behavior, unclear feedback), increasing the chance of perceived bugs.

## Audit Plan

- Enumerate clickable controls from core pages/components.
- Cross-check routes, href targets, and action handlers.
- Validate obvious runtime dependencies such as API base URL and auth gating.
- Summarize confirmed issues, suspected issues, and UX improvements separately.

## Evidence Collected

- Front-end clickable controls were enumerated from `Navbar.vue`, `Home.vue`, `Cooperation.vue`, `Sponsor.vue`, `RightSideSettings.vue`, `AdminLogin.vue`, `AdminDashboard.vue`, `Posts.vue`, and `PostDetail.vue`.
- Build check passed successfully, so the current issues are behavioral/interaction bugs rather than compile-time failures.
- Local backend runtime checks succeeded:
  - `GET /api/health` returned `status: ok`
  - `POST /api/auth/login` succeeded with default admin credentials
  - `GET /api/posts` returned valid post data

## Confirmed Findings

1. `client/src/api/http.ts` hardcodes fallback API base URL to `http://localhost:4000/api`, so data-driven buttons and pages break on LAN/other devices even when the front-end opens successfully.
2. `client/src/views/admin/AdminLogin.vue` and `client/src/views/admin/AdminDashboard.vue` mutate `localStorage` directly, while `client/src/components/Navbar.vue` reads auth state from the Pinia store, causing header button state to go stale after login/logout.
3. `client/src/components/RightSideSettings.vue` always applies auto theme on mount and ignores previously saved `theme`, so the theme toggle button does not persist the user's choice across refreshes.

## Suspected / UX Issues

- `client/src/components/RightSideSettings.vue` resets custom background color whenever the theme toggle is used, which may feel like the background-color button is broken or lossy.
- `client/src/components/Navbar.vue` has many top-level actions but no mobile collapse pattern for the main nav, so some buttons may become crowded or inaccessible on narrow screens.
- `client/src/style.css` hides the native cursor globally; if the custom cursor fails or is unsuitable for some devices, interactive affordance is weakened.
