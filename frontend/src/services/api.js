const TOKEN_KEY = "bookstack_token";

let authToken = null;

export function setAuthToken(token) {
  authToken = token;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function loadAuthToken() {
  authToken = localStorage.getItem(TOKEN_KEY);
  return authToken;
}

async function request(path, options = {}) {
  const response = await fetch(`${import.meta.env.VITE_API_URL || "/api"}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Något gick fel.";
    try {
      const body = await response.json();
      message = body.error || message;
    } catch {
      // Response body was not JSON
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function register(email, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function demoLogin() {
  return request("/auth/demo", { method: "POST" });
}

export function getCurrentUser() {
  return request("/auth/me");
}

export function searchBooks(query) {
  return request(`/books/search?q=${encodeURIComponent(query)}`);
}

export function getBooks() {
  return request("/books");
}

export function createBook(book) {
  return request("/books", {
    method: "POST",
    body: JSON.stringify(book),
  });
}

export function updateBook(id, updates) {
  return request(`/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export function deleteBook(id) {
  return request(`/books/${id}`, {
    method: "DELETE",
  });
}
