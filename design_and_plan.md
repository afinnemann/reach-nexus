# REACH Nexus — Website Design & Work Plan

**Project:** Urban Climate Health Nexus (UCH-Nexus), publicly branded **REACH Nexus**.
NWO–FAPESP consortium, UvA + USP led, 5 years from 1 Jan 2026.

**Goal:** A simple, professional project website. GitHub Pages-hostable. No build step.

---

## 1. Tech stack

- **Plain static site:** `index.html`, `team.html`, `sites.html`, `work-packages.html`, `contact.html`, plus `assets/css/styles.css`, `assets/js/map.js`, `assets/img/`.
- **Why not Hugo/Jekyll:** the site is small (~5 pages) and team members will edit by hand or via PRs. A SSG adds ceremony for no real benefit.
- **Map library:** Leaflet 1.9 from unpkg CDN (5 KB gzipped + ~40 KB tiles per pan). MIT-licensed, no API key required for OpenStreetMap basemap. Will gracefully degrade to a static SVG world map if JS is blocked.
- **Fonts:** Inter (body) + Spectral (display) from Google Fonts. Self-host as a follow-up if NWO branding policy requires.
- **No tracking, no cookies.** Aligns with academic norms and avoids GDPR complications.
- **Accessibility:** semantic HTML, alt text on all images, focus-visible outlines, contrast checked against WCAG AA.

## 2. Sitemap

```
index.html             → Hero, summary, four-site map, funders strip, news teaser
sites.html             → One card per case site with description, photos placeholder, lat/lon, partner orgs
team.html              → PIs first, then co-applicants (NL/BR sub-headings), then project staff, photo + bio placeholders
work-packages.html     → WP1–WP5 as expandable cards with leads, months, deliverables
contact.html           → PI emails, postal address, GitHub link, optional newsletter mention
```

(News and Publications can be added later; flagged in the footer as "coming soon".)

## 3. Visual identity

