import type { UserData } from '../types/UserData';
import { API_URL } from './config';

export const TOKEN_KEY = 'jwt';

interface LoginResponse {
  token: string;
  user: UserData;
}

async function checkResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return await res.json();
  }
  throw new Error(`Error: ${res.status}`);
}

async function postCredentials<T>(path: string, email: string, password: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return checkResponse<T>(res);
}

export function register(email: string, password: string): Promise<UserData> {
  return postCredentials<UserData>('/signup', email, password);
}

export async function login(email: string, password: string): Promise<string> {
  const { token } = await postCredentials<LoginResponse>('/signin', email, password);
  return token;
}