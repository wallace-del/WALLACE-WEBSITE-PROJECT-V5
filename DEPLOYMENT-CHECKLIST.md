# WALLACE.DEV v12 — Production Checklist

## Already implemented in the v12 codebase

- [x] Multi-page project architecture
- [x] Dedicated project index
- [x] Six project detail/case-study pages
- [x] Consistent project statuses
- [x] Evidence-based skill presentation
- [x] Responsive navigation
- [x] Keyboard-visible focus states
- [x] Reduced-motion support
- [x] Responsive WebP image variants
- [x] Lazy loading below the fold
- [x] Eager hero image loading
- [x] Real Open Graph image asset
- [x] Professional 404 page
- [x] Privacy page matching current static contact behavior
- [x] Public portfolio repository link verified
- [x] Contact form wording does not falsely claim server-side delivery
- [x] Internal link/asset audit passed
- [x] JavaScript syntax audit passed

## Requires Wallace / production information

- [ ] Add final CV at `assets/cv/wallace-wambugu-cv.pdf`
- [ ] Confirm the final LinkedIn public URL before deployment
- [ ] Supply the real production domain
- [ ] Add canonical URLs using that domain
- [ ] Generate `sitemap.xml` with absolute production URLs
- [ ] Add sitemap URL to `robots.txt`
- [ ] Use absolute production URL for Open Graph image
- [ ] Decide hosting platform
- [ ] Decide whether a server-backed contact form is needed
- [ ] Configure production security headers on the chosen host

## Project evidence still needed as projects grow

- [ ] Remote Income Match verified feature screenshots
- [ ] Remote Income Match repository/live URL when published
- [ ] Expense Tracker verified problem statement and implementation evidence
- [ ] Hospital Management System verified requirements/modules and implementation evidence
- [ ] Mobile App verified user flow and implementation evidence
- [ ] Database System ERD/schema/query/testing evidence

## Final production testing

- [ ] Test 320px, 375px, 390px, 430px, 768px, 1024px, 1280px, 1440px and 1920px layouts in real browsers
- [ ] Test keyboard-only navigation
- [ ] Test a screen-reader pass on navigation/forms/project pages
- [ ] Run Lighthouse on deployed pages
- [ ] Run PageSpeed Insights on the production URL
- [ ] Check LCP, INP and CLS
- [ ] Verify every external link on production
- [ ] Verify browser console has no unexpected errors
- [ ] Verify 404 routing on the chosen host
