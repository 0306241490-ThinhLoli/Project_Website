import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Settings from './Settings';
import Notes from './Notes';
import PrivateNotes from './PrivateNotes';
import { AppContext } from './AppContext';

function Layout({ children }) {
  const { profile } = useContext(AppContext);

  // Viết logic CSS cơ bản để khi state theme thay đổi, màu nền của Layout sẽ đổi theo
  const isDark = profile.theme === 'dark';
  const bgColor = isDark ? '#333' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  useEffect(() => {
    document.body.style.backgroundColor = bgColor;
    document.body.style.color = textColor;
  }, [bgColor, textColor]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: bgColor, color: textColor }}>
      {/* Vẽ Layout chung: Sidebar (chứa các link điều hướng) */}
      <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '20px' }}>
        <h2>Menu</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '10px' }}><Link to="/" style={{ color: textColor }}>Home (Trang chủ)</Link></li>
          <li style={{ marginBottom: '10px' }}><Link to="/private" style={{ color: textColor }}>Vùng kín</Link></li>
          <li style={{ marginBottom: '10px' }}><Link to="/settings" style={{ color: textColor }}>Cài đặt</Link></li>
        </ul>
      </div>

      {/* Content (vùng hiển thị trang) */}
      <div style={{ flex: 1, padding: '20px' }}>
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        {/* cấu hình 3 route trống: / (Home), /settings (Cài đặt), /private (Vùng kín) */}
        <Routes>
          <Route path="/" element={<Notes />} />
          <Route path="/private" element={<PrivateNotes />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
