# Student OS API

Spring Boot 3 REST API, PostgreSQL persistence, bearer JWT authentication, and configurable CORS. Deploy using the included Dockerfile.

## Required production environment

- `DATABASE_URL`: JDBC PostgreSQL URL (`jdbc:postgresql://HOST:5432/DB`)
- `DB_USERNAME`, `DB_PASSWORD`: PostgreSQL credentials
- `JWT_SECRET`: unique random secret of 32+ bytes; never use the development fallback in production
- `APP_CORS_ALLOWED_ORIGINS`: comma-separated exact frontend origins, e.g. `https://your-app.vercel.app`
- `PORT`: supplied by host (default 8080)

Optional: `JWT_EXPIRATION` (milliseconds; default 86400000), `DDL_AUTO` (default update), `SPRING_JPA_OPEN_IN_VIEW` (default true).

## Run locally

Requires Java 21, Maven 3.9+, and PostgreSQL at `localhost:5432/student_os`.

```bash
mvn clean package
java -jar target/student-os-api-0.0.1-SNAPSHOT.jar
```

API routes include `/auth`, `/projects`, `/profile`, `/match`, `/opportunities`, `/resources`, `/skills`, and `/join-requests`. Most routes require JWT authentication.
