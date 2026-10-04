# WALLACE.DEV Stage 3 — Dynamic public portfolio

Stage 3 makes the public portfolio read its core content from PostgreSQL through the Express API.

## What is dynamic now
- Profile/name/role/location/contact links
- About headline and about text
- Hero focus tags and “currently developing” items
- Technology/skill groups
- Learning groups
- Availability and languages
- Featured projects on the home page
- All projects on projects.html
- Wallace AI answers from PostgreSQL-backed profile/project data
- Admin → Site content edits the public content

## Upgrade from V2 while keeping the V2 database
The safest path is to copy the Stage 3 files over the V2 folder, keeping the same folder name and `.env`, then rebuild Docker. This keeps the existing V2 Docker Compose project name and database volume.

From the V2 project directory:

```cmd
docker compose down
```

Copy/replace the Stage 3 project files into that same V2 directory. Keep your existing `.env`.

Then:

```cmd
docker compose up --build -d
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed
curl http://localhost:5000/api/health
```

Expected health version: `3.0.0`.

Open `admin.html` using Live Server and use the new **Site content** tab.
