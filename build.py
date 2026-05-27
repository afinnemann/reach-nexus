#!/usr/bin/env python3
"""REACH Nexus — static site builder.

Reads JSON data from ``_data/``, renders Jinja2 templates from ``_templates/``,
and writes static HTML into ``/en/`` and ``/pt/`` directory trees.

The output is what GitHub Pages serves. The build is reproducible: re-running
this script regenerates all HTML from the data files. Hand-edits to generated
HTML will be overwritten — edit data files or templates instead.

Usage:
    python3 build.py            # build the site
    python3 build.py --check    # validate JSON schemas without writing
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "_data"
TPL_DIR = ROOT / "_templates"
PAGES_DIR = ROOT / "_pages"

LANGS = ("en", "pt")

# ---------------------------------------------------------------------------
# Data loading + minimal schema validation
# ---------------------------------------------------------------------------

def load_json(name: str) -> dict[str, Any]:
    with (DATA_DIR / f"{name}.json").open(encoding="utf-8") as fh:
        return json.load(fh)


def validate_sites(sites_doc: dict[str, Any]) -> None:
    """Refuse to build if any site is missing coords.precision."""
    valid_precisions = {"city", "neighbourhood", "exact"}
    for site in sites_doc["sites"]:
        coords = site.get("coords", {})
        if "precision" not in coords:
            sys.exit(f"[FATAL] site {site['id']} has no coords.precision — refusing to render map.")
        if coords["precision"] not in valid_precisions:
            sys.exit(f"[FATAL] site {site['id']} has invalid coords.precision={coords['precision']!r}.")
        for key in ("lat", "lon"):
            if not isinstance(coords.get(key), (int, float)):
                sys.exit(f"[FATAL] site {site['id']} has non-numeric coords.{key}.")


# ---------------------------------------------------------------------------
# URL helpers — every page gets a per-language URL set
# ---------------------------------------------------------------------------

def url_set(lang: str, base_path: str = "") -> dict[str, str]:
    """Build the URL map handed to every template.

    All URLs are absolute paths beginning with `base_path` (which is "" for
    root deployment and "/<repo>" for a GitHub Pages project repo).
    """
    base = f"{base_path}/{lang}/"
    return {
        "asset_root": f"{base_path}/",
        "home_url": base,
        "sites_url": base + "sites/",
        "wp_url": base + "work-packages/",
        "team_url": base + "team.html",
        "about_url": base + "about/",
        "contact_url": base + "contact.html",
        "vacancies_url": base + "vacancies.html",
        "news_url": base + "news.html",
        "accessibility_url": base + "accessibility.html",
        "funding_url": base + "funding.html",
        "outputs_url": base + "outputs.html",
    }


def nav_for(lang: str, current: str, base_path: str = "") -> list[dict[str, Any]]:
    base = f"{base_path}/{lang}/"
    items = [
        ("home", base, "Home", "Início"),
        ("about", base + "about/", "About", "Sobre"),
        ("sites", base + "sites/", "Sites", "Sítios"),
        ("wp", base + "work-packages/", "Work packages", "Pacotes de trabalho"),
        ("team", base + "team.html", "Team", "Equipe"),
        ("data", base + "data.html", "Data", "Dados"),
        ("news", base + "news.html", "Project log", "Diário"),
    ]
    return [
        {"href": href, "label": (label_en if lang == "en" else label_pt), "current": (key == current)}
        for key, href, label_en, label_pt in items
    ]


def alt_lang_url(lang: str, page_path: str, base_path: str = "") -> tuple[str, str]:
    """Given current lang and current page path (relative to /lang/), return
    the alternate-language URL and the alt language code."""
    other = "pt" if lang == "en" else "en"
    suffix = page_path if page_path != "index.html" else ""
    return other, f"{base_path}/{other}/{suffix}"


def last_updated_for(file_path: Path) -> str:
    """Return YYYY-MM-DD from git for a file, or today's date if not in git yet."""
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--", str(file_path)],
            cwd=ROOT, capture_output=True, text=True, timeout=4,
        )
        s = result.stdout.strip()
        if s:
            return s
    except Exception:
        pass
    return dt.date.today().isoformat()


