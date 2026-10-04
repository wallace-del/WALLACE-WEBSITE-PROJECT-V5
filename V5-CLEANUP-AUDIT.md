# WALLACE.DEV V5 Cleanup Audit

## Fixed in this patch

1. **Contact success message**
   - Success now displays only: `Message sent successfully.`
   - Removed the internal/admin wording shown to visitors.

2. **Contact error behavior**
   - Removed the unexpected automatic `mailto:` fallback when the backend is unavailable.
   - Visitors now see a clear error and can choose to use the visible email link manually.
   - Added `Sending...` state and temporary submit-button disabling to prevent duplicate submissions.

3. **Frontend API ports**
   - `site-content.js` and `wallace-ai.js` still pointed to port `5000` while the V5 production overlay exposes the backend on `127.0.0.1:5001`.
   - They now use `http://127.0.0.1:5001` for localhost/127.0.0.1 testing and same-origin API URLs after deployment.

4. **Admin login rate-limit bug**
   - The login limiter previously applied to all `/api/auth/*` requests, including repeated `/api/auth/me` session checks.
   - This could cause a legitimate login to receive HTTP 429 after page refreshes.
   - The limiter now applies only to `/api/auth/login`.
   - Contact and Wallace AI routes are also placed before the generic public API limiter so they use their dedicated limits without being double-limited.

5. **Privacy page**
   - Removed outdated statements saying the site has no backend/database.
   - Updated contact-message handling and Wallace AI behavior to match the current V5 architecture.

6. **README and project evidence**
   - Replaced the old `mailto:` contact description with the current Express/PostgreSQL/admin-inbox/SMTP implementation.
   - Updated the WALLACE.DEV project evidence entry to reflect the server-backed contact system.

7. **Admin HTML semantics**
   - Removed invalid nested interactive markup (`button` inside an `a`) from the Reply by email action.
   - Added matching link styling in `css/admin.css`.

8. **Wallace AI accessibility**
   - Added clearer accessible labels and decorative-element hiding for the launcher, close button, suggestion area and send button.

9. **Production documentation**
   - Updated Stage 5 local production health-check examples to use `127.0.0.1:5001`.

## Verified

- JavaScript syntax checks passed for modified frontend files and backend server file.
- `data/projects.json` parses successfully.
- No frontend JavaScript file in the patched copy still hardcodes port `5000`.

## Remaining items before public deployment

1. **CV file is missing**
   - The pages reference `assets/cv/wallace-wambugu-cv.pdf`, but that PDF is not present in the supplied project.
   - Add the final CV before deployment or keep the download control disabled.

2. **Production domain not configured yet**
   - Add the real HTTPS domain to `CORS_ORIGINS`.
   - Add canonical URLs and absolute Open Graph URLs.
   - Add the absolute sitemap URL to `robots.txt` after the real domain is known.

3. **HTTPS is required for the real deployment**
   - Production admin cookies use the `Secure` flag.
   - Deploy behind HTTPS/reverse proxy before exposing the admin dashboard publicly.

4. **Verify public profile content before launch**
   - Confirm every language, skill, project status, availability item and link shown in the admin Site Content section is current and intended for public display.

5. **Rotate secrets before public deployment**
   - Any password/JWT/database credential ever pasted into chat, screenshots, logs or shared files should be replaced before launch.
   - Keep `.env`, `.env.production`, database backups and SMTP App Passwords out of Git and public archives.

6. **Final browser testing**
   - Test the public site and admin dashboard at phone, tablet and desktop widths.
   - Test contact submission, Gmail notification, Wallace AI, project image upload, logout/login, broken-link handling and the 404 page.
