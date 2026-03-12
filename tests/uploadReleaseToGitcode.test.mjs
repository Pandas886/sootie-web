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
  isReleaseNotReadyError,
  makeGitCodeReleaseUrl,
} = require('../scripts/upload-release-to-gitcode.js');

test('collects supported installer files from release tree', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sootie-gitcode-upload-'));
  fs.writeFileSync(path.join(tempDir, 'Sootie-0.1.19-arm64.dmg'), 'mac');
  fs.writeFileSync(path.join(tempDir, 'Sootie.Setup.0.1.19.exe'), 'win');
  fs.writeFileSync(path.join(tempDir, 'latest.yml'), 'ignore');

  const files = collectReleaseFiles(tempDir);

  assert.deepEqual(
    files.map((file) => file.sourceName),
    ['Sootie-0.1.19-arm64.dmg', 'Sootie.Setup.0.1.19.exe'],
  );
});

test('builds gitcode release url from repo coordinates and tag', () => {
  assert.equal(
    makeGitCodeReleaseUrl({
      owner: 'peterPoker',
      repo: 'sootie-websootie-web',
      tag: 'v0.1.19-202603120216',
      fileName: 'Sootie-0.1.19-arm64.dmg',
    }),
    'https://api.gitcode.com/peterPoker/sootie-websootie-web/releases/download/v0.1.19-202603120216/Sootie-0.1.19-arm64.dmg',
  );
});

test('renders deterministic summary rows', () => {
  const markdown = buildSummaryMarkdown([
    {
      sourceName: 'Sootie-0.1.19-arm64.dmg',
      downloadUrl: 'https://api.gitcode.com/peterPoker/sootie-websootie-web/releases/download/v0/Sootie-0.1.19-arm64.dmg',
    },
    {
      sourceName: 'Sootie.Setup.0.1.19.exe',
      downloadUrl: 'https://api.gitcode.com/peterPoker/sootie-websootie-web/releases/download/v0/Sootie.Setup.0.1.19.exe',
    },
  ]);

  assert.match(markdown, /\| Sootie-0\.1\.19-arm64\.dmg \| \[Open\]\(https:\/\/api\.gitcode\.com\/peterPoker\/sootie-websootie-web\/releases\/download\/v0\/Sootie-0\.1\.19-arm64\.dmg\) \|/);
  assert.match(markdown, /\| Sootie\.Setup\.0\.1\.19\.exe \| \[Open\]\(https:\/\/api\.gitcode\.com\/peterPoker\/sootie-websootie-web\/releases\/download\/v0\/Sootie\.Setup\.0\.1\.19\.exe\) \|/);
});

test('detects temporary release-not-ready API responses', () => {
  assert.equal(
    isReleaseNotReadyError(new Error('GitCode request failed (400): {"error_code":404,"error_message":"404 Release Not Found"}')),
    true,
  );
  assert.equal(
    isReleaseNotReadyError(new Error('GitCode request failed (500): {"error_message":"internal error"}')),
    false,
  );
});
