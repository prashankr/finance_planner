const API_BASE_URL = process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "";

export type StoredUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  base_currency_code?: string;
};

export const getApiUrl = (path: string) =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const getStoredUser = (): StoredUser | null => {
  const raw = localStorage.getItem("user");

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const isAuthenticated = () => Boolean(getStoredUser());

export const setStoredUser = (user: StoredUser) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearStoredUser = () => {
  localStorage.removeItem("user");
};
