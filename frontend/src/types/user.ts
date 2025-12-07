/**
 * User Type
 * Based on database schema
 */

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  region: string | null;
  countryCode: string;
  timezone: string;
}

/**
 * Mock users for development
 */
export const mockUsers: User[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    address: '123 Main Street',
    city: 'New York',
    region: 'NY',
    countryCode: 'US',
    timezone: 'America/New_York',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    address: '456 Oak Avenue',
    city: 'Los Angeles',
    region: 'CA',
    countryCode: 'US',
    timezone: 'America/Los_Angeles',
  },
  {
    id: 3,
    firstName: 'Michael',
    lastName: 'Johnson',
    address: '789 Park Lane',
    city: 'London',
    region: null,
    countryCode: 'GB',
    timezone: 'Europe/London',
  },
  {
    id: 4,
    firstName: 'Sarah',
    lastName: 'Williams',
    address: '321 Elm Street',
    city: 'Toronto',
    region: 'ON',
    countryCode: 'CA',
    timezone: 'America/Toronto',
  },
  {
    id: 5,
    firstName: 'David',
    lastName: 'Brown',
    address: '654 Maple Drive',
    city: 'Sydney',
    region: 'NSW',
    countryCode: 'AU',
    timezone: 'Australia/Sydney',
  },
];
