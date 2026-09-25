import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from './AppState';

const API_URL = 'http://localhost:5000/api/private';
const EMPTY_FORM = { id: null, title: '', content: '' };

export default function PrivateNotes() {
  const { profile, profileLoading } = useContext(AppContext);
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function fetchPrivateNotes() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/notes`);
      if (!response.ok) throw new Error('Không thể tải ghi chú riêng tư.');
      const data = await response.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setNotes([]);
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (!passwordInput) {
      setAuthError('Vui lòng nhập mật khẩu.');
      return;
    }

    setAuthenticating(true);
    setAuthError('');
    try {
      const response = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Sai mật khẩu.');

      setIsUnlocked(true);
      setPasswordInput('');
      await fetchPrivateNotes();
    } catch (loginError) {
      setPasswordInput('');
      setAuthError(loginError.message);
    } finally {
      setAuthenticating(false);
    }
  }

  function closeForm() {
    setShowForm(false);
    setFormData(EMPTY_FORM);
    setError('');
  }

  function openEdit(note) {
    setFormData({ id: note.id, title: note.title || '', content: note.content || '' });
    setShowForm(true);
    setError('');
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề ghi chú.');
      return;
    }

    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id ? `${API_URL}/notes/${formData.id}` : `${API_URL}/notes`;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title.trim(), content: formData.content.trim() }),
      });
      if (!response.ok) throw new Error('Không thể lưu ghi chú riêng tư.');
      closeForm();
      await fetchPrivateNotes();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(note) {
    if (!window.confirm(`Xóa ghi chú riêng tư "${note.title}"?`)) return;
    try {
      const response = await fetch(`${API_URL}/notes/${note.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Không thể xóa ghi chú riêng tư.');
      setNotes((current) => current.filter((item) => item.id !== note.id));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  if (profileLoading) {
    return <section className="page"><header className="page-header"><h1>Private Notes</h1></header><div className="state-message">Đang tải cài đặt...</div></section>;
  }

  if (!profile.password) {
    return (
      <section className="page">
        <header className="page-header"><h1>Private Notes</h1></header>
        <div className="empty-state">
          <span aria-hidden="true">◇</span>
          <h2>Chưa thiết lập mật khẩu</h2>
          <p>Bạn cần tạo mật khẩu trong Settings trước khi tạo ghi chú riêng tư.</p>
          <Link className="text-button" to="/settings">Đi đến Settings</Link>
        </div>
      </section>
    );
  }

  if (!isUnlocked) {
    return (
      <section className="page">
        <header className="page-header"><h1>Private Notes</h1></header>
        <div className="private-backdrop">
          <div className="locked-preview" aria-hidden="true">
            <article className="note-card"><h3>Private Diary Entry #1</h3><p className="note-card__content">Locked Private Content</p></article>
            <article className="note-card"><h3>Secure Cryptokey Passphrase</h3><p className="note-card__content">Locked Private Content</p></article>
          </div>
          <div className="modal-layer">
            <form className="modal" onSubmit={handleLogin}>
              <span aria-hidden="true">♙</span>
              <h2>Enter Password</h2>
              <p>Please enter your secure password to unlock private notes.</p>
              <input type="password" value={passwordInput} onChange={(event) => setPasswordInput(event.target.value)} placeholder="••••••••" autoFocus />
              {authError && <p className="feedback feedback--error">{authError}</p>}
              <div className="form-actions">
                <button className="button button--primary" type="submit" disabled={authenticating}>{authenticating ? 'Checking...' : 'Unlock'}</button>
                <button className="button button--secondary" type="button" onClick={() => navigate('/')}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    );
  }

  if (showForm) {
    return (
      <section className="page">
        <header className="page-header page-header--form"><button className="back-button" onClick={closeForm}>←</button><h1>{formData.id ? 'Edit Private Note' : 'New Private Note'}</h1></header>
        <form className="note-form" onSubmit={handleSave}>
          <label htmlFor="private-title">NOTE TITLE</label>
          <input id="private-title" value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} placeholder="Enter title..." />
          <label htmlFor="private-content">CONTENT</label>
          <textarea id="private-content" value={formData.content} onChange={(event) => setFormData({ ...formData, content: event.target.value })} placeholder="Start typing secret..." />
          {error && <p className="feedback feedback--error">{error}</p>}
          <div className="form-actions">
            <button className="button button--primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button className="button button--secondary" type="button" onClick={closeForm}>Cancel</button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="page">
      <header className="page-header"><h1>Private Notes</h1></header>
      <div className="unlock-banner">◇ Unlocked Session</div>
      {loading && <div className="state-message">Đang tải ghi chú...</div>}
      {!loading && error && <div className="state-message state-message--error">{error}</div>}
      {!loading && !error && notes.length === 0 && <div className="empty-state"><span>▱</span><h2>Chưa có ghi chú riêng tư</h2><p>Nhấn nút + để tạo ghi chú đầu tiên.</p></div>}
      {!loading && !error && notes.length > 0 && (
        <div className="note-list">
          {notes.map((note) => (
            <article className="note-card" key={note.id}>
              <div className="note-card__header"><h3>{note.title}</h3><div className="note-actions"><button className="icon-button" onClick={() => openEdit(note)}>✎</button><button className="icon-button" onClick={() => handleDelete(note)}>□</button></div></div>
              <p className="note-card__content">{note.content || 'Không có nội dung.'}</p>
            </article>
          ))}
        </div>
      )}
      <button className="fab" onClick={() => setShowForm(true)} aria-label="Tạo ghi chú riêng tư">+</button>
    </section>
  );
}
