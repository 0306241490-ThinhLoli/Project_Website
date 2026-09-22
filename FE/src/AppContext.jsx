import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Tạo AppContext (Context API) để lưu trạng thái toàn cục: displayName và theme ('light' / 'dark').
  const [profile, setProfile] = useState({
    displayName: '',
    theme: 'light',
    password: ''
  });

  return (
    <AppContext.Provider value={{ profile, setProfile }}>
      {children}
    </AppContext.Provider>
  );
};
