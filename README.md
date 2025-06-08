# Run and deploy your AI Studio app

This project can be hosted directly on GitHub Pages using the files in this
repository.  The `dist/` directory contains JavaScript compiled from the source
TypeScript so no build step is required when serving the site.

## Local development

If you want to modify the TypeScript sources you will need Node.js installed.

1. Install dependencies with `npm install`.
2. After making changes run `node compile_ts.cjs` to update the files in
   `dist/`.
3. Open `index.html` in your browser or push to GitHub Pages to view the app.

The hosted version simply serves `index.html` and the files under `dist/`.
