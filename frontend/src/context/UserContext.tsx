/**
 * User Context
 * Provides global state for the selected user
 */

import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types/user';

interface UserContextType {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

/**
 * UserProvider component
 * Wraps the app and provides user state to all children
 */
export function UserProvider({ children }: UserProviderProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ selectedUser, setSelectedUser }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook to access user context
 * Use this in any component to get/set the selected user
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
