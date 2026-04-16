# Second Brain Chrome Extension

One-click capture for your existing Second Brain backend.

## Features

- Floating `Add to Brain` button on normal webpages
- Save current page directly from extension popup
- Auto-detect content type (`video`, `article`, `link`, `note`)
- Login using your existing Second Brain account
- Pick a default brain once, then save in a single click

## Load In Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder: `packages/extension`.

## First-Time Setup

1. Start your backend (`npm run dev` from repo root).
2. Open the extension popup.
3. Keep API Base URL as `http://localhost:5000/api` (or your deployed API).
4. Login with your app credentials.
5. Choose your default brain.

After that, click `Add to Brain` on any webpage.
