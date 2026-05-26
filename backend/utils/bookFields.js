const MAX_REVIEW_LENGTH = 2000;

export function parseRating(value) {
  if (value === undefined) {
    return { skip: true };
  }

  if (value === null || value === "") {
    return { value: null };
  }

  const rating = Number.parseInt(value, 10);

  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    return { error: "Betyg måste vara ett heltal mellan 1 och 5." };
  }

  return { value: rating };
}

export function parseReview(value) {
  if (value === undefined) {
    return { skip: true };
  }

  if (value === null) {
    return { value: null };
  }

  if (typeof value !== "string") {
    return { error: "Recensionen måste vara text." };
  }

  const trimmed = value.trim();

  if (trimmed.length > MAX_REVIEW_LENGTH) {
    return {
      error: `Recensionen får vara högst ${MAX_REVIEW_LENGTH} tecken.`,
    };
  }

  return { value: trimmed || null };
}
