# WALLACE.DEV v12

WALLACE.DEV v12 is Wallace Wambugu's evidence-based personal technology portfolio. It keeps the existing HTML/CSS/JavaScript foundation while restructuring the site into a concise homepage, a project index, and dedicated project case-study pages.

## Architecture

```text
/
├── index.html
├── projects.html
├── privacy.html
├── 404.html
├── projects/
│   ├── wallace-dev.html
│   ├── remote-income-match.html
│   ├── expense-tracker.html
│   ├── hospital-management.html
│   ├── mobile-app.html
│   └── database-system.html
├── css/
│   ├── style.css
│   └── project-pages.css
├── js/
│   ├── script.js
│   └── projects.js
├── data/
│   └── projects.json
├── images/
│   ├── optimized/        # responsive WebP variants used by v12
│   ├── projects/         # original project images
│   ├── profile/
│   ├── about/
│   ├── build/
│   ├── skills/
│   ├── brand/
│   └── social/
└── assets/cv/
```

## What changed in v12

- Reduced the homepage from a long all-in-one case-study page into a focused professional entry point.
- Added a dedicated `projects.html` page with honest status filters.
- Added six dedicated project detail/case-study pages.
- Introduced a consistent project status system: LIVE, IN DEVELOPMENT and DESIGN COMPLETE.
- Reworked skills around evidence instead of percentage ratings.
- Added a structured technology section and development philosophy.
- Preserved the About typing animation while respecting reduced-motion preferences.
- Preserved image areas in the What I Can Build section.
- Added responsive WebP image variants at appropriate sizes.
- Added a real branded Open Graph image asset.
- Added a concise Currently Open To section.
- Added a server-backed contact form with PostgreSQL storage, an authenticated admin inbox and optional SMTP email notifications.
- Added `data/projects.json` as a maintenance/audit reference for project status and evidence.
- Preserved Wallace Digital as a secondary identity in the footer while keeping WALLACE.DEV as the primary developer identity.

## Verified public GitHub evidence

- GitHub profile: `wallace-del`
- Public portfolio repository: `wallace-del/portfolio-website`

Other project pages do not show GitHub or live-demo buttons until a verified public destination exists.

## Adding the CV

Place the final CV at:

```text
assets/cv/wallace-wambugu-cv.pdf
```

The v12 interface keeps the CV controls disabled when testing from `file://`. After deployment over HTTP/HTTPS, the script performs a lightweight HEAD check and enables the button only when a real PDF exists.

## Production domain

A production domain has not been supplied, so v12 intentionally does **not** invent a canonical URL or sitemap hostname. Once the real domain exists:

1. Add canonical URLs.
2. Change Open Graph image references to absolute production URLs.
3. Generate `sitemap.xml` using the real domain.
4. Add the absolute sitemap URL to `robots.txt`.

## Contact form

WALLACE.DEV now includes a server-backed contact system. Contact submissions are validated, sent to the Express API, stored in PostgreSQL, available in the authenticated admin dashboard, and can trigger an SMTP email notification. Backend credentials remain in environment variables and are not exposed to frontend JavaScript.

## Development rule

Do not convert planned functionality into completed claims. Update a project page only when there is evidence to support the change: code, screenshots, tests, architecture, repository links, live deployment, or documented design work.

## Wallace AI Assistant

v12 now includes a floating **Wallace AI** portfolio assistant on the homepage, project index, case-study pages, privacy page and 404 page.

The assistant is deliberately evidence-constrained:

- It answers from curated WALLACE.DEV project facts and the user-supplied Master CV.
- It does not call an external AI API in this version.
- It does not send or store visitor questions on a server.
- It distinguishes LIVE, IN DEVELOPMENT and DESIGN COMPLETE projects.
- It refuses to invent unsupported information and redirects visitors to documented topics.
- It includes direct navigation to relevant project pages, GitHub, LinkedIn and contact information.

Supported topics include projects, Remote Income Match™, technologies, database work, learning, internships/availability, GitHub, education, contact information and what Wallace can build.

The knowledge base is maintained in `js/wallace-ai.js`. When project facts change, update the assistant only after the portfolio evidence has also been updated.

## Stage 3 dynamic content
The site now includes PostgreSQL-backed profile content, database-driven project rendering, a Site content admin editor, and a backend-powered Wallace AI assistant. See `STAGE-3-DYNAMIC-CONTENT.md`.


## Stage 4
See `STAGE-4-RICH-PROJECTS.md` for the upgrade guide covering project image uploads, richer project metadata, featured projects and optional SMTP contact notifications.

## Stage 5 — Production readiness

See `STAGE-5-PRODUCTION-READINESS.md` for health/readiness checks, structured logs, safer production Docker settings, and database backup/restore instructions.
