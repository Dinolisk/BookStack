import { afterEach, describe, expect, it, vi } from "vitest";
import {
  normalizeCoverUrl,
  pickCoverUrlFromImageLinks,
  resolveBestCoverUrl,
} from "../utils/coverImage.js";

describe("coverImage", () => {
  describe("pickCoverUrlFromImageLinks", () => {
    it("prefers the largest available image size", () => {
      const url = pickCoverUrlFromImageLinks({
        smallThumbnail: "http://books.google.com/small.jpg",
        thumbnail: "http://books.google.com/thumb.jpg",
        medium: "http://books.google.com/medium.jpg",
        large: "http://books.google.com/large.jpg",
      });

      expect(url).toBe("https://books.google.com/large.jpg");
    });

    it("returns null when no image links exist", () => {
      expect(pickCoverUrlFromImageLinks(null)).toBeNull();
      expect(pickCoverUrlFromImageLinks({})).toBeNull();
    });
  });

  describe("normalizeCoverUrl", () => {
    it("upgrades http to https without changing zoom", () => {
      expect(
        normalizeCoverUrl(
          "http://books.google.com/books/content?id=abc&zoom=1&edge=curl"
        )
      ).toBe("https://books.google.com/books/content?id=abc&zoom=1&edge=curl");
    });
  });
});

describe("resolveBestCoverUrl", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns googleBooksUrl immediately when no ISBN is given", async () => {
    const url = await resolveBestCoverUrl("https://books.google.com/cover.jpg", null);
    expect(url).toBe("https://books.google.com/cover.jpg");
  });

  it("returns Open Library URL when the cover is a real image (large content-length)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      headers: { get: () => "80000" },
    });

    const url = await resolveBestCoverUrl(
      "https://books.google.com/cover.jpg",
      "9781234567890"
    );

    expect(url).toBe("https://covers.openlibrary.org/b/isbn/9781234567890-L.jpg");
  });

  it("falls back to Google Books when Open Library returns a placeholder (small content-length)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      headers: { get: () => "800" },
    });

    const url = await resolveBestCoverUrl(
      "https://books.google.com/cover.jpg",
      "9781234567890"
    );

    expect(url).toBe("https://books.google.com/cover.jpg");
  });

  it("falls back to Google Books when Open Library returns 404", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      headers: { get: () => null },
    });

    const url = await resolveBestCoverUrl(
      "https://books.google.com/cover.jpg",
      "9781234567890"
    );

    expect(url).toBe("https://books.google.com/cover.jpg");
  });

  it("falls back to Google Books on network error", async () => {
    vi.spyOn(global, "fetch").mockRejectedValueOnce(new Error("Network error"));

    const url = await resolveBestCoverUrl(
      "https://books.google.com/cover.jpg",
      "9781234567890"
    );

    expect(url).toBe("https://books.google.com/cover.jpg");
  });
});
