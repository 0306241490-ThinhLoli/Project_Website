import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from './AppContext';

function Settings() {
  const { profile, setProfile } = useContext(AppContext);
  const [localProfile, setLocalProfile] = useState(profile);
  const isDark = profile.theme === 'dark';

  useEffect(() => {
    fetch('http://localhost:5000/api/profile')
      .then(res => res.json())
      .then(data => {
        setLocalProfile(data);
        setProfile(data);
      })
      .catch(err => console.log(err));
  }, [setProfile]);

  const handleChange = (e) => {
    setLocalProfile({ ...localProfile, [e.target.name]: e.target.value });
  };

  const handleThemeChange = (newTheme) => {
    setLocalProfile({ ...localProfile, theme: newTheme });
  };

  const handleSave = () => {
    fetch('http://localhost:5000/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(localProfile)
    })
    .then(res => res.json())
    .then(() => {
      alert("Lưu thành công!");
      setProfile(localProfile);
    })
    .catch(err => {
      alert("Lưu tạm thời (Frontend only)!");
      setProfile(localProfile);
    });
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '8px',
    border: `1px solid ${isDark ? '#444' : '#ddd'}`,
    backgroundColor: isDark ? '#222' : '#f9f9f9',
    color: isDark ? '#fff' : '#000',
    marginBottom: '10px',
    boxSizing: 'border-box',
    fontSize: '14px'
  };

  const sectionLabelStyle = {
    fontSize: '12px',
    fontWeight: '900',
    color: isDark ? '#ccc' : '#111',
    letterSpacing: '1px',
    marginBottom: '8px',
    marginTop: '25px',
    textTransform: 'uppercase'
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '18px' }}>Settings</h2>
      
      <div style={sectionLabelStyle}>USER PROFILE</div>
      <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>Display Name</label>
      <input name="displayName" value={localProfile.displayName} onChange={handleChange} style={inputStyle} />
      
      <div style={sectionLabelStyle}>THEME SWATCHES</div>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
        <div 
          onClick={() => handleThemeChange('light')}
          style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#fff', border: localProfile.theme === 'light' ? '2px solid #007bff' : '2px solid #ddd', cursor: 'pointer' }}
        ></div>
        <div 
          onClick={() => handleThemeChange('dark')}
          style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#1a1a1a', border: localProfile.theme === 'dark' ? '2px solid #007bff' : '2px solid #555', cursor: 'pointer' }}
        ></div>
      </div>

      <div style={sectionLabelStyle}>CHANGE PASSWORD</div>
      <label style={{ fontSize: '12px', marginBottom: '4px', display: 'block' }}>New Password</label>
      <input type="password" name="password" value={localProfile.password} onChange={handleChange} style={inputStyle} placeholder="••••••••" />
      
      <button onClick={handleSave} style={{ 
        width: '100%', 
        padding: '15px', 
        backgroundColor: '#1a1a1a', 
        color: '#fff', 
        border: 'none', 
        borderRadius: '8px', 
        marginTop: '30px',
        fontWeight: 'bold',
        cursor: 'pointer'
      }}>
        Save Changes
      </button>
    </div>
  );
}

export default Settings;
