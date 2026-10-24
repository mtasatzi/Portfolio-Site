# Updating the portfolio

Portfolio text and image choices are in `js/content.js`. You can edit this file in a text editor without changing the site's HTML, CSS, or behavior. The page still opens directly from `index.html`; there is no build step.

## Change text

1. Open `js/content.js` in a text editor.
2. Find the text you want under `translations`.
3. Change the value between the quotation marks, keeping the English (`en`) and Greek (`el`) versions together.
4. Save the file and reopen or refresh `index.html`.

For example, change `title: "Early studies"` to `title: "New title"` in the English gallery period, and change the matching Greek title in the `el` section too.

## Change an image

1. Copy the image into the `assets` folder. Use a short filename with no spaces, such as `ceramics-01.jpg`.
2. In `js/content.js`, find the matching `image` value and replace it with the path, for example `image: "assets/ceramics-01.jpg"`.
3. For the About picture, change `images.about`.
4. Update the artwork's `alt` text in both languages so it describes the image.

Keep the old image file until you have checked the page. Image paths are relative to the site folder, and spelling and letter case must match the filename.

## Add an artwork

In the correct period's `works` list, copy one complete artwork entry, including its opening and closing braces. Paste it next to the other entries, add a comma between entries, then replace its title, year, image path, and English and Greek alt text. Each artwork is displayed in the order it appears in this list.

## Add a period

Copy one complete period entry in `gallery.periods` in both `en` and `el`. Update the date, title, summary, and works in each copy. Keep the same period order in both languages.

## Save and check your changes

- Keep the quotation marks and commas around the values and entries. Do not change the braces or property names.
- Save `js/content.js`, then refresh the local `index.html` page. Use **Ctrl+F5** if the browser shows a cached image.
- Check the page in both languages and confirm that every image appears.
- To publish your changes, include `js/content.js` and any new files in `assets` when updating the website.
