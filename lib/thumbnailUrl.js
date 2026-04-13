function extractGoogleDriveFileId(url) {
  if (!url) {
    return null;
  }

  const value = url.toString().trim();

  const byIdParam = /[?&]id=([a-zA-Z0-9_-]+)/.exec(value);
  if (byIdParam) {
    return byIdParam[1];
  }

  const byFilePath = /\/file\/d\/([a-zA-Z0-9_-]+)/.exec(value);
  if (byFilePath) {
    return byFilePath[1];
  }

  return null;
}

export function getThumbnailPreviewUrl(url) {
  const fileId = extractGoogleDriveFileId(url);

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }

  return url || null;
}