**Colour palette** (from Adam's preferences):

| Role | Hex | Use |
|---|---|---|
| Dark blue | `#335c67` | Primary — header, links, key accents |
| Dark red | `#540b0e` | Secondary — section headers, hover states |
| Red | `#9e2a2b` | Accent — site markers, key CTAs |
| Golden | `#e09f3e` | Highlight — funding strip, callouts |
| Light yellow | `#fff3b0` | Background — soft section dividers |

This is a warm, earthy palette that reads as serious without being institutional grey. It also distinguishes Brazil (warmer tones) from the Netherlands (cooler dark blue) on the map — a small narrative win.

**Typography:** display in Spectral (a humanist serif — academic but not stuffy), body in Inter. Generous line-height (1.65), max line length ~70ch, comfortable reading at any viewport.

**Layout:** single-column on mobile, 12-col grid on desktop (max width 1100 px). Lots of whitespace. Each section gets one accent colour, not all five at once.

## 4. Page-level content

### Homepage (`index.html`)
- **Hero:** "REACH Nexus" wordmark + tagline "Urban Climate Health Nexus — resilience and health equity through citizen science, system modelling, and policy innovation."
- **At-a-glance:** 4 stats — 4 sites · 5 years · 2 countries · 9 institutions.
- **One-paragraph public summary** (verbatim from proposal).
- **Map block:** interactive Leaflet map showing all four sites with branded markers and pop-ups linking to `sites.html#site-id`.
- **Funders strip:** NWO + FAPESP + Merian Fund (text placeholders for logos).
- **Footer:** consortium institutions, contact, year, GitHub link.

### Sites page (`sites.html`)
For each site: name, country flag, lat/lon caveat (approximate), 2-paragraph description from proposal, partner institution, vulnerabilities, "Living lab" / "Modelling-only" tag.

Sites:
1. **Jardim Pantanal** — São Paulo, Brazil — living lab — Tietê floodplain, IPVS 6
2. **Parque das Tribos** — Manaus, Brazil — modelling — 35 indigenous ethnic groups, ~2,800 residents
3. **Nelson Mandelapark / Bijlmermeer** — Amsterdam, NL — living lab — modernist neighbourhood, low-lying
4. **Ede** — Gelderland, NL — modelling — agricultural fringe, heat & water stress

### Team (`team.html`)
PIs side-by-side at top: Wiers + Giatti. Then NL co-applicants (Nollkaemper, Willems, Bockting, Harris). Then BR co-applicants (Nicolletti, Jacobi, Burgos, Malik). Then collaboration partners (El Kadri, Vendrametto). Then project staff. Photo + role + 1-line bio + email/ORCID per person — placeholder grey circles where no photo yet.

### Work packages (`work-packages.html`)
WP1–WP5 with lead, months, plain-language summary, deliverables list. Three-phase model (Understand → Integrate → Improve) shown as a small flow diagram at the top.

### Contact (`contact.html`)
PI emails (Wiers, Giatti). Mailing address at UvA. Note that the project starts Jan 2026; recruitment notices will appear here.

## 5. Map implementation

**Sites and coordinates:**

| Site | City | Country | Lat | Lon | Type |
|---|---|---|---|---|---|
| Jardim Pantanal | São Paulo | BR | −23.4944 | −46.4344 | Living lab |
| Parque das Tribos | Manaus | BR | −3.0833 | −60.0833 | Modelling |
| Nelson Mandelapark | Amsterdam | NL | 52.3167 | 4.9667 | Living lab |
| Ede | Ede | NL | 52.0333 | 5.6667 | Modelling |

A note on the page will mark Jardim Pantanal and Parque das Tribos coordinates as approximate (centroids of parent districts; informal settlements have no fixed boundary in OSM).

Markers use the dark-red colour for living-lab sites and the dark-blue for modelling-only sites (legend in corner). Initial view is bounded so all four are visible at once (zoom ~3, world-spanning across the Atlantic).

## 6. Accessibility & performance

- All `<img>` tags have meaningful `alt`.
- Map has a `<noscript>` fallback listing the four sites with text and lat/lon.
- Semantic landmarks: `<header>`, `<main>`, `<nav>`, `<footer>`, `<section>` with aria-labels.
- Total page weight target: < 200 KB excluding map tiles. No web fonts blocking render (font-display: swap).
- Lighthouse target: Performance 95+, Accessibility 100, Best practices 100, SEO 100.

## 7. GitHub Pages deployment notes

- Repo layout root-level: `index.html` + assets. No `_config.yml` needed.
- `.nojekyll` file at root to skip Jekyll processing.
- README documents how to edit content (no build needed, just commit HTML).
- Optional: a `404.html` page with a friendly redirect to homepage.

## 8. Work plan (stepwise)

**Step 1 — Skeleton.** Create directory layout, write the five HTML files with semantic structure and shared header/nav/footer (no styling). Verify they render and link to each other.

**Step 2 — Content fill.** Drop in the proposal-derived text on each page. Use placeholders (`[photo]`, `[logo]`) for missing assets. Sites and team data structured as JSON in a small JS file so it can be pulled into the map.

**Step 3 — Styles.** Apply the colour palette, fonts, and grid via `styles.css`. Build the hero, sections, cards, footer.

**Step 4 — Map.** Wire up Leaflet with custom-coloured circle markers for the four sites, popups linking to the sites page, and a minimalist OSM tile layer (Carto's "light" basemap is a good neutral fit). Add a noscript fallback.

**Step 5 — Polish.** Cross-page consistency, accessibility audit, mobile breakpoint check. Add a `README.md` with edit instructions and a `LICENSE` (CC-BY-4.0 for content suggested).

**Step 6 — Verify.** Open the site locally, take screenshots, check all links, validate HTML, confirm map markers all render.

## 9. Out of scope (for v1)

- Real logos from UvA, USP, NWO, FAPESP, etc. (will be dropped in by the user).
- Real team photos.
- Publications page (added once papers exist).
- News / blog (added once there's news).
- Multi-language (Portuguese + Dutch + English) — English-only for v1; structure allows i18n later.
- A CMS / admin interface — content edits via Git only.

## 10. Estimated effort

For an LLM-assisted single sitting: ~30 min build + 10 min verify. For Adam to maintain afterwards: edit HTML directly, commit, push — under 5 min per content update.
