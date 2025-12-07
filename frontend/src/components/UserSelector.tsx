/**
 * User Selector Component
 * Dropdown for selecting a user
 */

import { mockUsers } from '../types/user';
import type { User } from '../types/user';
import './UserSelector.css';

interface UserSelectorProps {
  selectedUserId: number | null;
  onUserChange: (user: User | null) => void;
}

export function UserSelector({ selectedUserId, onUserChange }: UserSelectorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = Number(e.target.value);
    const user = mockUsers.find((u) => u.id === userId) || null;
    onUserChange(user);
  };

  return (
    <div className="user-selector">
      <label htmlFor="user-select">Select a user:</label>
      <select
        id="user-select"
        value={selectedUserId || ''}
        onChange={handleChange}
      >
        <option value="">-- Choose a user --</option>
        {mockUsers.map((user) => (
          <option key={user.id} value={user.id}>
            {user.firstName} {user.lastName} ({user.city}, {user.countryCode})
          </option>
        ))}
      </select>
    </div>
  );
}
