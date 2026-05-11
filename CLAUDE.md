# REACH Nexus website — briefing for AI assistants

You are working on the public website for the **REACH Nexus** research consortium. This file is the first thing you should read before editing anything. It tells you what the project is, how the site is built, and the small set of rules that will keep you from breaking it.

## Project

REACH Nexus — **R**esilience to **E**xtreme weather: **A**dvancing **C**limate-**H**ealth Nexus — is a five-year Dutch–Brazilian research consortium, 1 May 2026 → 2031. Formal/proposal title is *Urban Climate Health Nexus* (UCH-Nexus). REACH Nexus is the public brand; UCH-Nexus is the funder/grant-database name. Funded by NWO and FAPESP under the Merian Fund. Co-led by Reinout Wiers (UvA) and Leandro Giatti (USP). Four case sites:

| Site | City | Country |
|------|------|---------|
| Jardim Pantanal | São Paulo | BR |
| Parque das Tribos | Manaus | BR |
| Nelson Mandelapark | Amsterdam | NL |
| Ede | Ede | NL |

Adam Finnemann (UvA postdoc) maintains the site. Live at `https://afinnemann.github.io/reach-nexus/` until a custom domain is purchased.

## The site at a glance

- Bilingual (English + Portuguese). EN ships without waiting for PT. PT editorial owner is the USP group.
- 28 pages per language. Plain HTML/CSS/JS, vendored Leaflet for the map, vendored data-dashboard JS for the Data page. No third-party CDN at runtime. No tracking, no cookies.
- WCAG 2.2 AA target. Self-contained, GitHub Pages-hostable.
- Hosting deploys from `/main` root. A small Python+Jinja2 build script generates all HTML from data files; the build output is committed and is what GitHub Pages serves.

## Repo layout

```
reach-nexus-site/
├── build.py                        # the single source of truth for routing
├── _data/                          # ALL editable content lives here
│   ├── site_config.json            # project metadata, deploy config (base_path, canonical_base)
│   ├── sites.json                  # 4 case sites
│   ├── team.json                   # consortium members
│   ├── wps.json                    # 5 work packages
│   ├── funders.json                # NWO + FAPESP (Merian removed from strip)
│   ├── partners.json               # institutional partners
│   └── news.json                   # project-log entries
├── _templates/
│   └── base.html                   # shared chrome (header, footer, funder strip)
├── _pages/                         # body fragments; one per route
│   ├── page_home.html
│   ├── page_sites_index.html  ·  page_site_detail.html
│   ├── page_team.html
│   ├── page_wps_index.html  ·  page_wp_detail.html
│   ├── page_about_index.html and 6 about/* sub-pages
│   ├── page_data.html              # the curated dataset dashboard
│   ├── page_outputs.html · page_vacancies.html · page_news.html
│   ├── page_funding.html · page_contact.html · page_accessibility.html
│   └── page_404.html
├── assets/
│   ├── css/  tokens.css, styles.css, data-dashboard.css
│   ├── js/   map.js, data-dashboard.js
│   └── vendor/leaflet-1.9.4/       # vendored; do not load Leaflet from a CDN
├── en/, pt/                        # GENERATED OUTPUT — do not hand-edit
├── index.html                      # root redirect to /en/
├── 404.html · sitemap.xml · CITATION.cff · LICENSE · CONTRIBUTING.md
└── .github/workflows/ci.yml        # JSON validation + HTML5 + link check + pa11y
```

## How to make changes

**Rule of thumb:** edit `_data/*.json`, `_pages/*.html`, or `_templates/base.html`. Run `python3 build.py`. Commit both the source edit AND the regenerated HTML. Never hand-edit anything inside `/en/` or `/pt/`.

```bash
# from the repo root, after any content edit:
python3 build.py            # regenerates all 56 generated pages + sitemap
git add . && git commit -m "..." && git push
```

Common edits:

- **Fix a typo in a team bio** → edit `_data/team.json`, rebuild.
- **Add a news entry** → prepend a block to `_data/news.json:entries`. ISO date, EN + PT body, optional tags.
- **Change a site description** → edit `_data/sites.json`. Do NOT change `coords.precision` without partner sign-off (see Tripwires).
- **Reorder the top nav** → edit `nav_for()` in `build.py`.
- **Add a new page** → add a `_pages/page_X.html` fragment + a render_page() block in `build.py:build()` + add to sitemap list + (optionally) add to `nav_for()`.
- **Change the deploy URL** → edit `deploy.canonical_base` and `deploy.base_path` in `_data/site_config.json`, rebuild. Empty `base_path` for custom-domain / `<user>.github.io` repos; `/<repo>` for project repos.
- **Update the Data-page cards** → the data sits inline in `assets/js/data-dashboard.js` between `>>>MERIAN_DATA_START<<<` / `>>>MERIAN_DATA_END<<<`. Source of truth is the separate `brazil_nl_env_data` repo's `registry/cards.yaml`; regenerate from there via its `scripts/compile_registry.R` and paste the new `window.MERIAN_DATA = {...}` payload between the markers.

