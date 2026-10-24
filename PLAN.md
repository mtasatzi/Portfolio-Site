# Plan: Matina Portfolio Site

## Goal
Build a static, fast, bilingual (English/Greek) fine-arts portfolio site for Matina, a Fine Arts graduate working in painting and mixed media print making (conceptual style, Russian Avant Garde / Bauhaus influences).

## Aesthetic decisions (from your answers)
- **Color palette (exact):** #A6CBE5, #B49D8E, #DACCA3, #9BB7D1, #83A0BB, #566372, #1F2329, #050608
- **Typography:** Courier New (primary typeface)
- **Visual language:** Geometric, constructivist, Bauhaus/Russian Avant Garde — bold lines, strong composition; design takes influence from her art rather than blending into the background.
- **Content structure:** Chronological timeline gallery — each period = artworks + title + summary per section.
- **Sections:** Artist Statement / Bio, CV, Contact form, chronological gallery.
- **Languages:** English + Greek with a language toggle.
- **Delivery:** Static and fast (no build step, no heavy interactivity).
- **Branding:** Existing logo + cover artwork + CV (supplied as images) to be incorporated.

## Proposed file structure (single-page app, all static)
```
Matina-Portfolio-Site/
├── index.html              # single HTML page, all sections
├── css/
│   └── style.css           # palette, Courier New, geometric layout, responsive
├── js/
│   └── i18n.js             # EN/EL toggle + content strings (both languages)
├── assets/
│   ├── logo.svg            # (convert supplied logo image to SVG or keep as PNG)
│   ├── cover.jpg           # supplied cover artwork
│   └── cv.pdf              # supplied CV (link)
└── README.md
```

## Sections (chronological, scrollable single page)
1. Hero / intro with logo + name
2. About / Artist Statement (Bio)
3. Timeline gallery (periods with artworks, titles, summaries)
4. CV (summary + link to CV PDF)
5. Contact form

## Steps
1. Scaffold repo + files (HTML, CSS, JS, assets placeholders)
2. Implement EN/EL i18n toggle with all strings in both languages
3. Build geometric layout using the exact palette + Courier New
4. Build chronological timeline gallery component
5. Add CV section + contact form
6. Wire logo + cover + CV assets; make responsive
7. Review + polish (contrast, mobile, language toggle)

## What "done" looks like
- A single `index.html` you can open in any browser
- Language toggle switches all visible text between English and Greek
- Timeline gallery renders periods with artworks/titles/summaries
- Site uses the exact palette + Courier New + Bauhaus-inspired geometry
- Static, fast, no build step

---

Once you approve, I'll create the repo, scaffold the files, and build it.