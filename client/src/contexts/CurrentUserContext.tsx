//client/src/contexts/CurrentUserContext.tsx

import { createContext } from 'react';
import type { CurrentUserContextType } from '../types/CurrentUserContextType';

const CurrentUserContext = createContext<CurrentUserContextType>({} as CurrentUserContextType);

export default CurrentUserContext;