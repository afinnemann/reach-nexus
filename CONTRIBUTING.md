# Contributing to the REACH Nexus website

This guide assumes you've never used Git on the command line. You can do everything described here through the GitHub web interface, then the site rebuilds locally and a maintainer pushes the result.

## How the site works in two sentences

All content lives in JSON files under `_data/`. A small Python script reads those files and writes the public HTML pages — so to change a name, a date, a description, or add a news entry, you edit JSON, the script does the rest.

## Recipe 1 — Fix a typo

1. On GitHub, find the data file you want to edit (most likely `_data/team.json`, `_data/sites.json`, `_data/wps.json`, or `_data/news.json`).
2. Click the file name → click the pencil icon ("Edit this file").
3. Find the typo. Edit it.
4. Scroll down to "Commit changes." Add a short message like "Fix typo in WP4 summary." Click "Commit changes."
5. Tell a maintainer the file changed; they will run `python3 build.py` and push the regenerated HTML.

## Recipe 2 — Add a team member

1. Open `_data/team.json` in the GitHub web editor.
2. Find the existing member who is most similar to the new one (same role tier).
3. Copy that whole `{ ... }` block, paste a new copy below it, and edit the fields:
   - `id`: short slug, lowercase, no spaces (e.g. `silva` for Silva).
   - `name`, `surname`, `title`.
   - `role_rank`: 1 = PI, 2 = co-applicant, 3 = collaboration partner, 4 = project staff. Use the same number as the most similar existing member.
   - `role_en`, `role_pt`: e.g. "Postdoctoral researcher" / "Pesquisador(a) de pós-doutorado".
   - `wp_role`: e.g. "WP2 · WP3".
   - `institution_en`, `institution_pt`.
   - `country`: "NL" or "BR".
   - `email` (optional).
   - `bio_en`, `bio_pt`: one or two sentences each.
4. Make sure the JSON is still valid — the easiest check is that every line ends in a comma except the last property of the object, and there is a comma after the closing `}` of every member except the last.
5. Commit. Ask a maintainer to rebuild.

## Recipe 3 — Update a case-site description

1. Open `_data/sites.json`. Find the site by `id` (`jardim-pantanal`, `parque-das-tribos`, `nelson-mandelapark`, `ede`).
2. Edit `summary_en` and/or `summary_pt`. Keep the description factual and avoid identifying individual residents.
3. **Do not change `coords.precision` without speaking to a co-PI first.** This field controls how the site appears on the public map and is reviewed with the local partner.
4. Commit. Ask for a rebuild.

## Recipe 4 — Add a news / project-log entry

1. Open `_data/news.json`.
2. Copy the most recent entry block. Paste a new copy at the **top** of the `entries` array.
3. Edit:
   - `date`: ISO-8601 format, `YYYY-MM-DD`.
   - `title_en`, `title_pt`.
   - `tags`: an array of short strings — e.g. `["wp4", "fieldwork", "jardim-pantanal"]`.
   - `body_en`, `body_pt`: 40 to 120 words each.
4. Commit. Ask for a rebuild.

## Recipe 5 — Post a vacancy

1. Edit `_pages/page_vacancies.html` (this one is HTML, not JSON, until we move it).
2. Find the "Open positions" section and add a new entry.
3. Commit. Ask for a rebuild.

## Recipe 6 — Update grant numbers and acknowledgement strings

1. Open `_data/funders.json`.
2. For each funder, replace `[TBC]` in `grant_number` with the official reference once the award letter is issued.
3. Update `ack_en` and `ack_pt` if the funder's communications office issues a different mandatory wording.
4. Commit. Ask for a rebuild.

## Building locally (for maintainers)

If you have Python 3 and Jinja2:

```bash
git clone https://github.com/<org>/reach-nexus-site
cd reach-nexus-site
python3 build.py            # generate all HTML
open en/index.html          # macOS — preview the site in your browser
```

To preview with a local web server (better — handles absolute paths):

```bash
python3 -m http.server 8000
# then open http://localhost:8000/en/
```

## Translation policy

The Portuguese editorial owner reviews and merges PT changes. Anyone can add or edit PT copy; final wording is checked by the editorial owner before release. EN ships without waiting for PT to catch up — the site does not stall on translation.

When EN is updated and the PT version is now out of date, leave a comment in the JSON entry like `"pt_review_needed": true` so the editorial owner sees it next pass. (This is not enforced by the build, just a convention.)

## Coordinate-precision rule (do not skip)

Every entry in `_data/sites.json` must have `coords.precision` set to one of `city`, `neighbourhood`, or `exact`. The build script will refuse to build the site if this field is missing or invalid. **Do not raise the precision** (e.g. from `city` to `exact`) without sign-off from the relevant Local Working Group. This is documented in `/en/about/ethics.html` and is one of the project's core ethical commitments.

## Reporting accessibility issues

See `/en/accessibility.html` for the public reporting channel.
