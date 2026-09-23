import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Settings from './Settings';
import Notes from './Notes';
import PrivateNotes from './PrivateNotes';
import { AppContext } from './AppContext';

function BottomNav() {
  const { profile } = useContext(AppContext);
  const location = useLocation();
  const isDark = profile.theme === 'dark';
  const navBg = isDark ? '#121212' : '#ffffff';
  const iconColor = isDark ? '#888' : '#888';
  const activeColor = isDark ? '#fff' : '#000';

  const navItems = [
    { path: '/', label: 'Main', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    )},
    { path: '/list', label: 'List', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
      </svg>
    )},
    { path: '/private', label: 'Private', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    )},
    { path: '/settings', label: 'Setting', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    )}
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '500px',
      height: '70px',
      backgroundColor: navBg,
      borderTop: `1px solid ${isDark ? '#333' : '#eee'}`,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000
    }}>
      {navItems.map(item => {
        const isActive = location.pathname === item.path;
        return (
          <Link key={item.label} to={item.path} style={{
            textDecoration: 'none',
            color: isActive ? activeColor : iconColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '11px',
            fontWeight: isActive ? '600' : '400'
          }}>
            <div style={{ marginBottom: '4px' }}>
              {React.cloneElement(item.icon, { stroke: isActive ? activeColor : iconColor })}
            </div>
            {item.label}
          </Link>
        )
      })}
    </div>
  );
}

function Layout({ children }) {
  const { profile } = useContext(AppContext);
  const isDark = profile.theme === 'dark';
  const bgColor = isDark ? '#121212' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#1a1a1a';

  useEffect(() => {
    document.body.style.backgroundColor = isDark ? '#000' : '#ffffff';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    
    const root = document.getElementById('root');
    if (root) {
      root.style.width = '100%';
      root.style.margin = '0';
      root.style.padding = '0';
      root.style.display = 'flex';
      root.style.justifyContent = 'center';
    }
  }, [isDark]);

  return (
    <div style={{ 
      backgroundColor: bgColor, 
      color: textColor,
      width: '100%',
      maxWidth: '500px',
      minHeight: '100vh',
      position: 'relative',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      overflowX: 'hidden'
    }}>
      <div style={{ paddingBottom: '90px', minHeight: '100vh', boxSizing: 'border-box' }}>
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Notes />} />
          <Route path="/list" element={<Notes isList={true} />} />
          <Route path="/private" element={<PrivateNotes />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
