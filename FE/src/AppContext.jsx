import { useEffect, useState } from 'react';
import { AppContext } from './AppState';

const DEFAULT_PROFILE = {
  displayName: '',
  theme: 'light',
  primaryColor: '#111827',
  password: '',
};

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProfile() {
      try {
        const response = await fetch('http://localhost:5000/api/profile', {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Không thể tải thông tin cài đặt.');
        const data = await response.json();
        setProfile({ ...DEFAULT_PROFILE, ...data });
      } catch (error) {
        if (error.name !== 'AbortError') setProfile(DEFAULT_PROFILE);
      } finally {
        if (!controller.signal.aborted) setProfileLoading(false);
      }
    }

    loadProfile();
    return () => controller.abort();
  }, []);

  return (
    <AppContext.Provider value={{ profile, setProfile, profileLoading }}>
      {children}
    </AppContext.Provider>
  );
}
