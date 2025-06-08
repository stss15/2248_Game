# Run and deploy your AI Studio app

This project can be hosted directly on GitHub Pages using the files in this
repository.  The `dist/` directory contains JavaScript compiled from the source
TypeScript so no build step is required when serving the site.

## Local development

If you want to modify the TypeScript sources you will need Node.js installed.

1. Install dependencies with `npm install`.
2. **Do not run `npm run build`**. Instead use `node compile_ts.cjs` whenever you
   modify the TypeScript sources to regenerate the contents of `dist/`.
3. Open `index.html` in your browser or push to GitHub Pages to view the app.

The hosted version simply serves `index.html` and the files under `dist/`.
