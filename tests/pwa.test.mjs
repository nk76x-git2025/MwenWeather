import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
const serviceWorker = readFileSync('public/service-worker.js', 'utf8');

test('PWA manifest uses the MwenWeather app identity and standalone display', () => {
  assert.equal(manifest.name, 'MwenWeather');
  assert.equal(manifest.display, 'standalone');
  assert.ok(manifest.icons.length > 0);
});

test('service worker pre-caches only app shell assets', () => {
  const assetMatch = serviceWorker.match(/const STATIC_ASSETS = \[(.*?)\]/s);
  assert.ok(assetMatch);
  assert.equal(assetMatch[1], "'/', '/manifest.webmanifest', '/icons/icon.svg'");
  assert.doesNotMatch(assetMatch[1], /api|weather|log|indexeddb/i);
});

test('service worker does not intercept non-GET or cross-origin requests', () => {
  assert.match(serviceWorker, /request\.method !== 'GET'/);
  assert.match(serviceWorker, /url\.origin !== self\.location\.origin/);
});
