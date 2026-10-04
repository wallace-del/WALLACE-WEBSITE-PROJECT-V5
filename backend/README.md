# WALLACE.DEV Backend

Node.js + Express + PostgreSQL + Prisma backend for the portfolio.

## What is implemented
- `GET /api/health` – backend health check
- `GET /api/profile` – verified public profile data
- `GET /api/projects` – verified project list
- `GET /api/projects/:slug` – one project
- `POST /api/contact` – validate and store contact messages in PostgreSQL
- `POST /api/assistant/chat` – Wallace AI verified-portfolio responses from server-side knowledge
- Helmet, CORS, JSON size limits and rate limiting

## Start with Docker
From the website root:

```bash
docker compose up --build -d
```

The API will be available at `http://localhost:5000`.

Initialize the database once (first time only):

```bash
docker compose exec backend npx prisma migrate dev --name init
```

Then verify:

```bash
curl http://localhost:5000/api/health
```

## Stop
```bash
docker compose down
```

To delete the development database volume too:
```bash
docker compose down -v
```

## Important before deployment
- Replace the development PostgreSQL password.
- Set `CORS_ORIGINS` to the real frontend domain.
- Put secrets in environment variables, never Git.
- Use HTTPS in production.
- Add email notification only after choosing an email provider.


Stage 4 adds persistent project image uploads, richer project metadata and optional SMTP contact notifications.
