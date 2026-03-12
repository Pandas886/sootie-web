import { NextResponse } from 'next/server';

import {
  MODELSCOPE_REPO_FILES_PAGE_URL,
  MODELSCOPE_REPO_FILES_URL,
  getPlatformLabel,
  makeModelScopeDownloadUrl,
  pickReleaseAsset,
} from '@/lib/release-downloads';

export async function GET(_request, { params }) {
  const platform = params?.platform === 'windows' ? 'windows' : 'macos';

  const response = await fetch(MODELSCOPE_REPO_FILES_URL, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return NextResponse.redirect(MODELSCOPE_REPO_FILES_PAGE_URL);
  }

  const payload = await response.json();
  const asset = pickReleaseAsset(
    platform,
    (payload?.Data?.Files || []).map((file) => ({
      name: file.Name,
      path: file.Path,
    })),
  );

  if (!asset?.path) {
    return new NextResponse(`${getPlatformLabel(platform)} installer is not available yet.`, {
      status: 404,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    });
  }

  return NextResponse.redirect(makeModelScopeDownloadUrl(asset.path));
}
