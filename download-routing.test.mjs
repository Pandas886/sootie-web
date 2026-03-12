import assert from 'node:assert/strict';
import test from 'node:test';

import { getPlatformLabel, makeModelScopeDownloadUrl, pickReleaseAsset } from './src/lib/release-downloads.js';

test('pickReleaseAsset selects latest windows installer', () => {
  const asset = pickReleaseAsset('windows', [
    { name: 'Sootie-mac-arm64-latest.dmg', path: 'Sootie-mac-arm64-latest.dmg' },
    { name: 'Sootie-windows-x64-latest.exe', path: 'Sootie-windows-x64-latest.exe' },
  ]);

  assert.equal(asset?.name, 'Sootie-windows-x64-latest.exe');
});

test('pickReleaseAsset selects preferred mac arm64 installer', () => {
  const asset = pickReleaseAsset('macos', [
    { name: 'Sootie-mac-x64-latest.dmg', path: 'Sootie-mac-x64-latest.dmg' },
    { name: 'Sootie-mac-arm64-latest.dmg', path: 'Sootie-mac-arm64-latest.dmg' },
  ]);

  assert.equal(asset?.name, 'Sootie-mac-arm64-latest.dmg');
});

test('pickReleaseAsset selects requested mac arm64 installer', () => {
  const asset = pickReleaseAsset('macos-arm64', [
    { name: 'Sootie-mac-x64-latest.dmg', path: 'Sootie-mac-x64-latest.dmg' },
    { name: 'Sootie-mac-arm64-latest.dmg', path: 'Sootie-mac-arm64-latest.dmg' },
  ]);

  assert.equal(asset?.name, 'Sootie-mac-arm64-latest.dmg');
});

test('pickReleaseAsset selects requested mac x64 installer', () => {
  const asset = pickReleaseAsset('macos-x64', [
    { name: 'Sootie-mac-arm64-latest.dmg', path: 'Sootie-mac-arm64-latest.dmg' },
    { name: 'Sootie-mac-x64-latest.dmg', path: 'Sootie-mac-x64-latest.dmg' },
  ]);

  assert.equal(asset?.name, 'Sootie-mac-x64-latest.dmg');
});

test('builds modelscope api download url', () => {
  assert.equal(
    makeModelScopeDownloadUrl('Sootie-mac-arm64-latest.dmg'),
    'https://modelscope.cn/api/v1/models/peterpoker/sootie-releases/repo?Revision=master&FilePath=Sootie-mac-arm64-latest.dmg',
  );
});

test('returns platform label for download CTA copy', () => {
  assert.equal(getPlatformLabel('macos'), 'macOS');
  assert.equal(getPlatformLabel('macos-arm64'), 'macOS Apple Silicon');
  assert.equal(getPlatformLabel('macos-x64'), 'macOS Intel');
  assert.equal(getPlatformLabel('windows'), 'Windows');
});
