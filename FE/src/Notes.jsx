import { useEffect, useMemo, useState } from 'react';

const API_URL = 'http://localhost:5000/api';
const PAGE_SIZE = 5;
const TOPICS = [
  { value: 'hoc-tap', label: 'Học tập' },
  { value: 'cong-viec', label: 'Công việc' },
  { value: 'ca-nhan', label: 'Cá nhân' },
];
const EMPTY_FORM = { id: null, title: '', content: '', topic: 'hoc-tap' };

const getNoteDate = (note) => note.updatedAt || note.createdAt || '';

function formatDate(note) {
  const value = getNoteDate(note);
  if (!value) return 'Chưa có ngày';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Chưa có ngày' : date.toLocaleDateString('vi-VN');
}

function NoteCard({ note, showCategory, onEdit, onDelete }) {
  const topic = TOPICS.find((item) => item.value === note.topic);

  return (
    <article className="note-card">
      <div className="note-card__header">
        <h3>{note.title}</h3>
        <div className="note-actions">
          <button className="icon-button" onClick={() => onEdit(note)} aria-label={`Sửa ${note.title}`}>✎</button>
          <button className="icon-button" onClick={() => onDelete(note)} aria-label={`Xóa ${note.title}`}>□</button>
        </div>
      </div>
      <p className="note-card__content">{note.content || 'Không có nội dung.'}</p>
      <div className="note-meta">
        <span>{formatDate(note)}</span>
        {showCategory && <span className="badge">{topic?.label || note.topic}</span>}
      </div>
    </article>
  );
}

