import type { UserData, ProfileFormData } from '../interfaces/UserData';
import type { CardData, CardFormData } from '../interfaces/CardData';

interface ApiConfig {
  baseUrl: string;
  headers: Record<string, string>;
}

export class Api {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor({ baseUrl, headers }: ApiConfig) {
    this.baseUrl = baseUrl;
    this.headers = headers;
  }

  private async _checkResponse<T>(res: Response): Promise<T> {
    if (res.ok) {
      return await res.json();
    }
    throw new Error(`Error: ${res.status}`);
  }

  async getUserInfo(): Promise<UserData> {
    const res = await fetch(`${this.baseUrl}/users/me`, {
      headers: this.headers
    });
    return this._checkResponse<UserData>(res);
  }

  async getInitialCards(): Promise<CardData[]> {
    const res = await fetch(`${this.baseUrl}/cards`, {
      headers: this.headers
    });
    return this._checkResponse<CardData[]>(res);
  }

  async updateUserInfo(data: ProfileFormData): Promise<UserData> {
    const res = await fetch(`${this.baseUrl}/users/me`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({ name: data.name, about: data.about })
    });
    return this._checkResponse<UserData>(res);
  }

  async addCard(data: CardFormData): Promise<CardData> {
    const res = await fetch(`${this.baseUrl}/cards`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ name: data.name, link: data.link })
    });
    return this._checkResponse<CardData>(res);
  }

  async deleteCard(cardId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/cards/${cardId}`, {
      method: 'DELETE',
      headers: this.headers
    });
    return this._checkResponse<void>(res);
  }

  async changeLikeStatus(cardId: string, isLiked: boolean): Promise<CardData> {
    const res = await fetch(`${this.baseUrl}/cards/${cardId}/likes`, {
      method: isLiked ? 'DELETE' : 'PUT',
      headers: this.headers
    });
    return this._checkResponse<CardData>(res);
  }

  async updateAvatar(avatar: string): Promise<UserData> {
    const res = await fetch(`${this.baseUrl}/users/me/avatar`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({ avatar })
    });
    return this._checkResponse<UserData>(res);
  }
}

const api = new Api({
  baseUrl: 'https://around-api.es.tripleten-services.com/v1', //import.meta.env.VITE_API_BASE_URL,
  headers: {
    authorization: 'd084ae1b-7690-4535-a6ba-80f2ca6a37a3', //import.meta.env.VITE_API_TOKEN,
    'Content-Type': 'application/json'
  }
});

export default api;