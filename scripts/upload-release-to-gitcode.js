#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const API_BASE_URL = 'https://api.gitcode.com/api/v5';
const SUPPORTED_EXTENSIONS = new Set(['.dmg', '.zip', '.exe']);
const UPLOAD_DESCRIPTOR_RETRY_DELAYS_MS = [1000, 2000, 3000];

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

function collectReleaseFiles(rootDir) {
  if (!fs.existsSync(rootDir)) {
    throw new Error(`Artifact root not found: ${rootDir}`);
  }

  return walkFiles(rootDir)
    .filter((filePath) => SUPPORTED_EXTENSIONS.has(path.extname(filePath).toLowerCase()))
    .map((filePath) => ({
      filePath,
      sourceName: path.basename(filePath),
      size: fs.statSync(filePath).size,
    }))
    .sort((a, b) => a.sourceName.localeCompare(b.sourceName));
}

function makeApiHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function gitcodeJsonRequest(url, { method = 'GET', token, body, treat404AsNull = false } = {}) {
  const response = await fetch(url, {
    method,
    headers: makeApiHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    const looksLikeNotFound = response.status === 404
      || /"error_code"\s*:\s*404/.test(text)
      || /"error_message"\s*:\s*"404[^"]*not found"/i.test(text);

    if (treat404AsNull && looksLikeNotFound) {
      return null;
    }

    throw new Error(`GitCode request failed (${response.status}): ${text}`);
  }

  return response.json();
}

async function ensureRelease({ token, owner, repo, tag, name, body, targetCommitish }) {
  const existing = await gitcodeJsonRequest(
    `${API_BASE_URL}/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`,
    { token, treat404AsNull: true },
  );

  if (existing) {
    return existing;
  }

  try {
    return await gitcodeJsonRequest(
      `${API_BASE_URL}/repos/${owner}/${repo}/releases`,
      {
        method: 'POST',
        token,
        body: {
          tag_name: tag,
          name,
          body,
          target_commitish: targetCommitish,
        },
      },
    );
  } catch (error) {
    const retryExisting = await gitcodeJsonRequest(
      `${API_BASE_URL}/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`,
      { token, treat404AsNull: true },
    );

    if (retryExisting) {
      return retryExisting;
    }

    throw error;
  }
}

async function getUploadDescriptor({ token, owner, repo, tag, fileName }) {
  const url = new URL(`${API_BASE_URL}/repos/${owner}/${repo}/releases/${encodeURIComponent(tag)}/upload_url`);
  url.searchParams.set('file_name', fileName);
  return gitcodeJsonRequest(url.toString(), { token });
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function isReleaseNotReadyError(error) {
  return error instanceof Error
    && /GitCode request failed \((400|404)\):/i.test(error.message)
    && /release not found/i.test(error.message);
}

async function getUploadDescriptorWithRetry({ token, owner, repo, tag, fileName }) {
  let lastError = null;

  for (let attempt = 0; attempt <= UPLOAD_DESCRIPTOR_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await getUploadDescriptor({ token, owner, repo, tag, fileName });
    } catch (error) {
      if (!isReleaseNotReadyError(error) || attempt === UPLOAD_DESCRIPTOR_RETRY_DELAYS_MS.length) {
        throw error;
      }

      lastError = error;
      await wait(UPLOAD_DESCRIPTOR_RETRY_DELAYS_MS[attempt]);
    }
  }

  throw lastError;
}

async function uploadFileToSignedUrl({ uploadUrl, headers, filePath }) {
  const stat = fs.statSync(filePath);
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      ...(headers || {}),
      'Content-Length': String(stat.size),
    },
    body: fs.createReadStream(filePath),
    duplex: 'half',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitCode upload failed (${response.status}): ${text}`);
  }
}

async function fetchRelease({ token, owner, repo, tag }) {
  return gitcodeJsonRequest(
    `${API_BASE_URL}/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`,
    { token },
  );
}

function makeGitCodeReleaseUrl({ owner, repo, tag, fileName }) {
  return `https://api.gitcode.com/${owner}/${repo}/releases/download/${encodeURIComponent(tag)}/${fileName}`;
}

function buildSummaryMarkdown(results) {
  const lines = [
    '## GitCode Public Downloads',
    '',
    '| File | Public Link |',
    '| --- | --- |',
  ];

  for (const result of results) {
    lines.push(`| ${result.sourceName} | [Open](${result.downloadUrl}) |`);
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

function writeSummary(summaryPath, markdown) {
  if (!summaryPath) return;
  fs.appendFileSync(summaryPath, markdown, 'utf8');
}

async function uploadReleaseFilesToGitCode({
  token,
  owner,
  repo,
  tag,
  releaseName,
  releaseBody,
  targetCommitish,
  artifactRoot,
  summaryPath,
}) {
  const releaseFiles = collectReleaseFiles(artifactRoot);
  if (releaseFiles.length === 0) {
    throw new Error(`No supported installer files found under ${artifactRoot}`);
  }

  await ensureRelease({
    token,
    owner,
    repo,
    tag,
    name: releaseName,
    body: releaseBody,
    targetCommitish,
  });

  for (const releaseFile of releaseFiles) {
    const descriptor = await getUploadDescriptorWithRetry({
      token,
      owner,
      repo,
      tag,
      fileName: releaseFile.sourceName,
    });

    await uploadFileToSignedUrl({
      uploadUrl: descriptor.url,
      headers: descriptor.headers,
      filePath: releaseFile.filePath,
    });
  }

  const release = await fetchRelease({ token, owner, repo, tag });
  const attachAssets = (release.assets || []).filter((asset) => asset.type === 'attach');
  const results = releaseFiles.map((releaseFile) => {
    const asset = attachAssets.find((item) => item.name === releaseFile.sourceName);
    return {
      ...releaseFile,
      downloadUrl: asset?.browser_download_url || makeGitCodeReleaseUrl({
        owner,
        repo,
        tag,
        fileName: releaseFile.sourceName,
      }),
    };
  });

  writeSummary(summaryPath, buildSummaryMarkdown(results));
  return results;
}

async function main() {
  const token = process.env.GITCODE_TOKEN;
  const owner = process.env.GITCODE_REPO_OWNER;
  const repo = process.env.GITCODE_REPO_NAME;
  const tag = process.env.GITCODE_RELEASE_TAG;
  const artifactRoot = process.env.GITCODE_ARTIFACT_ROOT || path.join(process.cwd(), 'release');

  if (!token) throw new Error('Missing required env GITCODE_TOKEN');
  if (!owner) throw new Error('Missing required env GITCODE_REPO_OWNER');
  if (!repo) throw new Error('Missing required env GITCODE_REPO_NAME');
  if (!tag) throw new Error('Missing required env GITCODE_RELEASE_TAG');

  await uploadReleaseFilesToGitCode({
    token,
    owner,
    repo,
    tag,
    releaseName: process.env.GITCODE_RELEASE_NAME || `SootieAI Release ${tag}`,
    releaseBody: process.env.GITCODE_RELEASE_BODY || 'Automated release mirror from GitHub Actions.',
    targetCommitish: process.env.GITCODE_TARGET_COMMITISH || 'main',
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
  getUploadDescriptorWithRetry,
  isReleaseNotReadyError,
  makeGitCodeReleaseUrl,
  uploadReleaseFilesToGitCode,
};
