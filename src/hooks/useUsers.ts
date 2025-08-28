import { useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  lastActive: string;
  totalSessions: number;
  totalTokens: number;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://aira-metrics.onwavemaker.com/users');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      
      // Fallback to mock data
      setUsers([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          lastActive: '2024-01-15T10:30:00Z',
          totalSessions: 25,
          totalTokens: 15000
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          lastActive: '2024-01-14T15:45:00Z',
          totalSessions: 18,
          totalTokens: 12000
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refetch = () => {
    fetchUsers();
  };

  return {
    users,
    loading,
    error,
    refetch
  };
}