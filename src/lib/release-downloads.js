export const MODELSCOPE_REPO_ID = 'peterpoker/sootie-releases';
export const MODELSCOPE_REPO_FILES_URL = `https://modelscope.cn/api/v1/models/${MODELSCOPE_REPO_ID}/repo/files`;
export const MODELSCOPE_REPO_FILES_PAGE_URL = `https://modelscope.cn/models/${MODELSCOPE_REPO_ID}/files`;

export function makeModelScopeDownloadUrl(filePath) {
  return `https://modelscope.cn/api/v1/models/${MODELSCOPE_REPO_ID}/repo?Revision=master&FilePath=${encodeURIComponent(filePath)}`;
}

export function pickReleaseAsset(platform, assets) {
  if (!Array.isArray(assets) || assets.length === 0) {
    return null;
  }

  if (platform === 'windows') {
    return assets.find((asset) => asset.name === 'Sootie-windows-x64-latest.exe')
      || assets.find((asset) => /\.exe$/i.test(asset.name))
      || null;
  }

  const macAssets = assets.filter((asset) => /\.dmg$/i.test(asset.name));
  if (platform === 'macos-arm64') {
    return macAssets.find((asset) => asset.name === 'Sootie-mac-arm64-latest.dmg')
      || macAssets.find((asset) => /arm64/i.test(asset.name))
      || null;
  }

  if (platform === 'macos-x64') {
    return macAssets.find((asset) => asset.name === 'Sootie-mac-x64-latest.dmg')
      || macAssets.find((asset) => /x64/i.test(asset.name))
      || null;
  }

  return macAssets.find((asset) => asset.name === 'Sootie-mac-arm64-latest.dmg')
    || macAssets.find((asset) => asset.name === 'Sootie-mac-x64-latest.dmg')
    || macAssets.find((asset) => /arm64/i.test(asset.name))
    || macAssets.find((asset) => /x64/i.test(asset.name))
    || macAssets[0]
    || null;
}

export function getPlatformLabel(platform) {
  if (platform === 'macos-arm64') return 'macOS Apple Silicon';
  if (platform === 'macos-x64') return 'macOS Intel';
  return platform === 'windows' ? 'Windows' : 'macOS';
}
