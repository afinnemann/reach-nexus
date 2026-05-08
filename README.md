# REACH Nexus website

Public website for the **Urban Climate Health Nexus (UCH-Nexus)** consortium, publicly branded **REACH Nexus**. NWO–FAPESP Merian Fund, 2026–2030. UvA-led with partners at USP, FGV, Fiocruz Amazônia, Amsterdam UMC, IEE/USP, Instituto Alana, and the municipalities of Amsterdam and Ede.

## What this is

A static, bilingual (EN + PT) website hosted on GitHub Pages. No runtime backend, no tracking, no third-party CDN, no cookies.

The site has 28 pages per language (homepage, four case-site detail pages, team, five work-package pages, an about hub with six policy stubs, plus approach, outputs, vacancies, project log, funding, contact, and accessibility).

## How content is managed

Content lives in **JSON data files** under `_data/`, not in HTML. Edit one file, rebuild, and the change propagates everywhere it appears. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for recipes covering the most common edits.

```
_data/
├── sites.json           # the four case sites — coordinates, consent text, partners
├── team.json            # consortium members, sorted by role then surname
├── wps.json             # five work packages — leads, deliverables, summaries
├── funders.json         # NWO, FAPESP, Merian Fund — grant numbers and ack strings
├── partners.json        # institutional partners
├── news.json            # project log entries
└── site_config.json     # project-wide metadata, contact details, deploy config
```

HTML body templates live under `_pages/`; the shared chrome (header, footer, funder strip) lives in `_templates/base.html`. **Do not edit generated HTML files inside `/en/` or `/pt/` directly** — they are overwritten on every build.

## Build

The build is reproducible and dependency-light:

```bash
python3 -m pip install --user jinja2     # one-time, only Jinja2 is needed
python3 build.py                         # generate all HTML
python3 build.py --check                 # validate JSON without writing
```

The build script:

1. Loads JSON from `_data/`.
2. Validates that every site has a `coords.precision` field of `city`, `neighbourhood`, or `exact`. **Refuses to build otherwise.** This is the project's coordinate-ethics gate.
3. Renders templates into `/en/` and `/pt/`.
4. Writes a root `index.html` redirect, `404.html`, and `sitemap.xml`.
5. Drops a `.nojekyll` so GitHub Pages serves files as-is.

Re-run the build after every content edit. Commit both the data file change and the regenerated HTML.

## Deploy

Push `main` to a GitHub repository. In repo settings → Pages, choose **Source: Deploy from a branch**, **Branch: main**, **Folder: / (root)**.

The site will be available at `https://<org>.github.io/<repo>/` (or your custom domain). For a custom domain, add a `CNAME` file at the repo root.

## Stack

- Plain HTML, CSS, and a single ~150-line vanilla JS file for the map.
- [Leaflet 1.9.4](https://leafletjs.com/) vendored locally under `assets/vendor/leaflet-1.9.4/` (no CDN at runtime). Tile basemap: CARTO Positron — neutral, light.
- CSS uses custom properties as semantic role tokens (`--color-primary`, `--color-accent`, …) defined in `assets/css/tokens.css`. No frameworks.
- Build tool: Python 3 + Jinja2 — used at build time only, not at runtime.
- No analytics, no third-party tracking, no fonts or scripts loaded from external CDNs. Privacy posture: server-log-only.

## What's deliberately not in v1

- Real partner logos (NWO, FAPESP, UvA, USP, Fiocruz, Amsterdam UMC, FGV, Alana, Ede, Amsterdam) — placeholder strings are used until the official SVGs are dropped into `assets/funders/`.
- Real team photos — initials are used as placeholders.
- Confirmed grant numbers — `[TBC]` placeholders in `_data/funders.json` until the award letters are issued.
- Named local liaisons for each case site — to be confirmed by each Local Working Group.
- A Dutch (NL) summary block on the two NL site pages — planned, not yet written.
- Real client-side analytics (we plan to use server-log aggregation via GoAccess instead of a JS beacon).

These are content drops into a structure that already exists. None of them require code changes.

## Accessibility

Targeting **WCAG 2.2 Level AA**. See `/en/accessibility.html` (or `/pt/accessibility.html`) for the public statement.

## License

- Content (text, data files): [CC BY 4.0](LICENSE-CC-BY-4.0.md).
- Code (HTML, CSS, JS, build script): [MIT](LICENSE).
- Leaflet under `assets/vendor/leaflet-1.9.4/` is © Vladimir Agafonkin and Leaflet contributors, BSD 2-Clause licensed.

## Citation

A `CITATION.cff` file at the repo root provides citation metadata. The site is also archived to Zenodo on tagged releases (see [`/en/about/archival.html`](en/about/archival.html)).

## Contact

See [`/en/contact.html`](en/contact.html). For website issues, open a GitHub issue or email the address listed there.
