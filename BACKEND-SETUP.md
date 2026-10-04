# WALLACE.DEV Backend Setup

The uploaded static portfolio has now been prepared for a real backend.

## Architecture

Browser frontend -> Express REST API -> Prisma -> PostgreSQL

Docker Compose runs PostgreSQL and the backend together.

## 1. Start the backend
Open a terminal in this project folder and run:

```bash
docker compose up --build -d
```

## 2. Create the database tables
Run once:

```bash
docker compose exec backend npx prisma migrate dev --name init
```

## 3. Confirm the API
```bash
curl http://localhost:5000/api/health
```

Expected JSON starts with:
```json
{"ok":true,"service":"wallace-portfolio-backend"}
```

## 4. Run the frontend
Do not double-click `index.html` for this stage. Serve the folder through a local web server, for example VS Code Live Server on port 5500.

Then open:
`http://127.0.0.1:5500`

The contact form and Wallace AI will use `http://localhost:5000` automatically during local development.

## 5. Test the contact API directly
```bash
curl -X POST http://localhost:5000/api/contact -H "Content-Type: application/json" -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"subject\":\"Portfolio test\",\"message\":\"Testing the WALLACE.DEV backend contact endpoint.\"}"
```

## 6. Test Wallace AI directly
```bash
curl -X POST http://localhost:5000/api/assistant/chat -H "Content-Type: application/json" -d "{\"message\":\"What projects has Wallace built?\"}"
```

## Next backend stages
1. Add an authenticated admin dashboard to read/archive contact messages.
2. Move portfolio/project content from browser JavaScript into PostgreSQL.
3. Add email notifications for new contact messages.
4. Add a real LLM provider to Wallace AI while retaining verified portfolio grounding.
5. Add production deployment, HTTPS, production secrets, logging and backups.
