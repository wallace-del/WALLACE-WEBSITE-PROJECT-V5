# WALLACE.DEV — Stage 2 Admin Backend

Stage 2 adds a private admin login, message inbox, database-backed projects, and project CRUD management.

## Important if you are upgrading the existing v1 folder

Your existing PostgreSQL Docker volume was created with the v1 password `wallace_dev_password`. To keep that existing database and its test message, use the same database password in the root `.env` for now. You can rotate it later.

Create a file named `.env` beside `docker-compose.yml`:

```env
POSTGRES_PASSWORD=wallace_dev_password
ADMIN_EMAIL=YOUR_ADMIN_EMAIL
ADMIN_PASSWORD=USE_A_STRONG_PASSWORD_AT_LEAST_12_CHARACTERS
JWT_SECRET=PASTE_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARACTERS
```

Do not commit `.env` to Git.

A quick way to generate a JWT secret in PowerShell is:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Upgrade commands

From the project root:

```cmd
docker compose down
docker compose up --build -d
```

Apply the new Stage 2 database migration:

```cmd
docker compose exec backend npx prisma migrate deploy
```

Seed the six existing projects and create/update the admin account:

```cmd
docker compose exec backend npm run seed
```

Verify:

```cmd
curl http://localhost:5000/api/health
curl http://localhost:5000/api/projects
```

The health response should report backend version `2.0.0`.

## Open the admin dashboard

Serve the website using VS Code Live Server (normally port 5500), then open:

```text
http://127.0.0.1:5500/admin.html
```

Sign in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the root `.env` file.

The admin session is stored in an HttpOnly cookie. The browser-side JavaScript does not receive or store the authentication token.

## Stage 2 API endpoints

Public:

- `GET /api/health`
- `GET /api/profile`
- `GET /api/projects`
- `GET /api/projects/:slug`
- `POST /api/contact`
- `POST /api/assistant/chat`

Authentication:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Admin (authentication required):

- `GET /api/admin/summary`
- `GET /api/admin/messages`
- `PATCH /api/admin/messages/:id/read`
- `DELETE /api/admin/messages/:id`
- `GET /api/admin/projects`
- `POST /api/admin/projects`
- `PUT /api/admin/projects/:id`
- `DELETE /api/admin/projects/:id`

## Security notes

- Keep `.env` private.
- Change development secrets before deployment.
- Production should use HTTPS and a deployment-specific CORS origin.
- The admin cookie is HttpOnly and becomes `Secure` when `NODE_ENV=production`.
- Login, contact, assistant and general API routes are rate-limited.
- Admin passwords are stored as bcrypt hashes in PostgreSQL, not as plain text.
