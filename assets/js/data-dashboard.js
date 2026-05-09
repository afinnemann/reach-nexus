/* REACH Nexus — data-dashboard.js
 *
 * Renders the curated environmental + health dataset cards on the Data page.
 * Source of truth lives in brazil_nl_env_data/registry/cards.yaml; that
 * registry is compiled by scripts/compile_registry.R into the MERIAN_DATA
 * payload below. To update the cards, regenerate from the registry repo and
 * paste the new payload between the START / END markers.
 *
 * The script is opt-in: it only runs if it finds an element with
 * id="dashboard-cards" on the page. */

(function () {
  "use strict";

  const ACCESS_LABEL = {
    http_direct: "open",
    api_token: "API key",
    registration_required: "registration",
    cds: "Copernicus CDS",
    package: "R package",
    request_form: "form",
    restricted: "restricted",
  };
  const ACCESS_CHIP = {
    http_direct: "chip-access-open",
    api_token: "chip-access-auth",
    registration_required: "chip-access-auth",
    cds: "chip-access-auth",
    package: "chip-access-open",
    request_form: "chip-access-restricted",
    restricted: "chip-access-restricted",
  };

  // >>>MERIAN_DATA_START<<<
  window.MERIAN_DATA = {
    "generated_at": "2026-05-08T12:22:29+0000",
    "version": "0.1.0",
    "cards": [
      {
        "id": "clh-br-0001",
        "title": "CETESB QUALAR",
        "country": "BR",
        "domain": "pollution",
        "status": "stable",
        "purpose": "São Paulo state air-quality monitoring network, hourly station data.",
        "variables": ["PM2.5", "PM10", "NO2", "O3", "SO2", "CO"],
        "spatial_resolution": "station",
        "temporal_resolution": "hourly",
        "period": "2000-present",
        "extent": "São Paulo state (~70 stations)",
        "url": "https://qualar.cetesb.sp.gov.br",
        "doi": null,
        "licence_spdx": "LicenseRef-CETESB",
        "attribution_text": "CETESB. Sistema QUALAR. https://qualar.cetesb.sp.gov.br",
        "access_method": "registration_required",
        "auth_required": true,
        "auth_instructions": "Free account at qualar.cetesb.sp.gov.br; CSV export per station/pollutant. Station codes are listed on the CETESB station map: https://arcgis.cetesb.sp.gov.br/portal/apps/experiencebuilder/experience/?id=13582bb92885456fb9f10ee84ad1507e",
        "r_package": "qualR",
        "linkable_to": ["clh-br-0007"],
        "curated_by": "BR Generator agent (scheduled run, 2026-05-07)",
        "reviewed_by": "pending consortium consultation",
        "last_verified": "2026-05-07",
        "next_review_date": null,
        "snippet_r": "# CETESB QUALAR — São Paulo air-quality station data.\n# Requires a free account at qualar.cetesb.sp.gov.br; do not commit credentials.\nlibrary(qualR)\n\n# Pull PM2.5 from Pinheiros station (code 99) for January 2024.\npm25 <- cetesb_retrieve_param(\n  username   = Sys.getenv(\"QUALAR_USER\"),\n  password   = Sys.getenv(\"QUALAR_PASS\"),\n  parameters = \"MP2.5\",\n  aqs_code   = \"99\",\n  start_date = \"01/01/2024\",\n  end_date   = \"31/01/2024\"\n)\n\nhead(pm25)\n",
        "gotchas": "Free QUALAR account required; one parameter × station × time-window per call and the portal is rate-limited.",
        "expected_runtime": "5-30 s for one station-month"
      },
      {
        "id": "clh-br-0002",
        "title": "BR-DWGD (Xavier et al.)",
        "country": "BR",
        "domain": "heat",
        "purpose": "Gridded daily Brazilian temperature and precipitation, 0.1° (~10 km), 1961–present.",
        "variables": ["tmax", "tmin", "tmean", "precip"],
        "spatial_resolution": "0.1° (~10 km)",
        "temporal_resolution": "daily",
        "period": "1961-present",
        "extent": "All of Brazil",
        "url": "https://sites.google.com/site/alexandrecandidoxavierufes/brazilian-daily-weather-gridded-data",
        "doi": "10.1002/joc.7731",
        "licence_spdx": "CC-BY-4.0",
        "attribution_text": "Xavier et al. (2022) BR-DWGD. doi:10.1002/joc.7731",
        "access_method": "http_direct",
        "auth_required": false,
        "auth_instructions": null,
        "r_package": null,
        "linkable_to": ["clh-br-0007"],
        "curated_by": "BR Generator agent (scheduled run, 2026-05-07)",
        "reviewed_by": "pending consortium consultation",
        "last_verified": "2026-05-08",
        "next_review_date": null,
        "snippet_r": "# BR-DWGD — gridded daily T and precip for Brazil (Xavier et al. 2022).\n# Distributed as yearly NetCDFs per variable on the LAMPE/UFPE site.\nlibrary(httr2)\nlibrary(terra)\n\n# Replace with the current per-variable-per-year URL from sites.ufpe.br/lampe/br-dwgd/\nurl <- \"https://sites.ufpe.br/lampe/wp-content/uploads/sites/8/br-dwgd/tmax_2020.nc\"\nnc  <- tempfile(fileext = \".nc\")\nrequest(url) |> req_perform(path = nc)\n\n# Read tmax 2020 and crop to a São Paulo bbox; pull a single day (layer 1).\ntmax    <- terra::rast(nc)\ntmax_sp <- terra::crop(tmax[[1]], terra::ext(-53, -44, -25, -19))\n\nsummary(terra::values(tmax_sp))\n",
        "gotchas": "URLs change with each Zenodo / LAMPE release and downloads are per-variable-per-year, so a full national run is heavy.",
        "expected_runtime": "30-90 s to download one variable-year NetCDF on a typical home connection"
      },
      {
        "id": "clh-br-0003",
        "title": "CHIRPS rainfall",
        "country": "BR",
        "domain": "rain",
        "purpose": "Global daily ~5 km satellite + gauge precipitation; well-validated for South America.",
        "variables": ["precip"],
        "spatial_resolution": "0.05° (~5 km)",
        "temporal_resolution": "daily",
        "period": "1981-present",
        "extent": "Global land 50°S–50°N",
        "url": "https://www.chc.ucsb.edu/data/chirps",
        "doi": "10.1038/sdata.2015.66",
        "licence_spdx": "CC0-1.0",
        "attribution_text": "Funk et al. (2015) CHIRPS. doi:10.1038/sdata.2015.66",
        "access_method": "http_direct",
        "auth_required": false,
        "auth_instructions": null,
        "r_package": "chirps",
        "linkable_to": ["clh-br-0007"],
        "curated_by": "BR Generator agent (scheduled run, 2026-05-07)",
        "reviewed_by": "pending consortium consultation",
        "last_verified": "2026-05-07",
        "next_review_date": null,
        "snippet_r": "# CHIRPS — global ~5 km daily satellite + gauge precipitation.\n# The `chirps` package wraps the UCSB ClimateSERV API.\nlibrary(chirps)\n\n# Two points around São Paulo city; one week of daily rainfall (mm/day).\nsp_pts <- data.frame(\n  lon = c(-46.8, -46.4),\n  lat = c(-23.7, -23.4)\n)\nrain <- get_chirps(\n  object = sp_pts,\n  dates  = c(\"2024-01-01\", \"2024-01-07\"),\n  server = \"ClimateSERV\"\n)\n\nhead(rain)\n",
        "gotchas": "Values are mm/day; the ClimateSERV server throttles large requests, and the `object` argument expects an sf or data.frame with lon/lat columns.",
        "expected_runtime": "10-30 s for two points × one week via ClimateSERV"
      },
      {
        "id": "clh-br-0004",
        "title": "MMA Monitorar (federal AQ portal)",
        "country": "BR",
        "domain": "pollution",
        "purpose": "Federal Brazilian air-quality portal aggregating state-level monitoring networks into one map view.",
        "variables": ["PM2.5", "PM10", "NO2", "O3", "SO2", "CO"],
        "spatial_resolution": "station",
        "temporal_resolution": "hourly",
        "period": "2020-present (varies by state network)",
        "extent": "Brazilian states reporting to the federal aggregator",
        "url": "https://monitorar.mma.gov.br/mapa",
        "doi": null,
        "licence_spdx": "LicenseRef-MMA",
        "attribution_text": "Ministério do Meio Ambiente — Monitorar. https://monitorar.mma.gov.br",
        "access_method": "http_direct",
        "auth_required": false,
        "auth_instructions": null,
        "r_package": null,
        "linkable_to": ["clh-br-0007"],
        "curated_by": "Adam Finnemann (UvA), via Prof. Maria de Fátima Andrade (IAG/USP), 2026-05-07",
        "reviewed_by": "pending consortium consultation",
        "last_verified": "2026-05-08",
        "next_review_date": null,
        "snippet_r": "# MMA Monitorar — federal Brazilian air-quality aggregator.\n# The /mapa view is a Leaflet/ArcGIS app; the data API behind it is\n# not yet publicly documented, so this snippet only confirms the\n# portal is reachable. Inspect the network tab on a real visit to\n# find the station-data endpoint, then update this snippet.\nlibrary(httr2)\n\nresp <- request(\"https://monitorar.mma.gov.br/mapa\") |> req_perform()\nresp_status(resp)\n",
        "gotchas": "New federal portal; no stable public data API yet documented. Use this card as a discoverability link until the underlying endpoint is identified.",
        "expected_runtime": "1-3 s for a portal liveness check"
      },
      {
        "id": "clh-br-0005",
        "title": "Rio de Janeiro daily AQ bulletins",
        "country": "BR",
        "domain": "pollution",
        "purpose": "Daily air-quality bulletins published by the Rio de Janeiro prefecture for the city's monitoring stations.",
        "variables": ["PM10", "PM2.5", "NO2", "O3", "SO2", "CO"],
        "spatial_resolution": "Rio de Janeiro city (~10 stations)",
        "temporal_resolution": "daily",
        "period": "2010-present",
        "extent": "City of Rio de Janeiro",
        "url": "https://ambienteclima.prefeitura.rio/monitoramento-diario-da-qualidade-do-ar/boletins-diarios-2026/",
        "doi": null,
        "licence_spdx": "LicenseRef-RioPrefecture",
        "attribution_text": "Prefeitura do Rio de Janeiro — Secretaria Municipal de Meio Ambiente e Clima. Boletins diários da qualidade do ar.",
        "access_method": "http_direct",
        "auth_required": false,
        "auth_instructions": null,
        "r_package": null,
        "linkable_to": ["clh-br-0007"],
        "curated_by": "Adam Finnemann (UvA), via Prof. Maria de Fátima Andrade (IAG/USP), 2026-05-07",
        "reviewed_by": "pending consortium consultation",
        "last_verified": "2026-05-08",
        "next_review_date": null,
        "snippet_r": "# Rio de Janeiro daily AQ bulletins — issued as PDFs on the prefecture's\n# site. This snippet scrapes the bulletin index page and lists the\n# available PDF links for the current year.\nlibrary(rvest)\n\nurl  <- \"https://ambienteclima.prefeitura.rio/monitoramento-diario-da-qualidade-do-ar/boletins-diarios-2026/\"\npdfs <- read_html(url) |>\n  html_elements(\"a[href$='.pdf']\") |>\n  html_attr(\"href\")\n\nhead(pdfs)\n",
        "gotchas": "Bulletins are PDFs intended for human reading; for raw numerical data check the prefecture's downloadable spreadsheets linked from the same site.",
        "expected_runtime": "2-5 s to fetch and parse the bulletin index"
      },
      {
        "id": "clh-br-0006",
        "title": "INMET historical meteorology",
        "country": "BR",
        "domain": "heat",
        "purpose": "National Institute of Meteorology archive — hourly station temperature, precipitation, humidity, wind, pressure.",
        "variables": ["tmax", "tmin", "tmean", "precip", "humidity", "wind", "pressure"],
        "spatial_resolution": "station (~600 automated stations)",
        "temporal_resolution": "hourly (daily aggregates also available)",
        "period": "2000-present (varies by station)",
        "extent": "All Brazilian states",
        "url": "https://portal.inmet.gov.br/dadoshistoricos",
        "doi": null,
        "licence_spdx": "LicenseRef-INMET",
        "attribution_text": "INMET — Instituto Nacional de Meteorologia. Banco de Dados Meteorológicos.",
        "access_method": "http_direct",
        "auth_required": false,
        "auth_instructions": null,
        "r_package": null,
        "linkable_to": ["clh-br-0007"],
        "curated_by": "Adam Finnemann (UvA), via Prof. Maria de Fátima Andrade (IAG/USP), 2026-05-07",
        "reviewed_by": "pending consortium consultation",
        "last_verified": "2026-05-08",
        "next_review_date": null,
        "snippet_r": "# INMET historical meteorology — distributed as one ZIP per year\n# containing one CSV per station. Replace the year with the latest\n# available on portal.inmet.gov.br/dadoshistoricos.\nlibrary(httr2)\n\nurl <- \"https://portal.inmet.gov.br/uploads/dadoshistoricos/2024.zip\"\nzip <- tempfile(fileext = \".zip\")\nrequest(url) |> req_perform(path = zip)\n\n# List a few station CSVs to confirm the download.\nfiles <- unzip(zip, list = TRUE)\nhead(files)\n",
        "gotchas": "Year-zips are large (hundreds of MB). Each CSV uses ';' separators, decimal comma, and an 8-line header that must be skipped before parsing.",
        "expected_runtime": "30-90 s per year-zip on a typical home connection"
      },
      {
        "id": "clh-br-0007",
        "title": "DATASUS SIH (hospital admissions)",
        "country": "BR",
        "domain": "health",
        "purpose": "Brazilian public-system hospital admissions (AIH) by ICD-10 chapter, municipality, month.",
        "variables": ["n_admissions", "n_deaths_in_hospital", "length_of_stay"],
        "spatial_resolution": "municipality",
        "temporal_resolution": "monthly",
        "period": "1992-present",
        "extent": "All Brazil (SUS network)",
        "url": "https://datasus.saude.gov.br/transferencia-de-arquivos/",
        "doi": null,
        "licence_spdx": "LicenseRef-DATASUS",
        "attribution_text": "Ministério da Saúde / DATASUS — SIH/SUS",
        "access_method": "http_direct",
        "auth_required": false,
        "auth_instructions": null,
        "r_package": "microdatasus",
        "linkable_to": ["clh-br-0001", "clh-br-0002", "clh-br-0003", "clh-br-0004", "clh-br-0005", "clh-br-0006"],
        "curated_by": "BR Generator agent (scheduled run, 2026-05-07)",
        "reviewed_by": "pending consortium consultation",
        "last_verified": "2026-05-07",
        "next_review_date": null,
        "snippet_r": "# DATASUS SIH — Brazilian SUS hospital admissions (AIH-RD).\n# `microdatasus` downloads the DBC files and parses them into a tibble.\nlibrary(microdatasus)\nlibrary(dplyr)\n\n# Fetch São Paulo (SP), January 2024 reduced AIH file.\nsih_sp <- fetch_datasus(\n  year_start  = 2024, year_end  = 2024,\n  month_start = 1,    month_end = 1,\n  uf          = \"SP\",\n  information_system = \"SIH-RD\"\n) |> process_sih()\n\n# Count admissions by ICD-10 letter root (rough chapter proxy).\nsih_sp |>\n  dplyr::group_by(icd_letter = substr(DIAG_PRINC, 1, 1)) |>\n  dplyr::summarise(n_admissions = dplyr::n()) |>\n  head()\n",
        "gotchas": "Public AIH-RD is anonymised but still record-level; ICD-10 chapter assignment needs a proper crosswalk (here we use the first letter as a quick proxy only).",
        "expected_runtime": "1-3 min per state-month for SIH-RD download + parse"
      },
      {
        "id": "clh-nl-0001",
        "title": "RIVM Luchtmeetnet",
        "country": "NL",
        "domain": "pollution",
        "purpose": "Dutch national air-quality monitoring network, real-time + historical, open API.",
        "variables": ["PM2.5", "PM10", "NO2", "O3", "SO2", "CO", "BC"],
        "spatial_resolution": "station",
        "temporal_resolution": "hourly",
        "period": "2013-present",
        "extent": "Netherlands (~80 stations)",
        "url": "https://www.luchtmeetnet.nl/informatie/download-data/open-data",
        "doi": null,
        "licence_spdx": "CC-BY-4.0",
        "attribution_text": "RIVM. Luchtmeetnet open data. https://www.luchtmeetnet.nl",
        "access_method": "http_direct",
        "auth_required": false,
        "auth_instructions": null,
        "r_package": null,
        "linkable_to": ["clh-nl-0007"],
        "curated_by": "NL Generator agent (scheduled run, 2026-05-07)",
        "reviewed_by": "pending consortium consultation",
        "last_verified": "2026-05-08",
        "next_review_date": null,
        "snippet_r": "# RIVM Luchtmeetnet — Dutch national air-quality network, open REST API.\n# Station codes are strings like \"NL49017\"; no API key required.\nlibrary(httr2)\nlibrary(dplyr)\n\n# Fetch hourly NO2 for Amsterdam-Vondelpark (NL49017), 15 Jan 2024.\nresp <- request(\"https://api.luchtmeetnet.nl/open_api/measurements\") |>\n  req_url_query(\n    station_number = \"NL49017\",\n    formula        = \"NO2\",\n    start          = \"2024-01-15T00:00:00\",\n    end            = \"2024-01-15T23:59:59\",\n    page           = 1\n  ) |>\n  req_perform() |>\n  resp_body_json()\n\n# resp$data is a list of hourly records; bind into a tidy tibble.\nmeas <- dplyr::bind_rows(resp$data)\nhead(meas)\n",
        "gotchas": "Default page size is 100 records — add pagination if requesting multi-day windows; station codes are zero-padded strings (e.g. 'NL49017'), not integers.",
        "expected_runtime": "3-8 s for one station-day"
      },
      {
        "id": "clh-nl-0002",
        "title": "KNMI station data (Daggegevens)",
        "country": "NL",
        "domain": "heat",
        "purpose": "KNMI official meteorological station records, daily, automated stations across the Netherlands.",
        "variables": ["tmax", "tmin", "tmean", "precip", "humidity", "wind"],
        "spatial_resolution": "station",
        "temporal_resolution": "daily (hourly available separately)",
        "period": "1901-present (varies by station)",
        "extent": "Netherlands (~50 active stations)",
        "url": "https://www.knmi.nl/nederland-nu/klimatologie/daggegevens",
        "doi": null,
        "licence_spdx": "CC-BY-4.0",
        "attribution_text": "KNMI. Daggegevens van het weer in Nederland.",
        "access_method": "http_direct",
        "auth_required": false,
        "auth_instructions": null,
        "r_package": null,
        "linkable_to": ["clh-nl-0007"],
        "curated_by": "NL Generator agent (scheduled run, 2026-05-07)",
        "reviewed_by": "pending consortium consultation",
        "last_verified": "2026-05-07",
        "next_review_date": null,
        "snippet_r": "# KNMI Daggegevens — official Dutch daily meteorology via POST request.\n# Station codes are 3-digit integers (260 = De Bilt); values in 0.1 units.\nlibrary(httr2)\n\nraw <- request(\"https://www.daggegevens.knmi.nl/klimatologie/daggegevens\") |>\n  req_method(\"POST\") |>\n  req_body_form(\n    stns = \"260\", vars = \"TG:TX:TN:RH\",\n    byear = \"2024\", bmonth = \"1\", bday = \"1\",\n    eyear = \"2024\", emonth = \"1\", eday = \"1\"\n  ) |>\n  req_perform() |>\n  resp_body_string()\n\n# Response has \"#\"-prefixed comment lines; last such line (STN,YYYYMMDD,...) holds column names.\nlines     <- strsplit(raw, \"\\n\")[[1]]\nhdr       <- sub(\"^# *\", \"\", grep(\"^# *STN,\", lines, value = TRUE)[1])\ncol_names <- trimws(strsplit(hdr, \",\")[[1]])\ndata_csv  <- paste(lines[!grepl(\"^#|^\\\\s*$\", lines)], collapse = \"\\n\")\ndf <- read.csv(text = data_csv, header = FALSE, col.names = col_names,\n               strip.white = TRUE)\n# Note: TG/TX/TN are in 0.1 °C; RH (precip sum) is in 0.1 mm.\nhead(df)\n",
        "gotchas": "All numeric values are in 0.1 units (°C, mm) — divide by 10 before analysis; station IDs are plain integers, not text codes.",
        "expected_runtime": "5-10 s for one station-month via POST"
      },
      {
        "id": "clh-nl-0007",
        "title": "CBS Doodsoorzakenstatistiek",
        "country": "NL",
        "domain": "health",
        "purpose": "Dutch national cause-of-death statistics, by ICD-10 cause, week or month, age, sex.",
        "variables": ["deaths_by_cause"],
        "spatial_resolution": "national / regional",
        "temporal_resolution": "weekly / monthly",
        "period": "1995-present",
        "extent": "Netherlands",
        "url": "https://www.cbs.nl/nl-nl/cijfers/detail/70895NED",
        "doi": null,
        "licence_spdx": "CC-BY-4.0",
        "attribution_text": "CBS. Doodsoorzaken; geslacht en leeftijd (StatLine, 70895NED). https://opendata.cbs.nl",
        "access_method": "http_direct",
        "auth_required": false,
        "auth_instructions": null,
        "r_package": "cbsodataR",
        "linkable_to": ["clh-nl-0001", "clh-nl-0002"],
        "curated_by": "NL Generator agent (scheduled run, 2026-05-07)",
        "reviewed_by": "pending consortium consultation",
        "last_verified": "2026-05-08",
        "next_review_date": null,
        "snippet_r": "# CBS Doodsoorzakenstatistiek — Dutch cause-of-death via cbsodataR.\n# Table 70895NED supersedes the older 7233. Verify with cbs_get_toc() if in doubt.\nlibrary(cbsodataR)\nlibrary(dplyr)\n\n# Optional discovery step: uncomment to confirm current table ID.\n# cbs_get_toc(Language = \"nl\") |> dplyr::filter(grepl(\"doodsoorzaak\", tolower(Title)))\n\n# Inspect metadata once to understand available filter codes and dimensions.\nmeta <- cbs_get_meta(\"70895NED\")\n\n# Fetch 2022 annual totals; annual periods contain \"JJ\" in their code.\ndeaths <- cbs_get_data(\n  \"70895NED\",\n  Perioden = has_substring(\"2022JJ\"),\n  select    = c(\"Perioden\", \"Geslacht\", \"DoodsoorzaakICDCode\", \"Overledenen_1\")\n)\n\n# T001038 = totaal geslacht (both sexes combined).\ndeaths |> dplyr::filter(Geslacht == \"T001038\") |> head()\n",
        "gotchas": "CBS suppresses counts below a confidentiality threshold (~5–10), so small-cause regional cells will be NA; old table 7233 is superseded — use 70895NED.",
        "expected_runtime": "10-25 s for one annual slice"
      }
    ]
  };
  // >>>MERIAN_DATA_END<<<

  let DATA = window.MERIAN_DATA;
  let activeCountry = "all";
  let activeDomain = "all";

  function asArray(v) {
    if (Array.isArray(v)) return v;
    if (v == null) return [];
    return [v];
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[ch]);
  }

  function cardHTML(c) {
    const accessClass = ACCESS_CHIP[c.access_method] || "chip-domain";
    const accessLabel = ACCESS_LABEL[c.access_method] || c.access_method;
    const flag = c.country === "BR" ? "🇧🇷 Brazil" :
                 c.country === "NL" ? "🇳🇱 Netherlands" : "Global";
    const snippet = (c.snippet_r || "").trim();
    const variables = asArray(c.variables);
    const linkableTo = asArray(c.linkable_to);
    const linkable = linkableTo.length
      ? `<dt>Joins to</dt><dd>${linkableTo.map(escapeHtml).join(", ")}</dd>` : "";
    return `
      <article class="dash-card" data-id="${escapeHtml(c.id)}">
        <div class="card-head">
          <h3>${escapeHtml(c.title)}</h3>
          <span class="card-id">${escapeHtml(c.id)}</span>
          <span class="chip chip-flag">${flag}</span>
          <span class="chip chip-domain">${escapeHtml(c.domain)}</span>
          <span class="chip ${accessClass}">${escapeHtml(accessLabel)}</span>
        </div>
        <p class="card-purpose">${escapeHtml(c.purpose)}</p>
        <dl class="card-meta">
          <dt>Variables</dt><dd>${variables.map(escapeHtml).join(", ")}</dd>
          <dt>Resolution</dt><dd>${escapeHtml(c.spatial_resolution)} · ${escapeHtml(c.temporal_resolution)}</dd>
          <dt>Period</dt><dd>${escapeHtml(c.period)}</dd>
          <dt>Licence</dt><dd>${escapeHtml(c.licence_spdx)}</dd>
        </dl>
        <div class="card-actions">
          <a class="dash-btn" href="${escapeHtml(c.url)}" target="_blank" rel="noopener">Source ↗</a>
          <button class="dash-btn dash-btn-secondary btn-toggle">Show details</button>
        </div>
        <div class="drawer">
          <h4>R snippet</h4>
          <pre>${escapeHtml(snippet || "# snippet pending — generator agent will fill")}</pre>
          ${c.gotchas ? `<h4>Gotchas</h4><p>${escapeHtml(c.gotchas)}</p>` : ""}
          <h4>Provenance</h4>
          <dl class="card-meta">
            <dt>Curated by</dt><dd>${escapeHtml(c.curated_by) || "—"}</dd>
            <dt>Reviewed by</dt><dd>${escapeHtml(c.reviewed_by) || "—"}</dd>
            <dt>Last verified</dt><dd>${escapeHtml(c.last_verified) || "—"}</dd>
            <dt>Attribution</dt><dd>${escapeHtml(c.attribution_text) || "—"}</dd>
            ${linkable}
          </dl>
        </div>
      </article>
    `;
  }

  function render() {
    const root = document.getElementById("dashboard-cards");
    if (!root) return;
    const cards = DATA.cards.filter(c =>
      (activeCountry === "all" || c.country === activeCountry) &&
      (activeDomain === "all" || c.domain === activeDomain)
    );
    if (!cards.length) {
      root.innerHTML = '<p style="color: var(--color-text-muted)">No cards match. Try clearing filters.</p>';
      return;
    }
    root.innerHTML = cards.map(cardHTML).join("");
    root.querySelectorAll(".btn-toggle").forEach(b => {
      b.addEventListener("click", () => {
        const drawer = b.parentElement.parentElement.querySelector(".drawer");
        drawer.classList.toggle("open");
        b.textContent = drawer.classList.contains("open") ? "Hide details" : "Show details";
      });
    });
  }

  function init() {
    const root = document.getElementById("dashboard-cards");
    if (!root || !DATA) return;
    const statCards = document.getElementById("stat-cards");
    const statUpdated = document.getElementById("stat-updated");
    if (statCards) statCards.textContent = DATA.cards.length;
    if (statUpdated) statUpdated.textContent = (DATA.generated_at || "").slice(0, 10);
    render();

    document.querySelectorAll(".country-btn").forEach(b => {
      b.addEventListener("click", () => {
        document.querySelectorAll(".country-btn").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        activeCountry = b.dataset.country;
        render();
      });
    });
    document.querySelectorAll(".filter-btn[data-domain]").forEach(b => {
      b.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn[data-domain]").forEach(x => x.classList.remove("active"));
        b.classList.add("active");
        activeDomain = b.dataset.domain;
        render();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
