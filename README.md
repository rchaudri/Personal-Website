# Rohan Chaudri — professional portfolio

A professional portfolio using deep teal, cool white, charcoal, and copper accents. Fraunces supplies the expressive headings; DM Sans supplies readable body text. The fonts are self-hosted with their SIL Open Font Licenses. No install or build is required.

## Preview

Open `index.html`, or serve the directory:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Visit http://127.0.0.1:8765/. Stop with Ctrl+C.

```sh
python3 scripts/check_site.py
```

## Presentation requirements

- The Senate certificate is a prominent homepage feature, accessible directly through the Recognition navigation item. Its title, date, signatory, and civic-program context are stated clearly. Both image and button open the original certificate.
- The bionic hand is the lead homepage feature and the first profile in the work index. The original handshake photograph leads. Pen, ball, and wristwatch views can be selected by touch, swipe, or keyboard and opened at full size. The hand description directly states that Rohan designed and built the project independently, including mechanical construction, electronics, and software. No redundant ownership or contribution label appears below it.
- Rohan’s name and current Texas Instruments role remain immediately visible. The Senate feature follows the career strip. The homepage education feature includes the Berkeley graduation portrait and commencement image. The graduation image retains its natural proportions and its cap, stole, seal, and hands.
- Use direct project and role descriptions. The rejected slogan has been removed from page copy, sharing artwork, and the identity reference.
- Body text is generally 18–20 pixels, with 17–18 pixel project descriptions. Navigation, roles, dates, and captions remain readable at phone sizes.
- Headings and the wordmark have no decorative periods. Page titles, sharing titles, and structured page names use a plain ASCII hyphen as their separator.
- Recommendations has a named homepage section directly after selected work, with exact excerpts from Chris Bush and Werner Fischer and links to their complete original texts. Recommendations is in the main navigation. The menu opens below 1001 pixels so the six destinations remain readable.
- King of Fremont appears only as one understated footer link on each page.
- Every professional work profile states the organization, exact role, dates, and contribution. Texas Instruments is current employment; SOMA, Marsh, and Trivium are previous roles.

## Photographs and sources

The six supplied original photographs are preserved byte-for-byte. `assets/asset-map.json` records their assignments and SHA-256 hashes. The existing hand photographs and Senate certificate remain at the root; web derivatives live in `assets/media/`.

The code-intelligence and document-tools profile uses quiet, naturally lit software-development photography by Emile Perron. The wildfire work uses an illustrative analytics report showing incident trends, regional comparisons, and a spatial overview. It uses the site’s teal, ivory, and copper palette and is explicitly labeled as sample data. The built-in image-generation tool created the report image; its prompt is saved in `assets/source/wildfire-analytics-prompt.txt`. The XML/code-tooling photograph remains unchanged. Source photographs live in `assets/source/`, with responsive WebP derivatives in `assets/media/`. The earlier glowing-file illustration, smoke satellite image, and forest context image are retired.

- [Emile Perron / Unsplash - software-development workspace](https://unsplash.com/photos/macbook-pro-showing-programming-language-xrVDYZRGdw4)
- Wildfire report artwork: `assets/source/wildfire-analytics-report.png`, with responsive WebP copies in `assets/media/`.

The portrait favicon uses the selected IMG_3231.jpg source, preserved as `assets/rohan-favicon-source.jpg`. Its crop is recorded in `assets/identity/portrait-crop.json`; all required PNG, ICO, Apple, and manifest sizes share that crop. The original colors and appearance are preserved.

## Structure and interactions

The existing public URLs are preserved. `projects.html` contains five distinct profiles: Texas Instruments, Marsh, SOMA, Trivium, and the independent bionic hand. The CFO and Wildfire pages are detailed subprojects within the Trivium role. Search, topic filters, a shareable query, and an empty-state reset support exploration. The slash key focuses work search.

Case studies have native section links and a sticky reading index. SOMA uses one editorial composition: a compact teal workflow rail beside three open dimension rows, with a simple stacked layout on phones. Every explanation is present directly in HTML and remains readable without JavaScript. Page-specific presentation lives in `assets/css/soma.css`. Image dialogs and the hand gallery support touch and keyboard use. Native image dialogs contain focus and restore it when closed. Content and navigation remain available without JavaScript. Reduced-motion preferences are respected.

The canonical homepage is the root URL. `CNAME`, the Google verification file, the existing Analytics property, and the stable `https://rohanchaudri.com/#person` identifier are preserved. The sitemap includes the case studies and excludes the duplicate `index.html` URL.

## Editorial record

The career and photograph source is the revised master brief inside `Rohan_Chaudri_Graduation_Codex_Package.zip`. The original earlier brief and ZIP are also preserved. The user’s later instructions override the brief’s original placement recommendations: the hand leads the homepage, recognition remains prominent, the reading scale is larger, and the creative identity is only a footer link.

SOMA uses the public period 2024–2026. The owner’s latest correction describes the meeting coach as an application integrating existing NLP and LLM capabilities, including GPT and Gemini. Its workflow runs from transcripts through conversation analysis to coaching feedback. Earlier brief references to a custom model or on-premises deployment are superseded. The Forum badge’s Founding Engineer title stays within the event feature; NASA Ames Research Center is the Forum venue, stated directly in the visible photograph captions on the homepage, work index, and SOMA case study. Trivium uses GPT-4 and Gemini, with prompt refinement. The 90% result concerns manual graph creation. CFO privacy wording remains brief. Both complete recommendations retain their original wording.

Georgia Tech completion details, exact Google credential wording, Mandarin proficiency, and detailed science-fair award labels remain unresolved. No current résumé was supplied, so no placeholder download is shown.

## Verification and deployment

The static checker covers local links, anchors, assets, structured data, metadata, source-image hashes, portrait icons, employer attribution, heading punctuation, footer-only creative links, prominent homepage Senate evidence, and removal of superseded placeholder graphics. Browser results are recorded in `design/verification.json`.

This revision is prepared for local review. No source push or live deployment has been performed.

The latest browser result is recorded in `design/verification.json`, with a current desktop screenshot in `design/homepage-preview.png`. The latest imagery and recommendations review is recorded in `design/polish-verification.json`.

The current browser report covers all 15 pages at five viewport widths, photo selection, keyboard operation, horizontal touch swipes, original-image viewing, the conceptual graph viewer, and the retained Senate certificate viewer.
