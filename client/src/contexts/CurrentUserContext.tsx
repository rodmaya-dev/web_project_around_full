import { createContext } from 'react';
import type { CurrentUserContextType } from '../interfaces/CurrentUserContextType';

const CurrentUserContext = createContext<CurrentUserContextType>({} as CurrentUserContextType);

export default CurrentUserContext;