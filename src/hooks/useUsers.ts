import { useState, useEffect } from 'react';

interface ApiUser {
  user_name: string;
  last_active_time: string;
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
          // If data is directly an array of user objects
          userList = data.map((user: ApiUser | string) => {
            if (typeof user === 'string') {
              return toTitleCase(user);
            } else if (user && typeof user === 'object' && 'user_name' in user) {
              // New API format with user_name property
              return toTitleCase(user.user_name);
            } else if (user && typeof user === 'object') {
              // Fallback for other object formats
              const userName = (user as any).name || (user as any).username || (user as any).email || (user as any).id || String(user);
              return toTitleCase(userName);
            }
            return toTitleCase(String(user));
          });
        } else if (data && data.users && Array.isArray(data.users)) {
          // If data has a users property
          userList = data.users.map((user: ApiUser | string | any) => {
            if (typeof user === 'string') {
              return toTitleCase(user);
            } else if (user && typeof user === 'object' && 'user_name' in user) {
              return toTitleCase(user.user_name);
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
        const mockUsers = ['John Doe', 'Eshwar', 'Raviteja Dugge', 'Shaik Rafiq', 'Likhith Chennareddy', 'Praveen Pokuri', 'Ramarao Pramudula', 'Madhu Gopal', 'Sainath Gundu'];
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
}