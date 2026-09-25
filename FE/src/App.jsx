import { useContext } from 'react';
import {
  BrowserRouter as Router,
  Link,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { AppContext } from './AppState';
import Notes from './Notes';
import PrivateNotes from './PrivateNotes';
import Settings from './Settings';
import './App.css';

const NAV_ITEMS = [
  { path: '/', label: 'Main', icon: 'home' },
  { path: '/list', label: 'List', icon: 'list' },
  { path: '/private', label: 'Private', icon: 'shield' },
  { path: '/settings', label: 'Setting', icon: 'settings' },
];

function NavIcon({ name }) {
  const commonProps = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  if (name === 'home') {
    return (
      <svg {...commonProps}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5M9 21v-7h6v7" />
      </svg>
    );
  }

  if (name === 'list') {
    return (
      <svg {...commonProps}>
        <path d="M9 6h12M9 12h12M9 18h12" />
        <path d="M4 6h.01M4 12h.01M4 18h.01" strokeWidth="4" />
      </svg>
    );
  }

  if (name === 'shield') {
    return (
      <svg {...commonProps}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="M9.5 12h5M10 12V9.5a2 2 0 0 1 4 0V12" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.05.05-2.86 2.86-.05-.05A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21h-4v-.05A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.88.34l-.05.05-2.86-2.86.05-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3v-4h.05A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.05-.05 2.86-2.86.05.05A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3h4v.05A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.88-.34l.05-.05 2.86 2.86-.05.05A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21v4h-.05A1.7 1.7 0 0 0 19.4 15Z" />
    </svg>
  );
}

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="bottom-nav" aria-label="Điều hướng chính">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            className={`nav-item${isActive ? ' nav-item--active' : ''}`}
            key={item.path}
            to={item.path}
          >
            <span className="nav-icon" aria-hidden="true"><NavIcon name={item.icon} /></span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Layout({ children }) {
  const { profile } = useContext(AppContext);
  const style = { '--primary-color': profile.primaryColor || '#111827' };

  return (
    <div className={`app-shell theme-${profile.theme}`} style={style}>
      <main className="app-content">{children}</main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Notes />} />
          <Route path="/list" element={<Notes isList />} />
          <Route path="/private" element={<PrivateNotes />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Notes />} />
        </Routes>
      </Layout>
    </Router>
  );
}
