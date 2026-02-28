# Tamil Movies – Last 10 Days (Chrome Extension)

A Chrome extension that recommends **Tamil movies** released in the **last 10 days**, using **IMDb** only.

## How it works

- Builds IMDb’s advanced search URL for **Tamil** (primary language) **feature films** with **release date** in the last 10 days.
- Fetches that search page and parses the results so you can see titles, year, runtime, and rating in the popup.
- Each movie links to its **IMDb title page**.
- A **“View full results on IMDb”** link opens the full search on IMDb in a new tab.

No API key or account is required.

## Setup

1. Open Chrome and go to `chrome://extensions/`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select this folder (`chrome-extension`).
4. Click the extension icon to see Tamil movies from the last 10 days (from IMDb).

## Files

- `manifest.json` – Extension manifest (Manifest V3, host permission for imdb.com).
- `popup.html` / `popup.css` / `popup.js` – Popup UI and IMDb fetch/parse logic.
- `README.md` – This file.

## Optional: custom icons

To add your own icons, create an `icons` folder with `icon16.png`, `icon32.png`, and `icon48.png`, then add the `default_icon` and `icons` entries to `manifest.json`.
