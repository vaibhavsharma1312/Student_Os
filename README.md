# Student OS — Clean Deploy Bundle

Project ko do services mein deploy karna hai: **frontend (Vercel)** aur **backend API + PostgreSQL (Docker-capable host, jaise Render/Railway)**. Frontend build verified; backend source existing features ke saath preserve kiya hai.

## 1. Backend + database deploy

1. `backend/` folder ko Render/Railway ya kisi Docker host par deploy karein (Dockerfile included).
2. Managed PostgreSQL database banayein aur ye environment variables backend service par set karein:
   - `DATABASE_URL` — JDBC format: `jdbc:postgresql://HOST:5432/DB_NAME`
   - `DB_USERNAME` — database user
   - `DB_PASSWORD` — database password
   - `JWT_SECRET` — unique random secret, at least 32 bytes; production mein local default kabhi na use karein
   - `APP_CORS_ALLOWED_ORIGINS` — deployed frontend ka exact origin, e.g. `https://your-app.vercel.app` (no trailing slash)
   - `DDL_AUTO=update` (initial deployment ke liye; production schema migrations baad mein plan karein)
3. Deploy ke baad API ka public HTTPS URL note karein.

Local backend: Java 21 + Maven 3.9+ required. PostgreSQL `localhost:5432/student_os` par chahiye.

```bash
cd backend
mvn clean package
java -jar target/student-os-api-0.0.1-SNAPSHOT.jar
```

## 2. Frontend Vercel deploy

1. Vercel mein `frontend/` ko project root ke roop mein select karein.
2. Framework: **Vite**; install: `pnpm install --frozen-lockfile`; build: `pnpm build`; output: `dist`.
3. Environment variable add karein: `VITE_API_BASE_URL=https://YOUR-BACKEND-URL` (backend origin only, API path nahi).
4. Frontend deploy karke uska exact HTTPS origin backend ke `APP_CORS_ALLOWED_ORIGINS` mein add karein. CORS value change karne ke baad backend redeploy karein.

Frontend Settings/sign-in screen mein API URL change karne ka option bhi hai. App ko features chalane ke liye backend aur database zaroori hain; **frontend-only deploy se authentication/data features kaam nahi karenge**. Database/JWT secrets kabhi frontend/Vercel browser variables mein mat rakhein.

## Local frontend

```bash
cd frontend
pnpm install --frozen-lockfile
pnpm dev
```

API default `http://localhost:8080` hai. `frontend/.env.example` dekh kar `.env.local` bana sakte hain.
