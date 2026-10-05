const BASE_URL = 'https://se-register-api.en.tripleten-services.com/v1';

export interface AuthUser {
  _id: string;
  email: string;
}

interface RegisterResponse {
  data: AuthUser;
}

interface LoginResponse {
  token: string;
}

interface CheckTokenResponse {
  data: AuthUser;
}

async function checkResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return await res.json();
  }
  throw new Error(`Error: ${res.status}`);
}

export async function register(email: string, password: string): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const { data } = await checkResponse<RegisterResponse>(res);
  return data;
}

export async function login(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const { token } = await checkResponse<LoginResponse>(res);
  return token;
}

// Único endpoint que lleva el encabezado Authorization
export async function checkToken(token: string): Promise<AuthUser> {
  const res = await fetch(`${BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const { data } = await checkResponse<CheckTokenResponse>(res);
  return data;
}