export default function Notes({ isList = false }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [dateMode, setDateMode] = useState('all');
  const [dateValue, setDateValue] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();

    async function loadAllNotes() {
      setLoading(true);
      setError('');
      try {
        const results = await Promise.all(TOPICS.map(async (topic) => {
          const response = await fetch(`${API_URL}/notes/${topic.value}`, { signal: controller.signal });
          if (!response.ok) throw new Error('Không thể tải danh sách ghi chú.');
          const data = await response.json();
          return Array.isArray(data) ? data.map((note) => ({ ...note, topic: topic.value })) : [];
        }));
        setNotes(results.flat());
      } catch (loadError) {
        if (loadError.name !== 'AbortError') {
          setNotes([]);
          setError(loadError.message);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadAllNotes();
    return () => controller.abort();
  }, [refreshKey]);

  const filteredNotes = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase('vi');

    return [...notes]
      .filter((note) => {
        const text = `${note.title || ''} ${note.content || ''}`.toLocaleLowerCase('vi');
        const matchesKeyword = !normalizedKeyword || text.includes(normalizedKeyword);
        const matchesCategory = category === 'all' || note.topic === category;
        const isoDate = getNoteDate(note);
        let matchesDate = true;

        if (dateMode !== 'all' && dateValue) {
          if (!isoDate) return false;
          const date = new Date(isoDate);
          if (Number.isNaN(date.getTime())) return false;
          if (dateMode === 'day') matchesDate = isoDate.slice(0, 10) === dateValue;
          if (dateMode === 'month') matchesDate = isoDate.slice(0, 7) === dateValue;
          if (dateMode === 'year') matchesDate = String(date.getFullYear()) === dateValue;
        }

        return matchesKeyword && matchesCategory && matchesDate;
      })
      .sort((first, second) => {
        const firstTime = new Date(getNoteDate(first) || 0).getTime();
        const secondTime = new Date(getNoteDate(second) || 0).getTime();
        return sortOrder === 'newest' ? secondTime - firstTime : firstTime - secondTime;
      });
  }, [category, dateMode, dateValue, keyword, notes, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedNotes = filteredNotes.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function closeForm() {
    setShowForm(false);
    setFormData(EMPTY_FORM);
    setFormError('');
  }

  function openCreate() {
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  }

  function openEdit(note) {
    setFormData({ id: note.id, title: note.title || '', content: note.content || '', topic: note.topic });
    setFormError('');
    setShowForm(true);
  }

  async function handleSave(event) {
    event.preventDefault();
    const title = formData.title.trim();
    if (!title) {
      setFormError('Vui lòng nhập tiêu đề ghi chú.');
      return;
    }

    const method = formData.id ? 'PUT' : 'POST';
    const url = formData.id
      ? `${API_URL}/notes/${formData.topic}/${formData.id}`
      : `${API_URL}/notes/${formData.topic}`;
    setSaving(true);
    setFormError('');

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content: formData.content.trim() }),
      });
      if (!response.ok) throw new Error('Không thể lưu ghi chú.');
      closeForm();
      setRefreshKey((current) => current + 1);
    } catch (saveError) {
      setFormError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(note) {
    if (!window.confirm(`Xóa ghi chú "${note.title}"?`)) return;
    try {
      const response = await fetch(`${API_URL}/notes/${note.topic}/${note.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Không thể xóa ghi chú.');
      setNotes((current) => current.filter((item) => item.id !== note.id || item.topic !== note.topic));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function clearFilters() {
    setKeyword('');
    setCategory('all');
    setSortOrder('newest');
    setDateMode('all');
    setDateValue('');
    setPage(1);
  }

  if (showForm) {
    return (
      <section className="page">
        <header className="page-header page-header--form">
          <button className="back-button" onClick={closeForm} aria-label="Quay lại">←</button>
          <h1>{formData.id ? 'Edit Note' : 'New Note'}</h1>
        </header>

        <form className="note-form" onSubmit={handleSave}>
          <label htmlFor="note-category">CATEGORY</label>
          <select
            id="note-category"
            value={formData.topic}
            disabled={Boolean(formData.id)}
            onChange={(event) => setFormData({ ...formData, topic: event.target.value })}
          >
            {TOPICS.map((topic) => <option key={topic.value} value={topic.value}>{topic.label}</option>)}
          </select>

          <label htmlFor="note-title">NOTE TITLE</label>
          <input id="note-title" value={formData.title} onChange={(event) => setFormData({ ...formData, title: event.target.value })} placeholder="Enter title..." />

          <label htmlFor="note-content">CONTENT</label>
          <textarea id="note-content" value={formData.content} onChange={(event) => setFormData({ ...formData, content: event.target.value })} placeholder="Start typing..." />

          {formError && <p className="feedback feedback--error">{formError}</p>}
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
      <header className="page-header"><h1>{isList ? 'All Notes' : 'Standard Notes'}</h1></header>

      {isList && (
        <div className="filters" aria-label="Tìm kiếm và lọc ghi chú">
          <input className="search-input" value={keyword} onChange={(event) => { setKeyword(event.target.value); setPage(1); }} placeholder="Tìm trong tiêu đề hoặc nội dung..." />
          <div className="filter-row">
            <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>
              <option value="all">Tất cả phân loại</option>
              {TOPICS.map((topic) => <option key={topic.value} value={topic.value}>{topic.label}</option>)}
            </select>
            <select aria-label="Sắp xếp theo thời gian" value={sortOrder} onChange={(event) => { setSortOrder(event.target.value); setPage(1); }}>
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
          <div className="filter-row">
            <select value={dateMode} onChange={(event) => { setDateMode(event.target.value); setDateValue(''); setPage(1); }}>
              <option value="all">Tất cả thời gian</option>
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>
            {dateMode !== 'all' && (
              <input
                aria-label="Giá trị thời gian"
                type={dateMode === 'day' ? 'date' : dateMode === 'month' ? 'month' : 'number'}
                min={dateMode === 'year' ? '2000' : undefined}
                max={dateMode === 'year' ? '2100' : undefined}
                placeholder={dateMode === 'year' ? 'Nhập năm' : undefined}
                value={dateValue}
                onChange={(event) => { setDateValue(event.target.value); setPage(1); }}
              />
            )}
            <button className="text-button" type="button" onClick={clearFilters}>Xóa bộ lọc</button>
          </div>
          <p className="result-count">{filteredNotes.length} ghi chú phù hợp</p>
        </div>
      )}

      {loading && <div className="state-message">Đang tải ghi chú...</div>}
      {!loading && error && <div className="state-message state-message--error">{error}</div>}

      {!loading && !error && notes.length === 0 && (
        <div className="empty-state">
          <span aria-hidden="true">▱</span>
          <h2>Chưa có ghi chú</h2>
          <p>{isList ? 'Các ghi chú đã lưu sẽ xuất hiện tại đây.' : 'Nhấn nút + để tạo ghi chú đầu tiên.'}</p>
        </div>
      )}

      {!loading && !error && notes.length > 0 && isList && filteredNotes.length === 0 && (
        <div className="empty-state"><span aria-hidden="true">⌕</span><h2>Không tìm thấy ghi chú</h2><p>Hãy đổi từ khóa hoặc điều kiện lọc.</p><button className="text-button" onClick={clearFilters}>Xóa bộ lọc</button></div>
      )}

      {!loading && !error && !isList && notes.length > 0 && (
        <div className="category-list">
          {TOPICS.map((topic) => {
            const topicNotes = notes.filter((note) => note.topic === topic.value);
            return (
              <section className="category-group" key={topic.value}>
                <div className="category-group__title"><h2>{topic.label}</h2><span>{topicNotes.length}</span></div>
                {topicNotes.length === 0
                  ? <p className="category-empty">Chưa có ghi chú trong phân loại này.</p>
                  : topicNotes.map((note) => <NoteCard key={`${note.topic}-${note.id}`} note={note} onEdit={openEdit} onDelete={handleDelete} />)}
              </section>
            );
          })}
        </div>
      )}

      {!loading && !error && isList && filteredNotes.length > 0 && (
        <>
          <div className="note-list">
            {paginatedNotes.map((note) => <NoteCard key={`${note.topic}-${note.id}`} note={note} showCategory onEdit={openEdit} onDelete={handleDelete} />)}
          </div>
          <nav className="pagination" aria-label="Phân trang ghi chú">
            <button disabled={currentPage === 1} onClick={() => setPage((current) => current - 1)}>Trước</button>
            <span>Trang {currentPage}/{totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setPage((current) => current + 1)}>Sau</button>
          </nav>
        </>
      )}

      {!isList && <button className="fab" onClick={openCreate} aria-label="Tạo ghi chú">+</button>}
    </section>
  );
}
