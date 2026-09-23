import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from './AppContext';

function Notes({ isList = false }) {
  const { profile } = useContext(AppContext);
  const isDark = profile.theme === 'dark';
  const cardBg = isDark ? '#222' : '#f9f9f9'; // Nền hơi xám xíu
  const borderColor = isDark ? '#333' : '#eee';
  
  const [topic, setTopic] = useState('hoc-tap'); // Giữ state để gọi API, nhưng sẽ ẩn trên UI
  const [notes, setNotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, title: '', content: '' });

  const fetchNotes = () => {
    fetch(`http://localhost:5000/api/notes/${topic}`)
      .then(res => res.json())
      .then(data => setNotes(Array.isArray(data) ? data : []))
      .catch(() => setNotes([]));
  };

  useEffect(() => { fetchNotes(); }, [topic]);

  const handleSave = () => {
    const method = formData.id ? 'PUT' : 'POST';
    const currentTopic = formData.topic || topic;
    const url = formData.id 
      ? `http://localhost:5000/api/notes/${currentTopic}/${formData.id}`
      : `http://localhost:5000/api/notes/${currentTopic}`;

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: formData.title, content: formData.content })
    })
    .then(res => {
      if(!res.ok) throw new Error('Mock fallback');
      return res.json();
    })
    .then(() => {
      fetchNotes();
      setShowForm(false);
      setFormData({ id: null, title: '', content: '' }); 
    })
    .catch(() => {
      // Mock if backend off
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
    if(window.confirm('Bạn có chắc muốn xóa ghi chú này?')) {
      fetch(`http://localhost:5000/api/notes/${topic}/${id}`, { method: 'DELETE' })
        .then(res => {
           if(!res.ok) throw new Error('Mock fallback');
           fetchNotes();
        })
        .catch(() => setNotes(notes.filter(n => n.id !== id)));
    }
  };

  const openEdit = (note) => {
    setFormData({ id: note.id, title: note.title, content: note.content });
    setShowForm(true);
  };

  if (showForm) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
          <button onClick={() => { setShowForm(false); setFormData({ id: null, title: '', content: '' }); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: isDark ? '#fff' : '#000' }}>
            ←
          </button>
          <h2 style={{ margin: '0 auto', fontSize: '18px' }}>{formData.id ? 'Edit Note' : 'New Note'}</h2>
          <div style={{ width: '20px' }}></div>
        </div>

        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', marginBottom: '8px' }}>CATEGORY</div>
        <select 
          value={formData.topic || topic} 
          onChange={e => setFormData({...formData, topic: e.target.value})}
          style={{ width: '100%', padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: cardBg, color: isDark ? '#fff' : '#000', marginBottom: '20px', boxSizing: 'border-box' }}
        >
          <option value="hoc-tap">Học tập</option>
          <option value="cong-viec">Công việc</option>
          <option value="ca-nhan">Cá nhân</option>
        </select>

        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', marginBottom: '8px' }}>NOTE TITLE</div>
        <input 
          placeholder="Enter title..." value={formData.title} 
          onChange={e => setFormData({...formData, title: e.target.value})} 
          style={{ width: '100%', padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: cardBg, color: isDark ? '#fff' : '#000', marginBottom: '20px', boxSizing: 'border-box' }}
        />

        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#888', marginBottom: '8px' }}>CONTENT</div>
        <textarea 
          placeholder="Start typing..." value={formData.content} 
          onChange={e => setFormData({...formData, content: e.target.value})} 
          style={{ width: '100%', padding: '12px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: cardBg, color: isDark ? '#fff' : '#000', height: '200px', resize: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleSave} style={{ flex: 1, padding: '15px', backgroundColor: '#1a1a1a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Save
          </button>
          <button onClick={() => { setShowForm(false); setFormData({ id: null, title: '', content: '' }); }} style={{ flex: 1, padding: '15px', backgroundColor: 'transparent', color: isDark ? '#fff' : '#000', border: `1px solid ${borderColor}`, borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ borderBottom: `1px solid ${borderColor}`, marginBottom: '20px', paddingBottom: '15px' }}>
        <h2 style={{ textAlign: 'center', margin: 0, fontSize: '18px' }}>
          {isList ? 'All Notes' : 'Standard Notes'}
        </h2>
      </div>
      
      {/* Filters */}
      {isList && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <select value={topic} onChange={(e) => setTopic(e.target.value)} style={{ padding: '8px', borderRadius: '20px', border: `1px solid ${borderColor}`, background: cardBg, color: isDark ? '#fff' : '#000', fontSize: '12px' }}>
            <option value="hoc-tap">Học tập</option>
            <option value="cong-viec">Công việc</option>
            <option value="ca-nhan">Cá nhân</option>
          </select>
          <div style={{ fontSize: '12px', padding: '8px', border: `1px solid ${borderColor}`, borderRadius: '20px' }}>Sort by: Date</div>
        </div>
      )}

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {notes.length === 0 && <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>No notes found.</p>}
        {notes.map(note => (
          <div key={note.id} style={{ border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '15px', background: cardBg, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '15px' }}>{note.title}</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(note)} style={{ background: 'none', border: `1px solid ${borderColor}`, borderRadius: '4px', padding: '4px', cursor: 'pointer', color: isDark ? '#aaa' : '#555' }}>
                  ✎
                </button>
                <button onClick={() => handleDelete(note.id)} style={{ background: 'none', border: `1px solid ${borderColor}`, borderRadius: '4px', padding: '4px', cursor: 'pointer', color: isDark ? '#aaa' : '#555' }}>
                  🗑
                </button>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: '#888', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {note.content}
            </p>
            {isList && <div style={{ fontSize: '10px', color: '#aaa', marginTop: '10px', textTransform: 'uppercase' }}>STANDARD</div>}
          </div>
        ))}
      </div>

      {/* FAB */}
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

export default Notes;
