# UniRide - Plateforme de Covoiturage (Spring Boot + Web)

## 1) Architecture

- Layered architecture:
  - controller/
  - service/
  - repository/
  - model/
  - dto/
  - exception/
- Domain-oriented business rules (reservations, paiement, notifications).
- Persistence mode switchable by environment variable.

## 2) Persistence Modes

- memory (default): no external database required.
- postgres (production): PostgreSQL persistence.

Environment variables:

- APP_PERSISTENCE_MODE=memory|postgres
- POSTGRES_URL=jdbc:postgresql://<host>:5432/<database>
- POSTGRES_USER=<database-user>
- POSTGRES_PASSWORD=<database-password>
- POSTGRES_SCHEMA=public (optional)

## 3) Quick Start (Memory)

```powershell
./start-app.ps1
```

Open http://localhost:8080

## 4) Quick Start (Postgres)

1. Prepare a PostgreSQL database (local or cloud).
2. Fill .env from .env.example.
3. Start app:

```powershell
./start-app-postgres.ps1
```

The app auto-creates required tables in the selected schema when postgres mode is enabled.

## 5) Required Tables (Auto-created)

- users_store
- trajets_store
- reservations_store

## 6) Stable Scripts

- start-app.ps1: foreground run (memory by default)
- start-app-bg.ps1: background run
- start-app-postgres.ps1: postgres mode using .env
- stop-app.ps1: stop running app and free port 8080

## 7) API Summary

Auth:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- GET /api/auth/users

Trips:
- POST /api/trajets
- GET /api/trajets
- POST /api/trajets/{id}/close

Reservations:
- POST /api/reservations
- POST /api/reservations/{id}/confirm?chauffeurId=...
- POST /api/reservations/{id}/cancel?initiateurId=...&initiateurChauffeur=true|false
- GET /api/reservations
- GET /api/reservations/passager/{passagerId}
- GET /api/reservations/passager/{passagerId}/suivi
- GET /api/reservations/chauffeur/{chauffeurId}/demandes

System:
- GET /api/system/health

## 8) Frontend Pages

- /
- /pages/login.html
- /pages/register.html
- /pages/search-trips.html
- /pages/my-reservations.html
- /pages/create-trip.html
- /pages/driver-reservations.html
- /pages/notifications.html
- /pages/admin.html

## 9) Deployment Checklist

- Set APP_PERSISTENCE_MODE=postgres
- Set POSTGRES_URL, POSTGRES_USER, POSTGRES_PASSWORD as secret env vars
- Keep /api/system/health for uptime probes
- Use HTTPS in production
- Never commit .env

## 10) GitHub/CI

- .gitignore excludes .env and runtime artifacts
- GitHub Actions workflow: .github/workflows/ci.yml
- CI runs mvn -B clean test on push and pull request
