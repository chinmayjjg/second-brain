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

1. Open the extension popup.
2. Login with your app credentials.
3. Choose your default brain.

After that, click `Add to Brain` on any webpage.

## Chrome Web Store

For end users, the recommended install path is the Chrome Web Store.

1. Add extension icons and reference them in `manifest.json`.
2. Zip the contents of `packages/extension`.
3. Upload the package in the Chrome Web Store Developer Dashboard.
4. Publish the listing and copy the final store URL.
5. Set `VITE_EXTENSION_STORE_URL` in the client app to that listing URL so the app's install button opens the store page directly.
