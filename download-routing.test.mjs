import assert from 'node:assert/strict';
import test from 'node:test';

import { getPlatformLabel, pickReleaseAsset } from './src/lib/release-downloads.js';

test('pickReleaseAsset selects latest windows installer', () => {
  const asset = pickReleaseAsset('windows', [
    { name: 'Sootie-0.1.19-arm64.dmg', browser_download_url: 'https://example.com/mac' },
    { name: 'Sootie.Setup.0.1.19.exe', browser_download_url: 'https://example.com/win' },
  ]);

  assert.equal(asset?.name, 'Sootie.Setup.0.1.19.exe');
});

test('pickReleaseAsset selects preferred mac arm64 installer', () => {
  const asset = pickReleaseAsset('macos', [
    { name: 'Sootie-0.1.19-x64.dmg', browser_download_url: 'https://example.com/mac-x64' },
    { name: 'Sootie-0.1.19-arm64.dmg', browser_download_url: 'https://example.com/mac-arm64' },
  ]);

  assert.equal(asset?.name, 'Sootie-0.1.19-arm64.dmg');
});

test('returns platform label for download CTA copy', () => {
  assert.equal(getPlatformLabel('macos'), 'macOS');
  assert.equal(getPlatformLabel('windows'), 'Windows');
});