## Tripwires — these will break things if changed wrong

1. **Coordinate-ethics gate (non-negotiable).** Every `_data/sites.json` entry must have `coords.precision` set to `city`, `neighbourhood`, or `exact`. `build.py` refuses to build otherwise. Jardim Pantanal is `neighbourhood`. Parque das Tribos is `city` — this follows indigenous data-sovereignty principles agreed with Fiocruz Amazônia and the community association. **Do not raise the precision without sign-off from the relevant Local Working Group.** Documented in `/en/about/ethics.html`.

2. **Co-PI parity.** Wiers and Giatti both have `role_rank: 1` in `team.json`. Team renders sort by role rank then surname; never group or sort by country. Funder strip renders NWO and FAPESP at equal visual weight.

3. **base_path threading.** Internal URLs in templates use `{{ base_path }}/...` (asset paths) or values from `url_set()` (page paths). If you hand-write absolute URLs, prefix them with `{{ base_path }}` or you'll break subpath hosting. `data-base="{{ base_path }}"` on `<html>` lets JS read the base path (see `map.js`, `data-dashboard.js`).

4. **No third-party CDN at runtime.** Leaflet is vendored; fonts are system stack; no Google Fonts, no analytics. Don't add `<script src="https://cdn..."` or `<link rel="stylesheet" href="https://fonts..."`. GDPR / Schrems II posture is "server-log-only, no third-party requests."

5. **EN/PT structure must mirror.** Every page exists in both `/en/` and `/pt/`. Renderer expects matching `*_en` / `*_pt` fields in JSON. Adding a field in one language without the other breaks the build for the missing locale. PT can be a placeholder; it cannot be absent.

6. **The funder strip is NWO + FAPESP only** (Merian was removed at Adam's request). Merian context is preserved in (a) the homepage hero eyebrow, (b) the news entry, and (c) both NWO and FAPESP `ack_en` / `ack_pt` strings on the funding page. Don't re-add a Merian entry to `_data/funders.json` — it would put Merian back in the footer strip on every page.

7. **Living-lab vs modelling labels are intentionally absent.** Adam removed them on field-study pages because the binary distinction was "off." Don't reintroduce `tag--living-lab` / `tag--modelling` classes or a `type` field on sites. WP5 still legitimately describes "living-lab interventions" as a method — that stays.

8. **The Approach page is deleted.** `_pages/page_approach.html` is a stub with a deprecation comment; `build.py` does not render it; the orphan files at `/en/approach.html` and `/pt/approach.html` are redirects to `/work-packages/` for bookmark robustness. Don't try to revive it without asking.

## Build script mental model

`build.py` is small (~430 lines, stdlib + Jinja2). The flow per language:

1. Load all `_data/*.json`.
2. Validate `sites.json` against the precision schema (fatal if violated).
3. For each page key, call `render_page()` with a template and a context. `render_page()` resolves base.html, the nav, the canonical URL, the hreflang alternate, and the funder strip.
4. Write to `ROOT/<lang>/<path>.html`.
5. After both languages, write the root redirect, the 404 page, the sitemap, and the `.nojekyll`.

If you add a new page, copy the existing `render_page(env, ...)` block in `build()` and adapt. Always pass `alt_path` so the hreflang alternate is correct. Always pass `base_path=base_path`.

## CI

`.github/workflows/ci.yml` runs on every push: JSON schema validation, a no-diff regeneration check (catches stale generated HTML), HTML5 validation, lychee link check, and pa11y-ci accessibility on a representative subset of pages. Run `python3 build.py --check` locally before pushing if you want to fail fast on schema errors.

## How to verify before committing

```bash
python3 build.py                # rebuild — should be no diff if you only edited content
~/.local/bin/html5validator --root . --match '*.html' --blacklist _templates _pages
python3 -m http.server 8000     # then browse http://localhost:8000/reach-nexus/en/
```

If you change anything that touches multiple pages (e.g. nav order, base_path, funder strip), rebuild and inspect at least one page per language to confirm.

## Long-term context

The site is one component of a wider stack:

- **`brazil_nl_env_data`** (separate repo, also on `afinnemann`) is the source-of-truth registry for the Data page's dataset cards. Sync = regenerate that repo's JSON payload and paste into `assets/js/data-dashboard.js`.
- **CLIHEALTH** (mentioned in Adam's memory) is the upstream evidence pipeline that *feeds* the consortium's WP3 work. It is a separate, larger project; do not conflate it with REACH Nexus.
- Annual Zenodo snapshots of this website are planned per `/about/archival.html`; the project officially ends 2031 and the site is committed to live for 3+ years after.

If something feels surprising while you're editing, ask before doing. Adam's preferences (from his memory): simple readable code, R + ggplot for analysis, dplyr::select() explicit. Motto: "simple but excellent."
