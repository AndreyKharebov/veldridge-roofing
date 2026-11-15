import { createDefaultSettings } from './defaultSettings.js';

// Retain stable keys for existing browser data and old content backups.
// This registry is NOT a populated media library: fresh media is empty.
// Static Hero / About assets and all existing asset paths remain unchanged.
export const bundledAssets = import.meta.glob('../pages/**/assets/**/*.{webp,png,jpg,jpeg,svg}', {
  eager: true, query: '?url', import: 'default',
});

// First use and explicit Clear workspace both start empty. Never overwrite
// an existing browser workspace during a reload or application update.
// Data contracts and recovery instructions: docs/data-model.md and docs/content-cleanup.md.
export function createSeed() {
  return {
    content: { services: [], articles: [], projects: [], categories: [], settings: createDefaultSettings() },
    media: [],
    inquiries: [],
  };
}
