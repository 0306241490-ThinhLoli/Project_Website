import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from './AppContext';

function PrivateNotes() {
  const { profile } = useContext(AppContext);
  const isDark = profile.theme === 'dark';
  const cardBg = isDark ? '#2a2a2a' : '#fff';
  const borderColor = isDark ? '#444' : '#eee';

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, title: '', content: '' });

  const handleLogin = () => {
    fetch('http://localhost:5000/api/private/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordInput })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setIsUnlocked(true);
        fetchPrivateNotes();
      } else {
        alert("Sai mật khẩu, vui lòng thử lại!");
        setPasswordInput('');
      }
    })
    .catch(() => {
      if(passwordInput === '12345' || passwordInput === '1') {
        setIsUnlocked(true);
        fetchPrivateNotes();
      } else {
        alert("Sai mật khẩu (Mock), vui lòng thử lại!");
        setPasswordInput('');
      }
    });
  };

  const fetchPrivateNotes = () => {
    fetch('http://localhost:5000/api/private/notes')
      .then(res => res.json())
      .then(data => setNotes(Array.isArray(data) ? data : []))
      .catch(() => setNotes([]));
  };

  const handleSave = () => {
    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id 
      ? `http://localhost:5000/api/private/notes/${formData.id}`
      : `http://localhost:5000/api/private/notes`;

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: formData.title, content: formData.content })
    }).then((res) => {
      if(!res.ok) throw new Error("Mock");
      fetchPrivateNotes();
      setShowForm(false);
      setFormData({ id: null, title: '', content: '' });
    }).catch(() => {
        if(method === 'POST') {
            setNotes([...notes, { id: Date.now().toString(), title: formData.title, content: formData.content }]);
        } else {
            setNotes(notes.map(n => n.id === formData.id ? {...n, title: formData.title, content: formData.content} : n));
        }
        setShowForm(false);
        setFormData({ id: null, title: '', content: '' });
    });
  };

  const handleDelete = (id) => {
    if(window.confirm('Bạn có chắc muốn xóa ghi chú bí mật này?')) {
      fetch(`http://localhost:5000/api/private/notes/${id}`, { method: 'DELETE' })
        .then((res) => {
           if(!res.ok) throw new Error("Mock");
           fetchPrivateNotes();
        })
        .catch(() => setNotes(notes.filter(n => n.id !== id)));
    }
  };

  const openEdit = (note) => {
    setFormData({ id: note.id, title: note.title, content: note.content });
    setShowForm(true);
  };

  useEffect(() => {
      setIsUnlocked(false);
      setPasswordInput('');
  }, []);

  if (!isUnlocked) {
    return (
      <div style={{ padding: '20px', position: 'relative', height: '100vh', backgroundColor: 'transparent' }}>
        <div style={{ borderBottom: `1px solid ${borderColor}`, marginBottom: '20px', paddingBottom: '15px' }}>
          <h2 style={{ textAlign: 'center', margin: 0, fontSize: '18px' }}>Private Notes</h2>
        </div>
        
        {/* Fake locked notes */}
        <div style={{ filter: 'blur(4px)', opacity: 0.5, pointerEvents: 'none' }}>
          <div style={{ border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '15px', background: cardBg, marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 5px 0' }}>Private Diary Entry #1</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>🔒 Locked Private Content</p>
          </div>
          <div style={{ border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '15px', background: cardBg, marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 5px 0' }}>Secure Cryptokey Passphrase</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>🔒 Locked Private Content</p>
          </div>
        </div>

        {/* Modal Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: isDark ? '#222' : '#fff', padding: '30px 20px', borderRadius: '16px', width: '100%', maxWidth: '300px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: '30px', marginBottom: '10px' }}>🔒</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Enter Password</h3>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>Please enter your master secure password to unlock private notes.</p>
            
            <input 
              type="password" 
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)} 
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: isDark ? '#111' : '#f9f9f9', color: isDark ? '#fff' : '#000', marginBottom: '20px', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '2px' }}
            />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleLogin} style={{ flex: 1, padding: '12px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Unlock</button>
              <button style={{ flex: 1, padding: '12px', backgroundColor: 'transparent', color: isDark ? '#fff' : '#000', border: `1px solid ${borderColor}`, borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <button onClick={() => { setShowForm(false); setFormData({ id: null, title: '', content: '' }); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: isDark ? '#fff' : '#000' }}>←</button>
          <h2 style={{ margin: '0 auto', fontSize: '18px' }}>{formData.id ? 'Edit Private Note' : 'New Private Note'}</h2>
          <div style={{ width: '20px' }}></div>
        </div>

        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', marginBottom: '8px' }}>NOTE TITLE</div>
        <input 
          placeholder="Enter title..." value={formData.title} 
          onChange={e => setFormData({...formData, title: e.target.value})} 
          style={{ width: '100%', padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: cardBg, color: isDark ? '#fff' : '#000', marginBottom: '20px', boxSizing: 'border-box' }}
        />

        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', marginBottom: '8px' }}>CONTENT</div>
        <textarea 
          placeholder="Start typing secret..." value={formData.content} 
          onChange={e => setFormData({...formData, content: e.target.value})} 
          style={{ width: '100%', padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: cardBg, color: isDark ? '#fff' : '#000', height: '200px', resize: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSave} style={{ flex: 1, padding: '15px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
          <button onClick={() => { setShowForm(false); setFormData({ id: null, title: '', content: '' }); }} style={{ flex: 1, padding: '15px', backgroundColor: 'transparent', color: isDark ? '#fff' : '#000', border: `1px solid ${borderColor}`, borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: 'transparent' }}>
      <div style={{ borderBottom: `1px solid ${borderColor}`, marginBottom: '20px', paddingBottom: '15px' }}>
        <h2 style={{ textAlign: 'center', margin: 0, fontSize: '18px' }}>Private Notes</h2>
      </div>
      
      {/* Unlocked Session Banner */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px', background: isDark ? '#332b00' : '#fff9e6', border: `1px solid ${isDark ? '#554700' : '#ffeeba'}`, borderRadius: '8px', marginBottom: '20px', fontSize: '12px', color: isDark ? '#ffdb4d' : '#856404' }}>
        <span style={{ marginRight: '8px', fontSize: '14px' }}>🔓</span>
        Unlocked Session
      </div>

      {/* Danh sách */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {notes.length === 0 && <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>No private notes found.</p>}
        {notes.map(note => (
          <div key={note.id} style={{ border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '15px', background: cardBg, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '15px' }}>{note.title}</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(note)} style={{ background: 'none', border: `1px solid ${borderColor}`, borderRadius: '4px', padding: '4px', cursor: 'pointer', color: isDark ? '#aaa' : '#555' }}>✎</button>
                <button onClick={() => handleDelete(note.id)} style={{ background: 'none', border: `1px solid ${borderColor}`, borderRadius: '4px', padding: '4px', cursor: 'pointer', color: isDark ? '#aaa' : '#555' }}>🗑</button>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#888', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{note.content}</p>
          </div>
        ))}
      </div>

      <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '500px', pointerEvents: 'none', zIndex: 100 }}>
        <button 
          onClick={() => setShowForm(true)}
          style={{
            position: 'absolute',
            right: '20px',
            bottom: '0',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            border: 'none',
            fontSize: '24px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            cursor: 'pointer',
            pointerEvents: 'auto'
          }}>
          +
        </button>
      </div>
    </div>
  );
}

export default PrivateNotes;