# ---------------------------------------------------------------------------
# Render
# ---------------------------------------------------------------------------

def make_env() -> Environment:
    return Environment(
        loader=FileSystemLoader([str(TPL_DIR), str(PAGES_DIR)]),
        autoescape=select_autoescape(["html"]),
        trim_blocks=True,
        lstrip_blocks=True,
        keep_trailing_newline=True,
    )


def render_page(env, *, lang, page_key, body_template, body_ctx, out_path,
                page_title, page_description,
                needs_leaflet=False, needs_dashboard=False, include_funder_strip=True,
                project, funders, last_updated, base_path=""):
    # Make base_path / asset_root available inside body templates too
    # (needed for asset references like images embedded in page bodies).
    body_ctx = {**body_ctx, "base_path": base_path, "asset_root": f"{base_path}/"}
    body_html = env.get_template(body_template).render(**body_ctx)
    urls = url_set(lang, base_path=base_path)
    nav_items = nav_for(lang, page_key, base_path=base_path)
    rel_path_for_alt = body_ctx.get("alt_path", "index.html")
    alt_lang, alt_url = alt_lang_url(lang, rel_path_for_alt, base_path=base_path)
    config = body_ctx.get("config", {})
    canonical_base = config.get("deploy", {}).get("canonical_base", "https://afinnemann.github.io")
    suffix = (rel_path_for_alt if rel_path_for_alt != "index.html" else "")
    canonical = canonical_base + base_path + f"/{lang}/" + suffix
    default_canonical = canonical_base + base_path + "/en/" + suffix

    out = env.get_template("base.html").render(
        lang=lang,
        base_path=base_path,
        page_title=page_title,
        page_description=page_description,
        nav_items=nav_items,
        content=body_html,
        project=project,
        funders=funders,
        include_funder_strip=include_funder_strip,
        needs_leaflet=needs_leaflet,
        needs_dashboard=needs_dashboard,
        last_updated=last_updated,
        canonical=canonical,
        default_canonical=default_canonical,
        alt_lang=alt_lang,
        alt_lang_url=alt_url,
        lang_en_url=base_path + "/en/" + suffix,
        lang_pt_url=base_path + "/pt/" + suffix,
        **urls,
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(out, encoding="utf-8")
    print(f"  → {out_path.relative_to(ROOT)}")


# ---------------------------------------------------------------------------
# Build pipeline
# ---------------------------------------------------------------------------

def build(check_only: bool = False, local: bool = False) -> None:
    sites_doc = load_json("sites")
    team_doc = load_json("team")
    wps_doc = load_json("wps")
    funders_doc = load_json("funders")
    partners_doc = load_json("partners")
    news_doc = load_json("news")
    config_doc = load_json("site_config")

    validate_sites(sites_doc)
    print("[ok] sites schema validated.")
    if check_only:
        print("[check] no files written.")
        return

    env = make_env()
    project = config_doc["project"]
    project["github"] = config_doc["contact"]["github"]
    funders = funders_doc["funders"]
    last_updated = dt.date.today().isoformat()
    if local:
        base_path = ""
        print("[build] --local mode: base_path overridden to '' for http://localhost:8000/en/ preview")
    else:
        base_path = config_doc["deploy"].get("base_path", "").rstrip("/")
        if base_path and not base_path.startswith("/"):
            base_path = "/" + base_path
        print(f"[build] base_path = {base_path!r}")

    for lang in LANGS:
        print(f"[build] rendering /{lang}/ ...")
        # site URL helpers re-derived per page

        # 1) Homepage
        render_page(env,
            lang=lang, page_key="home",
            body_template="page_home.html",
            body_ctx={"sites": sites_doc["sites"], "wps": wps_doc["wps"], "news": news_doc["entries"],
                      "config": config_doc, "lang": lang, "alt_path": "index.html"},
            out_path=ROOT / lang / "index.html",
            page_title=project["tagline_" + lang],
            page_description=project["summary_" + lang][:180], needs_leaflet=True,
            project=project, funders=funders, last_updated=last_updated, base_path=base_path)

        # 2) Sites overview
        render_page(env,
            lang=lang, page_key="sites",
            body_template="page_sites_index.html",
            body_ctx={"sites": sites_doc["sites"], "config": config_doc, "lang": lang, "alt_path": "sites/"},
            out_path=ROOT / lang / "sites" / "index.html",
            page_title=("Case sites" if lang == "en" else "Sítios de estudo"),
            page_description=("Four urban communities across Brazil and the Netherlands." if lang == "en"
                              else "Quatro comunidades urbanas no Brasil e nos Países Baixos."), needs_leaflet=True,
            project=project, funders=funders, last_updated=last_updated, base_path=base_path)

        # 3) Each site detail page
        for site in sites_doc["sites"]:
            render_page(env,
                lang=lang, page_key="sites",
                body_template="page_site_detail.html",
                body_ctx={"site": site, "wps": wps_doc["wps"], "config": config_doc, "lang": lang,
                          "alt_path": f"sites/{site['id']}.html"},
                out_path=ROOT / lang / "sites" / f"{site['id']}.html",
                page_title=site["name_" + lang],
                page_description=site["tagline_" + lang], needs_leaflet=True,
                project=project, funders=funders, last_updated=last_updated, base_path=base_path)

        # 4) Team
        render_page(env,
            lang=lang, page_key="team",
            body_template="page_team.html",
            body_ctx={"members": team_doc["members"], "config": config_doc, "lang": lang, "alt_path": "team.html"},
            out_path=ROOT / lang / "team.html",
            page_title=("Team" if lang == "en" else "Equipe"),
            page_description=("Consortium PIs, co-applicants, partners and project staff." if lang == "en"
                              else "PIs do consórcio, co-proponentes, parceiros e equipe do projeto."), project=project, funders=funders, last_updated=last_updated, base_path=base_path)

        # 5) Work packages overview + detail
        render_page(env,
            lang=lang, page_key="wp",
            body_template="page_wps_index.html",
            body_ctx={"wps": wps_doc["wps"], "config": config_doc, "lang": lang, "alt_path": "work-packages/"},
            out_path=ROOT / lang / "work-packages" / "index.html",
            page_title=("Work packages" if lang == "en" else "Pacotes de trabalho"),
            page_description=("Five work packages across governance, modelling, health, citizen science, and policy." if lang == "en"
                              else "Cinco pacotes de trabalho: governança, modelagem, saúde, ciência cidadã e políticas."), project=project, funders=funders, last_updated=last_updated, base_path=base_path)

        for wp in wps_doc["wps"]:
            render_page(env,
                lang=lang, page_key="wp",
                body_template="page_wp_detail.html",
                body_ctx={"wp": wp, "team": team_doc["members"], "config": config_doc, "lang": lang,
                          "alt_path": f"work-packages/{wp['id']}.html"},
                out_path=ROOT / lang / "work-packages" / f"{wp['id']}.html",
                page_title=f"WP{wp['number']} — " + wp["title_" + lang],
                page_description=wp["summary_" + lang][:180], project=project, funders=funders, last_updated=last_updated, base_path=base_path)

        # 6) About hub + 6 sub-pages
        render_page(env,
            lang=lang, page_key="about",
            body_template="page_about_index.html",
            body_ctx={"config": config_doc, "lang": lang, "alt_path": "about/"},
            out_path=ROOT / lang / "about" / "index.html",
            page_title=("About REACH Nexus" if lang == "en" else "Sobre o REACH Nexus"),
            page_description=("Governance, ethics, data, AI, safeguarding and archival commitments." if lang == "en"
                              else "Governança, ética, dados, IA, salvaguarda e compromissos de arquivamento."), project=project, funders=funders, last_updated=last_updated, base_path=base_path)

        about_pages = [
            ("governance", "Governance",        "Governança"),
            ("ethics",     "Ethics",            "Ética"),
            ("data",       "Data & FAIR",       "Dados & FAIR"),
            ("ai-use",     "AI use",            "Uso de IA"),
            ("safeguarding","Safeguarding",     "Salvaguarda"),
            ("archival",   "Archival plan",     "Plano de arquivamento"),
        ]
        for slug, title_en, title_pt in about_pages:
            render_page(env,
                lang=lang, page_key="about",
                body_template=f"page_about_{slug.replace('-', '_')}.html",
                body_ctx={"config": config_doc, "lang": lang, "alt_path": f"about/{slug}.html"},
                out_path=ROOT / lang / "about" / f"{slug}.html",
                page_title=(title_en if lang == "en" else title_pt),
                page_description=(title_en if lang == "en" else title_pt), project=project, funders=funders, last_updated=last_updated, base_path=base_path)

        # 7b) Data sources dashboard
        render_page(env,
            lang=lang, page_key="data",
            body_template="page_data.html",
            body_ctx={"config": config_doc, "lang": lang, "alt_path": "data.html"},
            out_path=ROOT / lang / "data.html",
            page_title=("Data sources" if lang == "en" else "Fontes de dados"),
            page_description=("Curated catalogue of openly accessible environmental and health datasets for São Paulo and the Netherlands." if lang == "en"
                              else "Catálogo curado de conjuntos de dados ambientais e de saúde de acesso aberto para São Paulo e os Países Baixos."),
            needs_dashboard=True,
            project=project, funders=funders, last_updated=last_updated, base_path=base_path)

        # 8) Outputs
        render_page(env,
            lang=lang, page_key="about",
            body_template="page_outputs.html",
            body_ctx={"config": config_doc, "lang": lang, "alt_path": "outputs.html"},
            out_path=ROOT / lang / "outputs.html",
            page_title=("Outputs" if lang == "en" else "Produtos"),
            page_description=("Publications, datasets, policy briefs and theses." if lang == "en"
                              else "Publicações, conjuntos de dados, sínteses de política e teses."), project=project, funders=funders, last_updated=last_updated, base_path=base_path)

        # 9) Vacancies
        render_page(env,
            lang=lang, page_key="about",
            body_template="page_vacancies.html",
            body_ctx={"config": config_doc, "lang": lang, "alt_path": "vacancies.html"},
            out_path=ROOT / lang / "vacancies.html",
            page_title=("Vacancies" if lang == "en" else "Vagas"),
            page_description=("PhD and postdoc openings for the project." if lang == "en"
                              else "Vagas de doutorado e pós-doutorado do projeto."), project=project, funders=funders, last_updated=last_updated, base_path=base_path)

        # 10) News / project log
        render_page(env,
            lang=lang, page_key="news",
            body_template="page_news.html",
            body_ctx={"news": news_doc["entries"], "config": config_doc, "lang": lang, "alt_path": "news.html"},
            out_path=ROOT / lang / "news.html",
            page_title=("Project log" if lang == "en" else "Diário do projeto"),
            page_description=("Dated updates from the consortium." if lang == "en"
                              else "Atualizações datadas do consórcio."), project=project, funders=funders, last_updated=last_updated, base_path=base_path)

        # 11) Funding
        render_page(env,
            lang=lang, page_key="about",
            body_template="page_funding.html",
            body_ctx={"funders": funders, "partners": partners_doc["partners"], "config": config_doc, "lang": lang,
                      "alt_path": "funding.html"},
            out_path=ROOT / lang / "funding.html",
            page_title=("Funding" if lang == "en" else "Financiamento"),
            page_description=("Funders, grant numbers, and acknowledgement strings." if lang == "en"
                              else "Financiadores, números de auxílio e textos de agradecimento."), project=project, funders=funders, last_updated=last_updated, base_path=base_path)

        # 12) Contact
        render_page(env,
            lang=lang, page_key="about",
            body_template="page_contact.html",
            body_ctx={"config": config_doc, "lang": lang, "alt_path": "contact.html"},
            out_path=ROOT / lang / "contact.html",
            page_title=("Contact" if lang == "en" else "Contato"),
            page_description=("How to reach the consortium." if lang == "en" else "Como entrar em contato com o consórcio."), project=project, funders=funders, last_updated=last_updated, base_path=base_path)

        # 13) Accessibility
        render_page(env,
            lang=lang, page_key="about",
            body_template="page_accessibility.html",
            body_ctx={"config": config_doc, "lang": lang, "alt_path": "accessibility.html"},
            out_path=ROOT / lang / "accessibility.html",
            page_title=("Accessibility" if lang == "en" else "Acessibilidade"),
            page_description=("WCAG 2.2 AA commitment and how to flag issues." if lang == "en"
                              else "Compromisso com WCAG 2.2 AA e como reportar problemas."), project=project, funders=funders, last_updated=last_updated, base_path=base_path)

    # Root-level redirect to /en/
    en_url = f"{base_path}/en/"
    pt_url = f"{base_path}/pt/"
    (ROOT / "index.html").write_text(
        f'<!doctype html><html lang="en"><head><meta charset="utf-8">'
        f'<title>REACH Nexus</title>'
        f'<meta http-equiv="refresh" content="0; url={en_url}">'
        f'<link rel="canonical" href="{en_url}">'
        f'</head><body><p>Redirecting to <a href="{en_url}">REACH Nexus</a> '
        f'(<a href="{pt_url}">português</a>).</p></body></html>\n',
        encoding="utf-8")
    print("  → index.html (root redirect)")

    # 404 (rendered with base_path so its links work)
    (ROOT / "404.html").write_text(
        env.get_template("page_404.html").render(base_path=base_path),
        encoding="utf-8")
    print("  → 404.html")

    # sitemap.xml
    write_sitemap(config_doc, base_path)
    print("  → sitemap.xml")

    # .nojekyll
    (ROOT / ".nojekyll").touch()
    print("[done] build complete.")


def write_sitemap(config: dict[str, Any], base_path: str = "") -> None:
    base = config["deploy"]["canonical_base"] + base_path
    today = dt.date.today().isoformat()
    urls = []
    for lang in LANGS:
        for path in (
            "", "sites/", "team.html", "work-packages/",
            "about/", "about/governance.html", "about/ethics.html", "about/data.html",
            "about/ai-use.html", "about/safeguarding.html", "about/archival.html",
            "data.html", "outputs.html", "vacancies.html", "news.html",
            "funding.html", "contact.html", "accessibility.html",
        ):
            urls.append(f"{base}/{lang}/{path}")
        for site_id in ("jardim-pantanal", "parque-das-tribos", "nelson-mandelapark", "ede"):
            urls.append(f"{base}/{lang}/sites/{site_id}.html")
        for wp_id in ("wp1", "wp2", "wp3", "wp4", "wp5"):
            urls.append(f"{base}/{lang}/work-packages/{wp_id}.html")
    body = ['<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        body.append(f"  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>")
    body.append("</urlset>")
    (ROOT / "sitemap.xml").write_text("\n".join(body) + "\n", encoding="utf-8")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="validate JSON schemas without writing.")
    parser.add_argument("--local", action="store_true",
        help="build with base_path='' for local file:// or http://localhost:8000/ preview. "
             "Do not commit the output of a --local build; rebuild without --local before pushing.")
    args = parser.parse_args()
    build(check_only=args.check, local=args.local)
