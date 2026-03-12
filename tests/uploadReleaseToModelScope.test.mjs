import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  buildSummaryMarkdown,
  collectReleaseFiles,
  makeModelScopeDownloadUrl,
  toModelScopeLatestFileName,
} = require('../scripts/upload-release-to-modelscope.js');

test('maps mac arm64 dmg artifact to stable latest name', () => {
  assert.equal(
    toModelScopeLatestFileName('Sootie-0.1.19-arm64.dmg'),
    'Sootie-mac-arm64-latest.dmg',
  );
});

test('maps windows installer artifact to stable latest name', () => {
  assert.equal(
    toModelScopeLatestFileName('Sootie Setup 0.1.19.exe'),
    'Sootie-windows-x64-latest.exe',
  );
});

test('collects supported installer files from release tree', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sootie-modelscope-upload-'));
  fs.writeFileSync(path.join(tempDir, 'Sootie-0.1.19-arm64.dmg'), 'mac');
  fs.writeFileSync(path.join(tempDir, 'Sootie.Setup.0.1.19.exe'), 'win');
  fs.writeFileSync(path.join(tempDir, 'latest.yml'), 'ignore');

  const files = collectReleaseFiles(tempDir);

  assert.deepEqual(
    files.map((file) => file.targetName),
    ['Sootie-mac-arm64-latest.dmg', 'Sootie-windows-x64-latest.exe'],
  );
});

test('ignores nested helper executables and unsupported top-level artifacts', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sootie-modelscope-upload-'));
  const nestedDir = path.join(tempDir, 'win-unpacked');
  fs.mkdirSync(nestedDir);

  fs.writeFileSync(path.join(tempDir, 'Sootie.Setup.0.1.19.exe'), 'installer');
  fs.writeFileSync(path.join(tempDir, 'helper.exe'), 'ignore');
  fs.writeFileSync(path.join(nestedDir, 'elevate.exe'), 'ignore');
  fs.writeFileSync(path.join(tempDir, 'Sootie-0.1.19-arm64.dmg'), 'mac');
  fs.writeFileSync(path.join(tempDir, 'builder-debug.yml'), 'ignore');

  const files = collectReleaseFiles(tempDir);

  assert.deepEqual(
    files.map((file) => ({
      sourceName: file.sourceName,
      targetName: file.targetName,
    })),
    [
      {
        sourceName: 'Sootie-0.1.19-arm64.dmg',
        targetName: 'Sootie-mac-arm64-latest.dmg',
      },
      {
        sourceName: 'Sootie.Setup.0.1.19.exe',
        targetName: 'Sootie-windows-x64-latest.exe',
      },
    ],
  );
});

test('builds modelscope download url from repo coordinates and file path', () => {
  assert.equal(
    makeModelScopeDownloadUrl('peterpoker/sootie-releases', 'Sootie-mac-arm64-latest.dmg'),
    'https://modelscope.cn/api/v1/models/peterpoker/sootie-releases/repo?Revision=master&FilePath=Sootie-mac-arm64-latest.dmg',
  );
});

test('renders deterministic summary rows', () => {
  const markdown = buildSummaryMarkdown('peterpoker/sootie-releases', [
    {
      targetName: 'Sootie-mac-arm64-latest.dmg',
      downloadUrl: 'https://modelscope.cn/api/v1/models/peterpoker/sootie-releases/repo?Revision=master&FilePath=Sootie-mac-arm64-latest.dmg',
    },
    {
      targetName: 'Sootie-windows-x64-latest.exe',
      downloadUrl: 'https://modelscope.cn/api/v1/models/peterpoker/sootie-releases/repo?Revision=master&FilePath=Sootie-windows-x64-latest.exe',
    },
  ]);

  assert.match(markdown, /Repository: \[peterpoker\/sootie-releases\]\(https:\/\/modelscope\.cn\/models\/peterpoker\/sootie-releases\/files\)/);
  assert.match(markdown, /\| Sootie-mac-arm64-latest\.dmg \| \[Open\]\(https:\/\/modelscope\.cn\/api\/v1\/models\/peterpoker\/sootie-releases\/repo\?Revision=master&FilePath=Sootie-mac-arm64-latest\.dmg\) \|/);
  assert.match(markdown, /\| Sootie-windows-x64-latest\.exe \| \[Open\]\(https:\/\/modelscope\.cn\/api\/v1\/models\/peterpoker\/sootie-releases\/repo\?Revision=master&FilePath=Sootie-windows-x64-latest\.exe\) \|/);
});
