// components/welcome-header.tsx
'use client';

import { useEffect, useState } from 'react';
import { OrganizationSwitcher } from "@/components/organization-switcher";

interface WelcomeHeaderProps {
  organizationName?: string;
}

export function WelcomeHeader({ organizationName }: WelcomeHeaderProps) {
  const [currentDate, setCurrentDate] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Set current date
    const date = new Date();
    setCurrentDate(date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));

    // Get username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    // Listen for user updates
    const handleUserChange = () => {
      const updatedUsername = localStorage.getItem('username');
      if (updatedUsername) {
        setUsername(updatedUsername);
      }
    };

    window.addEventListener('userChanged', handleUserChange);
    return () => window.removeEventListener('userChanged', handleUserChange);
  }, []);

  return (
    <div className="flex justify-between items-center p-6  ">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome{username ? ` ${username}` : ''}{organizationName ? ` to ${organizationName}` : ''}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Today is {currentDate}</p>
      </div>
      <div>
        <OrganizationSwitcher />
      </div>
    </div>
  );
}