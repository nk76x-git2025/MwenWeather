# MwenWeather

MwenWeather is a personal, local-first weather memory journal. The core loop is:

```text
current weather → personal outfit/feeling log → history → explainable recommendation
```

This MVP is a frontend-only Vite + React + TypeScript app with Tailwind CSS, a conservative PWA baseline, mock current weather, local IndexedDB logs, and JSON export/import.

## What is included

- Mobile-first, dark-mode-first app shell.
- Current weather screen backed by a mock provider that is easy to replace later.
- New outfit/weather memory form that stores a permanent weather snapshot inside each log.
- Local IndexedDB storage in the browser; no backend, login, cloud sync, or database server.
- History screen for saved logs.
- Simple explainable recommendation screen using past logs as evidence.
- Settings/data screen with JSON export and import.
- PWA manifest named `MwenWeather` with standalone display.
- Conservative service worker that caches only the initial app shell assets.
- Node acceptance tests for the manifest and service worker behavior.

## Data safety

Logs are stored only in the current browser profile's IndexedDB. Export a JSON backup before clearing browser data, changing devices, or testing import. Import replaces local logs with the selected backup file.

## Weather provider

The first version intentionally uses mock weather data and commits no API keys. A future browser-safe provider can be selected with environment configuration. Copy `.env.example` to `.env.local` only when a real provider is added, and never commit real keys.

## Development commands

```bash
npm install
npm run dev
npm run dev -- --host 0.0.0.0
npm test
npm run build
```

## Raspberry Pi testing guide

From the Raspberry Pi, clone or open the repository and run:

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Find the Pi's local IP address:

```bash
hostname -I
```

From your computer or phone on the same Wi-Fi network, open:

```text
http://<raspberry-pi-ip>:5173/
```

For example, if `hostname -I` shows `192.168.1.42`, open:

```text
http://192.168.1.42:5173/
```

### Confirm the manifest

1. Open the app in Chrome or Edge.
2. Open DevTools → Application → Manifest.
3. Confirm the app name is `MwenWeather`.
4. Confirm display mode is `standalone`.
5. Confirm the icon entry loads from `/icons/icon.svg`.

You can also open this URL directly:

```text
http://<raspberry-pi-ip>:5173/manifest.webmanifest
```

### Test saving a log

1. Open the Weather tab.
2. Tap **Log what this feels like**.
3. Fill in what you wore, how it felt, comfort level, and optional notes.
4. Tap **Save local log**.
5. Confirm the History tab shows the new log with the saved weather snapshot.
6. Refresh the page and confirm the log is still present.

### Test export/import data

1. Open the **Data** tab.
2. Tap **Export JSON backup** and save the downloaded file.
3. To test import, use another browser profile/device or clear this site's local data after confirming you have the backup.
4. Open the **Data** tab again.
5. Tap **Import JSON backup** and select the exported file.
6. Confirm the History tab shows the imported logs.

## Acceptance tests

Run:

```bash
npm test
```

The tests verify that the manifest uses the correct app name and standalone display, and that the service worker cache list remains limited to app shell assets while ignoring non-GET and cross-origin requests.
