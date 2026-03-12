# Scopilot

A local web app that reads the repository's `stages/` folder and presents the transcript, requirements, epics, features, user stories, and specs in horizontally scrollable Finder-style columns.

## Run locally

```bash
cd app
npm install
npm run dev
```

Then open `http://localhost:4173`.

## Build a static version

```bash
cd app
npm install
npm run build:static
```

This generates a GitHub Pages-friendly static export in `app/static/`.

What the static build does:

- copies the existing UI assets from `app/public/`
- generates `app/static/data/stages.json` from the repo's current `stages/` and `prompts/` files
- writes a static `index.html`, `404.html`, and `.nojekyll`

You can publish the contents of `app/static/` to GitHub Pages or any static host.

## What it reads

- `../stages/01-transcript/meeting-transcript.md`
- `../stages/02-requirements/requirements.md`
- `../stages/03-backlog/epics.json`
- `../stages/03-backlog/features.json`
- `../stages/03-backlog/user-stories.json`
- `../stages/03-backlog/specs/*.md`

Use the **Refresh data** button after regenerating stage outputs.

For the static export, rerun `npm run build:static` whenever the stage files change.
