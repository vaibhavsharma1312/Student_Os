# Student OS Frontend

A responsive React + TypeScript web app for the Student OS Spring Boot REST API. It includes sign-in and registration, a dashboard, project discovery and creation, match/skill-gap insights, join requests, opportunities, resources, student profile/skills, and API connection settings.

## Run locally

Requirements: Node.js 20+ and pnpm 11.25.0.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The local Preview uses port 3000. On the sign-in/register page, set the backend URL (the API defaults to `http://localhost:8080` for local work). The URL can also be changed from **Settings** after signing in. Auth tokens are kept in the current browser tab's session storage; the API URL is stored in local storage.

## Deploy this frontend to Vercel

1. Push/import this frontend project as its own Git repository in Vercel.
2. Select **Vite** (or keep the detected Vite settings): build command `pnpm install --frozen-lockfile && pnpm build`, output directory `dist`, Node.js 20 or newer.
3. Optionally define `VITE_API_BASE_URL` as the public Spring Boot API base URL at build time. The app also has a browser-side URL field so the connection can be set or changed without rebuilding.
4. Deploy the backend separately on a Java/container host with PostgreSQL. Configure its database/JWT secrets and set `APP_CORS_ALLOWED_ORIGINS` to the exact Vercel origin (for example `https://student-os.vercel.app`, with no path or trailing slash).
5. Open the frontend, set the same public API URL, and sign in.

`vercel.json` rewrites application routes to the SPA entry. Vercel deployment of the frontend does not deploy the Java backend or its PostgreSQL database. The API must be reachable by the user's browser over HTTPS and must allow the exact frontend origin via CORS, including the `Authorization` header. The companion backend bundle documents and implements `APP_CORS_ALLOWED_ORIGINS`. Do not place database credentials or `JWT_SECRET` in frontend variables.
