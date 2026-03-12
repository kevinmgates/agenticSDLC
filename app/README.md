# SDLC Stage Visualizer

A local web app that reads the repository's `stages/` folder and presents the transcript, requirements, epics, features, user stories, and specs in horizontally scrollable Finder-style columns.

## Run locally

```bash
cd app
npm install
npm run dev
```

Then open `http://localhost:4173`.

## What it reads

- `../stages/01-transcript/meeting-transcript.md`
- `../stages/02-requirements/requirements.md`
- `../stages/03-backlog/epics.json`
- `../stages/03-backlog/features.json`
- `../stages/03-backlog/user-stories.json`
- `../stages/03-backlog/specs/*.md`

Use the **Refresh data** button after regenerating stage outputs.
