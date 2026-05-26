import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Builds a prioritised list of URLs to try for a given cover URL.
 *
 * When an ISBN is available the chain starts with Open Library (large cover,
 * same edition as the ISBN). ?default=false makes Open Library return 404
 * instead of a placeholder image when the ISBN is not in their database.
 *
 * For plain Google Books thumbnails (zoom=1) we then try zoom=4 and zoom=2
 * before the original. All zoom variants point to the same edition — only
 * the resolution differs.
 *
 * The fife= CDN endpoint is intentionally avoided: it resolves covers by
 * volume-ID independently of the search result and can return a different
 * edition's cover.
 *
 * zoom=5/6 are intentionally skipped: 5 is smallThumbnail (smaller than
 * zoom=1), 6 can return inner-page scans rather than the front cover.
 *
 * Any other URL (already a high-res size from the backend, a fife= CDN URL,
 * a custom URL) is returned as a single-item chain – we don't touch it.
 *
 * The hook works through the chain one step at a time:
 *   • onLoad  – if the loaded image is square/landscape it is a Google
 *               placeholder, advance to the next candidate.
 *   • onError – image failed to load at all, advance to the next candidate.
 *   • When the chain is exhausted src becomes null → show UI placeholder.
 */
function buildChain(url, isbn) {
  if (!url) {
    // No Google Books URL (manual add): try Open Library via ISBN.
    // ?default=false returns 404 instead of a placeholder when not found.
    const openLibraryUrl = isbn
      ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`
      : null;
    return openLibraryUrl ? [openLibraryUrl] : [];
  }

  // Google Books URL present: stay in the zoom chain.
  // Open Library is skipped here because it can return "Image Not Available"
  // placeholder images that are portrait-shaped and undetectable without extra
  // network requests. The zoom chain always serves the same edition as the
  // search result, just at different resolutions.
  const isPlainThumbnail =
    url.includes("books.google.com") &&
    /[?&]zoom=1(&|$)/.test(url) &&
    !url.includes("fife=");

  if (!isPlainThumbnail) return [url];

  return [
    url.replace(/([?&]zoom)=1(&|$)/, "$1=4$2"), // ~500 px
    url.replace(/([?&]zoom)=1(&|$)/, "$1=2$2"), // ~200 px – reliable fallback
    url,                                          // ~128 px – guaranteed correct
  ];
}

export function useCoverImage(url, isbn) {
  const chain = useMemo(() => buildChain(url, isbn), [url, isbn]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [chain]);

  const advance = useCallback(() => {
    setIdx((i) => i + 1);
  }, []);

  // Real book covers are always portrait (height > width).
  // Square / landscape = Google text-placeholder or logo → skip it.
  const handleLoad = useCallback(
    (event) => {
      const img = event.currentTarget;
      if (img.naturalWidth > 0 && img.naturalWidth >= img.naturalHeight) {
        advance();
      }
    },
    [advance],
  );

  const handleError = useCallback(() => {
    advance();
  }, [advance]);

  const src = idx < chain.length ? chain[idx] : null;

  return { src, handleLoad, handleError };
}
