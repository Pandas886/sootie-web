import { NextResponse } from 'next/server';

import { GITCODE_RELEASES_LATEST_URL, getPlatformLabel, pickReleaseAsset } from '@/lib/release-downloads';

export async function GET(_request, { params }) {
  const platform = params?.platform === 'windows' ? 'windows' : 'macos';

  const response = await fetch(GITCODE_RELEASES_LATEST_URL, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return NextResponse.redirect('https://gitcode.com/peterPoker/sootie-websootie-web/releases');
  }

  const release = await response.json();
  const asset = pickReleaseAsset(platform, release.assets || []);

  if (!asset?.browser_download_url) {
    return new NextResponse(`${getPlatformLabel(platform)} installer is not available yet.`, {
      status: 404,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    });
  }

  return NextResponse.redirect(asset.browser_download_url);
}
