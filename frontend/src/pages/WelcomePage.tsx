/**
 * Welcome Page
 * Simple welcome page with user selection dropdown
 */

import { useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { UserSelector } from '../components/UserSelector';
import './WelcomePage.css';

interface WelcomePageProps {
  onUserSelected: () => void;
}

export function WelcomePage({ onUserSelected }: WelcomePageProps) {
  const { selectedUser, setSelectedUser } = useUser();

  // Navigate to events page when user is selected
  useEffect(() =>  (selectedUser ? onUserSelected() : undefined), [selectedUser, onUserSelected]);

  return (
    <div className="welcome-container">
      <div className="welcome-box">
        <h1>Welcome!</h1>
        <UserSelector
          selectedUserId={selectedUser?.id || null}
          onUserChange={setSelectedUser}
        />
        {selectedUser && (
          <div className="selected-user">
            <p>Signed in as: <strong>{selectedUser.firstName} {selectedUser.lastName}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}
