# Updating the portfolio

Edit portfolio text, artwork, and image paths in [`content.json`](./content.json). Each translated field keeps English and Greek together, and each artwork has one shared image path. The portfolio remains static and has no build step.

## Open the site locally

Browsers block websites opened directly from a `file://` address from loading a separate JSON file. Use the VS Code Live Server extension to serve the project locally, then preview the portfolio at the URL it opens. The VS Code **Portfolio: Public site** launch profile opens the site at `http://127.0.0.1:5501/` when Live Server is running.

## Edit with Pages CMS

The repository includes a Pages CMS configuration in [`.pages.yml`](./.pages.yml). Commit and push that file to GitHub first so Pages CMS can read it. Then visit [Pages CMS](https://app.pagescms.org), sign in with GitHub, authorize its GitHub App for this repository, and open the repository. The configuration provides structured bilingual fields for the site content, exhibitions, and gallery, plus media fields for artwork images and the CV.

Pages CMS saves edits as changes to files in the GitHub repository. Review and publish those changes through the repository's normal workflow. Uploaded media is stored under `assets`; artwork uploads can be browsed from `assets/gallery`.

## Edit the JSON directly

Open [`content.json`](./content.json) in VS Code. Translated text sits side by side:

```json
"title": {
  "en": "Camera Incognita",
  "el": "Camera Incognita"
}
```

Artwork image paths are stored once, outside the language-specific fields:

```json
"image": "assets/gallery/camera-incognita/01.jpeg"
```

Years that are the same in both languages are stored once as a string, such as `"year": "2022"`. Use the `{ "en": "...", "el": "..." }` form only if the English and Greek year text needs to differ.

Gallery period dates are shared strings, such as `"date": "2023-2024"`.

Artwork image descriptions are generated from each artwork's title and medium/dimensions, so no separate image description field is needed.

Keep the JSON quotation marks, braces, and commas valid. JSON does not allow comments or trailing commas.

## Publish changes

Include the updated `content.json` and any new files in `assets` when publishing the static site.
