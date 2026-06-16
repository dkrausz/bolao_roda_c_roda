import axios from 'axios';

const STORAGE_KEY = 'admin_credentials';

export function getAdminCredentials(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function saveAdminCredentials(user: string, pass: string): string {
  const encoded = btoa(`${user}:${pass}`);
  localStorage.setItem(STORAGE_KEY, encoded);
  return encoded;
}

export function clearAdminCredentials(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function adminApi(credentials: string) {
  return axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? '',
    headers: { Authorization: `Basic ${credentials}` },
  });
}
