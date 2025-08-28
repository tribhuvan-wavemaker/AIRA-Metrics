import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email?: string;
}

export function useUsers() {
  const [users, setUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use proxy in development, direct API in production
        const apiUrl = import.meta.env.DEV 
          ? '/api/users' 
          : 'https://aira-metrics.onwavemaker.com/users';
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Handle different possible response formats
        let userList: string[] = [];
        
        if (Array.isArray(data)) {
          // If data is directly an array
          userList = data.map(user => {
            if (typeof user === 'string') {
              return toTitleCase(user);
            } else if (user && typeof user === 'object') {
              // If user is an object, try to get name, username, or email
              const userName = user.name || user.username || user.email || user.id || String(user);
              return toTitleCase(userName);
            }
            return toTitleCase(String(user));
          });
        } else if (data && data.users && Array.isArray(data.users)) {
          // If data has a users property
          userList = data.users.map((user: any) => {
            if (typeof user === 'string') {
              return toTitleCase(user);
            } else if (user && typeof user === 'object') {
              const userName = user.name || user.username || user.email || user.id || String(user);
              return toTitleCase(userName);
            }
            return toTitleCase(String(user));
          });
        } else {
          throw new Error('Unexpected API response format');
        }
        
        // Remove duplicates and sort
        const uniqueUsers = [...new Set(userList)].sort();
        setUsers(uniqueUsers);
        
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
        // Fallback to mock data users in title case
        const mockUsers = ['John Doe', 'Sarah Wilson', 'Mike Chen', 'Emily Rodriguez', 'Alex Turner'];
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
}