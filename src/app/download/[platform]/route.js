import { NextResponse } from 'next/server';

import {
  MODELSCOPE_REPO_FILES_PAGE_URL,
  MODELSCOPE_REPO_FILES_URL,
  getPlatformLabel,
  makeModelScopeDownloadUrl,
  normalizeDownloadPlatform,
  pickReleaseAsset,
} from '@/lib/release-downloads';

export async function GET(request) {
  const pathname = new URL(request.url).pathname;
  const platform = pathname.split('/').filter(Boolean).at(-1);
  const normalizedPlatform = normalizeDownloadPlatform(platform);

  const response = await fetch(MODELSCOPE_REPO_FILES_URL, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return NextResponse.redirect(MODELSCOPE_REPO_FILES_PAGE_URL);
  }

  const payload = await response.json();
  const asset = pickReleaseAsset(
    normalizedPlatform,
    (payload?.Data?.Files || []).map((file) => ({
      name: file.Name,
      path: file.Path,
    })),
  );

  if (!asset?.path) {
    return new NextResponse(`${getPlatformLabel(normalizedPlatform)} installer is not available yet.`, {
      status: 404,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
      },
    });
  }

  return NextResponse.redirect(makeModelScopeDownloadUrl(asset.path));
}
