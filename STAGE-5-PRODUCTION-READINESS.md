# Stage 5 — Production Readiness

Stage 5 prepares WALLACE.DEV for safer deployment without changing the public design or deleting existing V4 data.

## What is new

- Backend version 5.0.0.
- `/api/ready` database readiness check.
- Structured request logs with request IDs.
- Graceful shutdown for Docker/restarts.
- Safer production cookie/HTTPS behavior through `NODE_ENV=production`.
- Backend container health check.
- Backend runs as the non-root `node` user.
- Production Compose override that does not publish PostgreSQL to the host.
- Separate `.env.production.example`.
- PostgreSQL backup and restore PowerShell scripts.
- Existing optional SMTP contact notifications remain available.

## V4 -> V5 local upgrade

1. Stop V4 with `docker compose down` (never add `-v`).
2. Copy V4 `.env` into the V5 folder.
3. Confirm `COMPOSE_PROJECT_NAME=wallacewebsiteprojectv2` remains in `.env`.
4. Start V5: `docker compose up --build -d`.
5. Run `docker compose exec backend npx prisma migrate deploy`.
6. Test `curl http://127.0.0.1:5001/api/health` and `curl http://127.0.0.1:5001/api/ready`.

No Stage 5 schema migration is required; the upgrade focuses on production operations and security.

## Backups

Create a database backup from PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\backup-database.ps1
```

Backups are written to the local `backups` directory. Keep a separate copy outside the laptop before major upgrades.

Restore only when necessary:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\restore-database.ps1 -BackupFile .\backups\wallace_portfolio-YYYYMMDD-HHMMSS.sql
```

The restore script asks for an explicit `RESTORE` confirmation.

## Production Compose

For a server behind an HTTPS reverse proxy:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

In production, set `CORS_ORIGINS` to the exact HTTPS website origin. Do not use localhost values.

## Secrets

Before public deployment, replace all development credentials. Never commit `.env`, SMTP passwords, database passwords, or JWT secrets to GitHub.
