# Zoologist Academy

Interactive kid-friendly zoology game built with React + Vite.

## Current Audio Setup

- Audio is pre-generated and embedded as static `.wav` files.
- Files live in `public/audio/` and are served from `/audio/...`.
- No runtime TTS generation is used.
- No Gemini API key is required.

## Run Locally

Prerequisites:
- Node.js

Commands:
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:3000`

## Build

1. `npm run build`
2. Build output is written to `dist/`

## Deploy Options

### Option 1: Node/Express Hosting

Deploy the project and run:
- `npm install`
- `npm run build`
- `npm start`

### Option 2: GitHub Pages (Static Hosting)

This repo includes a Pages workflow at:
- `.github/workflows/deploy-pages.yml`

Setup:
1. Push to `main`.
2. In GitHub repo settings, set Pages source to `GitHub Actions`.
3. Workflow builds and deploys `dist/` automatically.
4. Open the project URL: `https://<your-github-username>.github.io/zoologist-academy/`

If you see a 404:
- Confirm Pages is configured to `GitHub Actions` (not `Deploy from a branch`).
- Confirm the deploy workflow completed successfully in the `Actions` tab.
- Use the project URL with the repo name suffix (for this repo, `/zoologist-academy/`).

## Important Notes

- Keep `public/audio/*.wav` in the repository, since playback depends on them.
- If audio files are missing, playback buttons will fail because there is no speech-synthesis fallback.
