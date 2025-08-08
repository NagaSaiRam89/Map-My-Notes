import React, { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { initGapiClient } from '../utils/GoogleDriveService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // ✅ Load the token from localStorage on initial render
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('google_access_token'));
  const [driveConnected, setDriveConnected] = useState(!!accessToken);

  const handleLogin = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/drive',
    onSuccess: async (tokenResponse) => {
      const token = tokenResponse.access_token;
      
      // ✅ Save the token to localStorage to persist the session
      localStorage.setItem('google_access_token', token);
      setAccessToken(token);
      
      try {
        await initGapiClient(token);
        setDriveConnected(true);
        toast.success('Google Drive Connected!');
      } catch (error) {
        toast.error('Failed to initialize Google Drive client.');
      }
    },
    onError: () => {
      toast.error('Google login failed.');
    }
  });

  const logout = () => {
    // ✅ Clear the token from state and localStorage
    localStorage.removeItem('google_access_token');
    setAccessToken(null);
    setDriveConnected(false);
    toast('Logged out successfully.');
  };

  const value = {
    accessToken,
    driveConnected,
    login: handleLogin,
    logout, // ✅ Expose the logout function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}