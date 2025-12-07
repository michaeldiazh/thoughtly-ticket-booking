/**
 * User Selector Component
 * Dropdown for selecting a user
 */

import { useEffect, useState } from 'react';
import { getUsers } from '../services/api';
import type { SimplifiedUser } from '../types/user';
import './UserSelector.css';

interface UserSelectorProps {
  selectedUserId: number | null;
  onUserChange: (user: SimplifiedUser | null) => void;
}

export function UserSelector({ selectedUserId, onUserChange }: UserSelectorProps) {
  const [users, setUsers] = useState<SimplifiedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError(null);
        const response = await getUsers();
        
        if (response.status === 'OK' && response.data) {
          setUsers(response.data);
        } else {
          setError(response.error?.message || 'Failed to load users');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = Number(e.target.value);
    const user = users.find((u) => u.id === userId) || null;
    onUserChange(user);
  };

  if (loading) {
    return (
      <div className="user-selector">
        <label htmlFor="user-select">Select a user:</label>
        <select id="user-select" disabled>
          <option value="">Loading users...</option>
        </select>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-selector">
        <label htmlFor="user-select">Select a user:</label>
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="user-selector">
      <label htmlFor="user-select">Select a user:</label>
      <select
        id="user-select"
        value={selectedUserId || ''}
        onChange={handleChange}
      >
        <option value="">-- Choose a user --</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.firstName} {user.lastName} ({user.city}, {user.countryCode})
          </option>
        ))}
      </select>
    </div>
  );
}
