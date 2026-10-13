# Student OS Frontend — Implementation Plan

## Product and implementation

Build a responsive browser frontend for the supplied Student OS Spring Boot REST API. It is a static React + TypeScript application, served by Vite, and remains deployable independently from the Java API. The browser-facing API base URL is configurable in Settings and stored locally; it is not compiled as a private secret. Requests use the API's bearer-token authentication. The backend must be hosted separately and permit browser CORS from the frontend origin.

The product will expose clear-English flows for registration and sign-in; profile editing; adding/removing skills; browsing and creating projects; project match and skill-gap insights; sending join requests and handling owner review/status; browsing opportunities and resources; and connecting the frontend to a configured API URL. Forms will reflect actual API semantics, including query parameters where the Spring controllers use `@RequestParam`, JSON for auth, and the profile shape supported by the controller. Missing backend capabilities will not be fabricated.

### Project structure

- `src/main.tsx` — React bootstrapping.
- `src/App.tsx` — page selection, authenticated shell, global state and shared notices.
- `src/lib/api.ts` — typed API requests, bearer token handling, configurable base URL, error conversion.
- `src/lib/types.ts` — frontend types mirroring backend payloads.
- `src/components/` — navigation, forms, status badges, empty/loading/error states and reusable panels.
- `src/pages/` — dashboard, auth, projects, matching, opportunities, resources, profile and settings experiences.
- `src/styles.css` — responsive design system and motion.
- `public/manus-routes.json` — declared application routes.
- `plan.md`, `TODO.md` — approved implementation choices and outcome tracking.

## Design direction

- **Design Movement:** Contemporary editorial campus software: the warmth of a student makers' journal paired with the precision of a modern product dashboard.
- **Core Principles:** Strong hierarchy; optimistic but restrained color; navigation that stays predictable; honest feedback that never implies an API action succeeded before it has.
- **Color Philosophy:** Warm ivory canvas and ink-blue typography feel calm and readable; saturated cobalt is the recognizable action color; lime and tangerine mark progress and status without turning the interface into a toy.
- **Layout Paradigm:** Persistent narrow left rail on desktop, a broad editorial content column with a compact right-side insight rail on larger views, and a compact bottom/overlay navigation pattern on mobile. Avoid making every section an identical centered card grid.
- **Signature Elements:** A custom orbit/asterisk Student OS symbol; oversized section numerals and labels; fine dotted dividers and small status capsules.
- **Interaction Philosophy:** Obvious focus states, immediate local input feedback, explicit loading and empty states, confirmation for destructive actions, and server-backed success/error notices.
- **Animation:** Brief 140–220 ms fades/slides for route and panel transitions; subtle progress fill and hover elevation only; honor `prefers-reduced-motion`; avoid motion that obscures content.
- **Typography System:** Space Grotesk for titles and prominent numbers; DM Sans for body and control text, with system fallbacks. H1 32–40 px, section titles 22–28 px, body 14–16 px, compact labels 11–12 px.
- **Brand Essence:** A practical workspace that helps students find collaborators, opportunities and useful resources. Personality: capable, curious, encouraging.
- **Brand Voice:** Clear and short, never Hinglish or corporate jargon. Examples: “Find the missing skill. Meet the teammate.” and “Your next project starts with one good connection.”
- **Wordmark & Logo:** A custom inline orbit mark—three small nodes orbiting a central square—paired with a tightly tracked “student os” wordmark; render with CSS/SVG rather than a generic icon font.
- **Signature Brand Color:** Electric cobalt `#4F5BFF`.

## Frontend/backend serving and constraints

Vite builds static files to `dist/`. A local API base URL setting defaults to `http://localhost:8080`; production deployment must set the actual backend URL in the UI or browser-safe build configuration. Auth tokens stay in `sessionStorage`. No credentials or database URLs are embedded in the frontend bundle. Because the backend is separate, frontend deployment does not deploy Spring Boot or provision PostgreSQL. The API uses lazy JPA relationships in its current entity responses, so request-scoped JPA access stays enabled until those endpoints are migrated to DTOs/fetch plans. Set `APP_CORS_ALLOWED_ORIGINS` on the backend to the exact production Vercel origin. The frontend README documents the backend requirement and Vercel build settings.

## Browser routes

`/` redirects to `/dashboard` when a token is present, otherwise to `/login`.
`/login`, `/register`, `/dashboard`, `/projects`, `/matches`, `/opportunities`, `/resources`, `/profile`, and `/settings` are the app routes. Authenticated routes show a sign-in prompt if the session has no token.
