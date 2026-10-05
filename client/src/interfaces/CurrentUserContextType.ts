import type { UserData, ProfileFormData } from './UserData';
import type { CardFormData } from './CardData';

export interface CurrentUserContextType {
  currentUser: UserData | null;
  handleUpdateUser: (data: ProfileFormData) => void;
  handleUpdateAvatar: (avatarUrl: string) => void;
  handleAddPlaceSubmit: (data: CardFormData) => void;
}