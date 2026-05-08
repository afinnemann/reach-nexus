/* REACH Nexus — map.js
 * Renders the four case-study sites on a Leaflet map.
 * Schema-aware: refuses to plot any site whose `coords.precision` field is missing.
 * Reads from the in-page JSON island (data-sites) so the same script works
 * on the homepage (all four) and on individual site pages (one marker, zoomed). */

(function () {
  "use strict";

  const VALID_PRECISIONS = ["city", "neighbourhood", "exact"];

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function readSites(rootEl) {
    const node = rootEl.querySelector('script[type="application/json"][data-sites]');
    if (!node) return [];
    try {
      return JSON.parse(node.textContent);
    } catch (e) {
      console.error("[map] failed to parse data-sites JSON", e);
      return [];
    }
  }

  function makeIcon() {
    const html = `<span style="
      display:block;
      width:22px;height:22px;border-radius:50%;
      background:#9e2a2b;
      border:3px solid #fafaf7;
      box-shadow:0 0 0 1px rgba(31,39,48,0.25), 0 2px 4px rgba(31,39,48,0.25);
    " aria-hidden="true"></span>`;
    return L.divIcon({
      html: html,
      className: "reach-marker",
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -10],
    });
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }

  function buildPopup(site, lang) {
    const name = escapeHtml(site["name_" + lang] || site.name_en);
    const city = escapeHtml(site["city_" + lang] || site.city_en);
    const country = site.country_flag || "";
    const tagline = escapeHtml(site["tagline_" + lang] || site.tagline_en || "");
    const precision = escapeHtml(site["precision_note_" + lang] || (site.coords && site.coords["precision_note_" + lang]) || "");
    const moreLabel = lang === "pt" ? "Saiba mais →" : "Read more →";
    const baseAttr = (document.documentElement.getAttribute("data-base") || "");
    const linkBase = baseAttr + (lang === "pt" ? "/pt/sites/" : "/en/sites/");
    const href = linkBase + encodeURIComponent(site.id) + ".html";
    return [
      '<div class="popup">',
      '<div class="popup__country">' + country + " " + city + "</div>",
      '<h3 class="popup__title">' + name + "</h3>",
      '<p class="popup__tagline">' + tagline + "</p>",
      '<p class="popup__precision"><small>' + precision + "</small></p>",
      '<p><a href="' + href + '">' + moreLabel + "</a></p>",
      "</div>",
    ].join("");
  }

  function init(container) {
    if (!container || typeof L === "undefined") return;
    const sites = readSites(container);
    if (!sites.length) return;

    // Refuse to plot any site without a valid precision field.
    const valid = sites.filter(function (s) {
      return s.coords &&
        typeof s.coords.lat === "number" &&
        typeof s.coords.lon === "number" &&
        VALID_PRECISIONS.indexOf(s.coords.precision) !== -1;
    });
    if (valid.length !== sites.length) {
      console.warn("[map] some sites omitted because coords.precision was missing or invalid.");
    }
    if (!valid.length) return;

    const lang = container.getAttribute("data-lang") || "en";
    const focusId = container.getAttribute("data-focus") || null;

    const mapEl = container.querySelector(".map");
    if (!mapEl) return;

    const map = L.map(mapEl, {
      scrollWheelZoom: false,
      worldCopyJump: true,
      zoomControl: true,
      attributionControl: true,
    });

    // CARTO Positron — neutral, light tile layer. Attribution required.
    L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 18,
    }).addTo(map);

    const bounds = [];
    valid.forEach(function (s) {
      const ll = [s.coords.lat, s.coords.lon];
      const m = L.marker(ll, { icon: makeIcon(), title: s["name_" + lang] || s.name_en });
      m.bindPopup(buildPopup(s, lang), { maxWidth: 320 });
      m.addTo(map);
      bounds.push(ll);
      if (focusId && s.id === focusId) {
        m.openPopup();
      }
    });

    if (focusId) {
      const focused = valid.find(function (s) { return s.id === focusId; });
      if (focused) {
        const zoom = focused.coords.precision === "exact" ? 14 :
                     focused.coords.precision === "neighbourhood" ? 11 : 10;
        map.setView([focused.coords.lat, focused.coords.lon], zoom);
      } else {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    } else {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const containers = document.querySelectorAll("[data-reach-map]");
    Array.prototype.forEach.call(containers, init);
  });
})();
