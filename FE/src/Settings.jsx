import { useContext, useState } from 'react';
import { AppContext } from './AppState';

const COLORS = ['#111827', '#475569', '#2563eb', '#7c3aed', '#db2777'];

function SettingsForm({ profile, setProfile }) {
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    theme: profile.theme || 'light',
    primaryColor: profile.primaryColor || '#111827',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
    setMessage('');
  }

  async function handleSave(event) {
    event.preventDefault();
    const changingPassword = Boolean(formData.newPassword || formData.confirmPassword);

    if (!formData.displayName.trim()) {
      setMessage('Vui lòng nhập tên hiển thị.');
      return;
    }
    if (changingPassword && profile.password && formData.currentPassword !== profile.password) {
      setMessage('Mật khẩu hiện tại không đúng.');
      return;
    }
    if (changingPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    const updatedProfile = {
      ...profile,
      displayName: formData.displayName.trim(),
      theme: formData.theme,
      primaryColor: formData.primaryColor,
      password: changingPassword ? formData.newPassword : profile.password,
    };

    setSaving(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });
      if (!response.ok) throw new Error('Không thể lưu cài đặt.');

      setProfile(updatedProfile);
      setFormData((current) => ({
        ...current,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setMessage('Đã lưu thay đổi thành công.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page">
      <header className="page-header"><h1>Settings</h1></header>
      <form className="settings-form" onSubmit={handleSave}>
        <p className="section-label">USER PROFILE</p>
        <label htmlFor="displayName">Display Name</label>
        <input id="displayName" name="displayName" value={formData.displayName} onChange={handleChange} />

        <p className="section-label">THEME</p>
        <label htmlFor="theme">Display Mode</label>
        <select id="theme" name="theme" value={formData.theme} onChange={handleChange}>
          <option value="light">Sáng</option>
          <option value="dark">Tối</option>
        </select>

        <label>PRIMARY COLOR</label>
        <div className="theme-swatches" role="group" aria-label="Màu chủ đạo">
          {COLORS.map((color) => (
            <button
              className={`swatch${formData.primaryColor === color ? ' swatch--active' : ''}`}
              key={color}
              type="button"
              style={{ backgroundColor: color }}
              onClick={() => setFormData({ ...formData, primaryColor: color })}
              aria-label={`Chọn màu ${color}`}
            />
          ))}
        </div>

        <p className="section-label">CHANGE PASSWORD</p>
        {profile.password && (
          <>
            <label htmlFor="currentPassword">Current Password</label>
            <input id="currentPassword" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleChange} />
          </>
        )}
        <label htmlFor="newPassword">New Password</label>
        <input id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} />
        <label htmlFor="confirmPassword">Confirm New Password</label>
        <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} />

        {message && <p className={`settings-message${message.includes('thành công') ? '' : ' feedback--error'}`}>{message}</p>}
        <button className="button button--primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </section>
  );
}

export default function Settings() {
  const { profile, setProfile, profileLoading } = useContext(AppContext);

  if (profileLoading) {
    return <section className="page"><header className="page-header"><h1>Settings</h1></header><div className="state-message">Đang tải cài đặt...</div></section>;
  }

  const formKey = `${profile.displayName}-${profile.theme}-${profile.primaryColor}-${profile.password}`;
  return <SettingsForm key={formKey} profile={profile} setProfile={setProfile} />;
}
