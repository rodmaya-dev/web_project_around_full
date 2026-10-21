import type { UserData, ProfileFormData } from '../types/UserData';
import type { CardData, CardFormData } from '../types/CardData';
import { TOKEN_KEY } from './auth';

interface ApiConfig {
  baseUrl: string;
}

export class Api {
  private baseUrl: string;

  constructor({ baseUrl }: ApiConfig) {
    this.baseUrl = baseUrl;
  }

  // El token se lee en cada llamada: así siempre se usa el de la sesión actual.
  private _getHeaders(): Record<string, string> {
    const token = localStorage.getItem(TOKEN_KEY);

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async _checkResponse<T>(res: Response): Promise<T> {
    if (res.ok) {
      return await res.json();
    }
    throw new Error(`Error: ${res.status}`);
  }

  async getUserInfo(): Promise<UserData> {
    const res = await fetch(`${this.baseUrl}/users/me`, {
      headers: this._getHeaders()
    });
    return this._checkResponse<UserData>(res);
  }

  async getInitialCards(): Promise<CardData[]> {
    const res = await fetch(`${this.baseUrl}/cards`, {
      headers: this._getHeaders()
    });
    return this._checkResponse<CardData[]>(res);
  }

  async updateUserInfo(data: ProfileFormData): Promise<UserData> {
    const res = await fetch(`${this.baseUrl}/users/me`, {
      method: 'PATCH',
      headers: this._getHeaders(),
      body: JSON.stringify({ name: data.name, about: data.about })
    });
    return this._checkResponse<UserData>(res);
  }

  async addCard(data: CardFormData): Promise<CardData> {
    const res = await fetch(`${this.baseUrl}/cards`, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify({ name: data.name, link: data.link })
    });
    return this._checkResponse<CardData>(res);
  }

  async deleteCard(cardId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/cards/${cardId}`, {
      method: 'DELETE',
      headers: this._getHeaders()
    });
    return this._checkResponse<void>(res);
  }

  async changeLikeStatus(cardId: string, isLiked: boolean): Promise<CardData> {
    const res = await fetch(`${this.baseUrl}/cards/${cardId}/likes`, {
      method: isLiked ? 'DELETE' : 'PUT',
      headers: this._getHeaders()
    });
    return this._checkResponse<CardData>(res);
  }

  async updateAvatar(avatar: string): Promise<UserData> {
    const res = await fetch(`${this.baseUrl}/users/me/avatar`, {
      method: 'PATCH',
      headers: this._getHeaders(),
      body: JSON.stringify({ avatar })
    });
    return this._checkResponse<UserData>(res);
  }
}

const api = new Api({
  baseUrl: 'http://localhost:3001'
});

export default api;