#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

const SUPPORTED_EXTENSIONS = new Set(['.dmg', '.zip', '.exe']);
const DEFAULT_REPO_ID = 'peterpoker/sootie-releases';
const DEFAULT_PYTHON_BIN = process.platform === 'win32' ? 'python' : 'python3';

function walkFiles(rootDir) {
  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function inferMacArch(lowerName) {
  if (lowerName.includes('arm64')) return 'arm64';
  if (lowerName.includes('universal')) return 'universal';
  if (lowerName.includes('x64')) return 'x64';
  return 'x64';
}

function toModelScopeLatestFileName(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  const lowerName = fileName.toLowerCase();

  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error(`Unsupported artifact extension for ${fileName}`);
  }

  if (extension === '.exe') {
    return `Sootie-windows-x64-latest${extension}`;
  }

  const arch = inferMacArch(lowerName);
  return `Sootie-mac-${arch}-latest${extension}`;
}

function collectReleaseFiles(rootDir) {
  if (!fs.existsSync(rootDir)) {
    throw new Error(`Artifact root not found: ${rootDir}`);
  }

  return walkFiles(rootDir)
    .filter((filePath) => SUPPORTED_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
    .map((filePath) => ({
      filePath,
      sourceName: path.basename(filePath),
      targetName: toModelScopeLatestFileName(path.basename(filePath)),
      size: fs.statSync(filePath).size,
    }))
    .sort((a, b) => a.targetName.localeCompare(b.targetName));
}

function getPythonBin() {
  return process.env.MODELSCOPE_PYTHON || DEFAULT_PYTHON_BIN;
}

function getRepoId() {
  return process.env.MODELSCOPE_REPO_ID || DEFAULT_REPO_ID;
}

function makeModelScopeDownloadUrl(repoId, filePath) {
  return `https://modelscope.cn/api/v1/models/${repoId}/repo?Revision=master&FilePath=${encodeURIComponent(filePath)}`;
}

function makeModelScopeFilesPageUrl(repoId) {
  return `https://modelscope.cn/models/${repoId}/files`;
}

function buildSummaryMarkdown(repoId, results) {
  const lines = [
    '## ModelScope Public Downloads',
    '',
    `Repository: [${repoId}](${makeModelScopeFilesPageUrl(repoId)})`,
    '',
    '| File | Public Link |',
    '| --- | --- |',
  ];

  for (const result of results) {
    lines.push(`| ${result.targetName} | [Open](${result.downloadUrl}) |`);
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

function writeSummary(summaryPath, markdown) {
  if (!summaryPath) return;
  fs.appendFileSync(summaryPath, markdown, 'utf8');
}

function runModelScopeCreate({ pythonBin, repoId, token }) {
  const args = [
    '-m',
    'modelscope.cli.cli',
    'create',
    repoId,
    '--visibility',
    'public',
    '--token',
    token,
  ];

  const result = spawnSync(pythonBin, args, {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.status === 0) {
    return;
  }

  const combined = `${result.stdout || ''}\n${result.stderr || ''}`;
  if (/already exists/i.test(combined)) {
    return;
  }

  throw new Error(`ModelScope create failed with exit code ${result.status}`);
}

function runModelScopeUpload({ pythonBin, repoId, token, localPath, pathInRepo, commitMessage }) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      pythonBin,
      [
        '-m',
        'modelscope.cli.cli',
        'upload',
        repoId,
        localPath,
        pathInRepo,
        '--commit-message',
        commitMessage,
        '--token',
        token,
      ],
      {
        stdio: 'inherit',
      },
    );

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`ModelScope upload failed with exit code ${code}`));
    });
  });
}

async function uploadReleaseFilesToModelScope({
  token,
  repoId,
  artifactRoot,
  summaryPath,
}) {
  const releaseFiles = collectReleaseFiles(artifactRoot);
  if (releaseFiles.length === 0) {
    throw new Error(`No supported installer files found under ${artifactRoot}`);
  }

  if (!token) throw new Error('Missing required env MODELSCOPE_TOKEN');

  const pythonBin = getPythonBin();
  runModelScopeCreate({ pythonBin, repoId, token });

  const results = [];
  for (const releaseFile of releaseFiles) {
    console.log(`Uploading ${releaseFile.targetName} (${releaseFile.size} bytes) to ModelScope...`);
    await runModelScopeUpload({
      pythonBin,
      repoId,
      token,
      localPath: releaseFile.filePath,
      pathInRepo: releaseFile.targetName,
      commitMessage: `Update ${releaseFile.targetName}`,
    });

    results.push({
      ...releaseFile,
      downloadUrl: makeModelScopeDownloadUrl(repoId, releaseFile.targetName),
    });
  }

  writeSummary(summaryPath, buildSummaryMarkdown(repoId, results));
  return results;
}

async function main() {
  const token = process.env.MODELSCOPE_TOKEN;
  const repoId = getRepoId();
  const artifactRoot = process.env.MODELSCOPE_ARTIFACT_ROOT || path.join(process.cwd(), 'release');

  await uploadReleaseFilesToModelScope({
    token,
    repoId,
    artifactRoot,
    summaryPath: process.env.GITHUB_STEP_SUMMARY,
  });
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  buildSummaryMarkdown,
  collectReleaseFiles,
  makeModelScopeDownloadUrl,
  toModelScopeLatestFileName,
  uploadReleaseFilesToModelScope,
};
