const COVER_SIZE_PRIORITY = [
  "extraLarge",
  "large",
  "medium",
  "small",
  "thumbnail",
  "smallThumbnail",
];

export function pickCoverUrlFromImageLinks(imageLinks) {
  if (!imageLinks) {
    return null;
  }

  for (const size of COVER_SIZE_PRIORITY) {
    const url = imageLinks[size];
    if (url) {
      return normalizeCoverUrl(url);
    }
  }

  return null;
}

export function normalizeCoverUrl(url) {
  if (!url) {
    return null;
  }

  // Only enforce HTTPS – do not change zoom params (zoom=2 breaks many Google URLs)
  return url.replace(/^http:/, "https:");
}

/**
 * Checks Open Library for a high-quality cover via ISBN.
 * Uses a HEAD request with ?default=false so Open Library returns 404
 * (instead of a placeholder image) when the ISBN has no cover.
 * Falls back to the Google Books URL on timeout, network error, or 404.
 */
export async function resolveBestCoverUrl(googleBooksUrl, isbn) {
  if (!isbn) return googleBooksUrl;

  const openLibraryUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`${openLibraryUrl}?default=false`, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Open Library sometimes returns 200 with a tiny "Image Not Found" placeholder.
    // Real covers are at least ~5 KB; anything smaller is a placeholder.
    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (response.ok && contentLength > 5000) return openLibraryUrl;
  } catch {
    // timeout or network error — fall back silently
  }

  return googleBooksUrl;
}

export function withNormalizedCover(book) {
  if (!book?.cover_image_url) {
    return book;
  }

  return {
    ...book,
    cover_image_url: normalizeCoverUrl(book.cover_image_url),
  };
}
