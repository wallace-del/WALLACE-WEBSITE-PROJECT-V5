# WALLACE.DEV Stage 4 — Rich Projects, Image Uploads & Optional Email Alerts

Stage 4 builds on the working Stage 3 database. It does **not** require a fresh database.

## What Stage 4 adds

- Upload a project cover image from the admin dashboard (JPG/PNG/WebP/GIF, max 5 MB).
- Uploaded project images persist in a Docker volume and are served from `/uploads/...`.
- Add technologies to each project.
- Add optional GitHub and live-demo links.
- Mark projects as Featured; the public homepage prefers featured projects.
- Public project cards automatically use uploaded images and richer metadata.
- Optional SMTP email notifications when a visitor submits the contact form.
- Stage 4 database migration adds fields without deleting existing project or message data.
- The seed script no longer overwrites profile/project edits when re-run.

## Upgrade from the working Stage 3 project

1. Keep the Stage 3 folder as a backup.
2. Extract this ZIP to a new folder, for example:
   `D:\WALLACE WEBSITE PROJECT V4`
3. Stop V3 from the V3 folder:
   `docker compose down`
4. Copy the V3 `.env` into V4:
   `copy "D:\WALLACE WEBSITE PROJECT V3\.env" "D:\WALLACE WEBSITE PROJECT V4\.env"`
5. Confirm the copied `.env` still contains:
   `COMPOSE_PROJECT_NAME=wallacewebsiteprojectv2`
   This intentionally reuses the existing PostgreSQL volume.
6. From V4 run:
   `docker compose up --build -d`
7. Check containers:
   `docker compose ps`
8. Apply the new migration:
   `docker compose exec backend npx prisma migrate deploy`
9. Do **not** need to seed if your existing content is already present. Running `npm run seed` is now safe because it only creates missing portfolio records and refreshes the configured admin password.
10. Check:
   `curl http://localhost:5000/api/health`
   It should report version `4.0.0`.
11. Open `index.html` with VS Code Live Server, and open `admin.html` the same way.

## Test the image upload

1. Sign in to the admin dashboard.
2. Open **Projects**.
3. Click **Edit** on a project.
4. Choose an image under **Upload project image**.
5. Click **Upload image**.
6. Wait for “Image uploaded. Save the project to attach it.”
7. Add technologies, e.g. one per line:
   `Node.js`
   `PostgreSQL`
   `Docker`
8. Optionally add GitHub/live-demo URLs and check **Feature this project on the homepage**.
9. Click **Save project**.
10. Refresh the public portfolio. The new image and project metadata should appear dynamically.

## Optional contact email notifications

The contact form continues to store messages in PostgreSQL even when email notifications are disabled.

To enable email alerts, add SMTP settings to `.env` and set:

```
EMAIL_NOTIFICATIONS=true
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-app-password-or-smtp-password
SMTP_FROM=your-from-address
CONTACT_NOTIFY_TO=your-notification-address
```

Then rebuild/recreate the backend:

`docker compose up -d --build`

Do not commit SMTP credentials, admin passwords, or JWT secrets to GitHub.

## Data safety

`docker compose down` keeps named volumes. Do **not** run `docker compose down -v` unless you intentionally want to delete PostgreSQL data and uploaded project images.
