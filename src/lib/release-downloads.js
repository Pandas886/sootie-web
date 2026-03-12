export const GITCODE_RELEASES_LATEST_URL = 'https://api.gitcode.com/api/v5/repos/peterPoker/sootie-websootie-web/releases/latest';

export function pickReleaseAsset(platform, assets) {
  if (!Array.isArray(assets) || assets.length === 0) {
    return null;
  }

  if (platform === 'windows') {
    return assets.find((asset) => /\.exe$/i.test(asset.name)) || null;
  }

  const macAssets = assets.filter((asset) => /\.dmg$/i.test(asset.name));
  return macAssets.find((asset) => /arm64/i.test(asset.name))
    || macAssets.find((asset) => /x64/i.test(asset.name))
    || macAssets[0]
    || null;
}

export function getPlatformLabel(platform) {
  return platform === 'windows' ? 'Windows' : 'macOS';
}
