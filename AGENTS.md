# Matina Portfolio Site

## Project context
Static, fast, bilingual (English/Greek) fine-arts portfolio site for Matina, a Fine Arts graduate working in painting and mixed media print making (conceptual style). Design takes influence from her art — Bauhaus / Russian Avant Garde inspired geometric composition.

## Aesthetic decisions (locked)
- **Palette (exact hex):** #A6CBE5, #B49D8E, #DACCA3, #9BB7D1, #83A0BB, #566372, #1F2329, #050608
- **Typography:** Courier New (primary typeface)
- **Visual language:** Geometric, constructivist, bold lines; design influenced by her art, not a neutral background
- **Structure:** Single-page chronological timeline gallery (periods → artworks + title + summary), plus Artist Statement/Bio, CV, Contact form
- **Languages:** English + Greek with an i18n toggle
- **Delivery:** Static HTML/CSS/JS, no build step, no heavy interactivity

## File structure
```
Matina-Portfolio-Site/
├── index.html              # single HTML page, all sections
├── css/style.css           # palette, Courier New, geometric layout, responsive
├── content.json            # editable bilingual content; artwork image paths appear once
├── .pages.yml              # Pages CMS content and media configuration
├── js/i18n.js              # language toggle and content rendering
├── .vscode/
│   └── launch.json          # F5 profile for local site preview
├── assets/
│   ├── logo.*              # supplied logo image
│   ├── cover.jpg           # supplied cover artwork
│   └── cv.pdf              # supplied CV (link)
├── CONTENT-GUIDE.md        # how to update texts and images
├── PLAN.md                 # implementation plan
└── AGENTS.md               # this file
```

## Sections (scrollable single page)
1. Hero / intro with logo + name
2. About / Artist Statement (Bio)
3. Timeline gallery (periods with artworks, titles, summaries)
4. CV (summary + link to CV PDF)
5. Contact form

## How to work on this (for any session)
- Edit content in Pages CMS or update `content.json` directly; see `CONTENT-GUIDE.md`. Use VS Code Live Server to preview the site locally; no build step is required.
- Keep the exact hex palette; do not substitute colors.
- Keep Courier New as the primary typeface.
- Keep each translated field together as `{ "en": "...", "el": "..." }` in `content.json`; store each shared artwork image path only once.
- All user-facing portfolio text must be bilingual (EN/EL), stored in `content.json`, and shown through the language toggle.
- When adding new sections, add them chronologically and keep the Bauhaus-inspired geometry consistent.
- Commit messages end with: `Co-Authored-By: Claude Code <noreply@anthropic.com>`

## Supplied brand assets (reference, do not modify)
- Logo (geometric B&W line mark, stylized "M")
- Cover (blue ground, yellow/gold geometric lines, building/spire motif)
- CV (Greek, geometric black/blue design)
