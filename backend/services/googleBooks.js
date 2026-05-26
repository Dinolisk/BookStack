import { pickCoverUrlFromImageLinks } from "../utils/coverImage.js";

const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";

function extractIsbn(identifiers) {
  if (!identifiers?.length) return null;
  const isbn13 = identifiers.find((i) => i.type === "ISBN_13");
  const isbn10 = identifiers.find((i) => i.type === "ISBN_10");
  return (isbn13 ?? isbn10)?.identifier ?? null;
}

function normalizeVolume(item) {
  const volumeInfo = item.volumeInfo ?? {};

  return {
    id: item.id,
    title: volumeInfo.title || "Okänd titel",
    author: volumeInfo.authors?.join(", ") || "Okänd författare",
    coverImageUrl: pickCoverUrlFromImageLinks(volumeInfo.imageLinks),
    isbn: extractIsbn(volumeInfo.industryIdentifiers),
  };
}

function buildSearchError(response) {
  if (response.status === 429) {
    if (process.env.GOOGLE_BOOKS_API_KEY) {
      return "Google Books-rate limit nådd. Vänta en stund och försök igen.";
    }

    return "Google Books kräver en API-nyckel. Lägg till GOOGLE_BOOKS_API_KEY i backend/.env (gratis via Google Cloud Console).";
  }

  return "Google Books API är inte tillgängligt just nu.";
}

export async function searchGoogleBooks(query) {
  const trimmedQuery = query?.trim();

  if (!trimmedQuery) {
    return [];
  }

  const url = new URL(GOOGLE_BOOKS_URL);
  url.searchParams.set("q", trimmedQuery);
  url.searchParams.set("maxResults", "8");

  if (process.env.GOOGLE_BOOKS_API_KEY) {
    url.searchParams.set("key", process.env.GOOGLE_BOOKS_API_KEY);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(buildSearchError(response));
  }

  const data = await response.json();

  if (!data.items?.length) {
    return [];
  }

  return data.items.map(normalizeVolume);
}
