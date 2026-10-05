import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import type { Message } from '../types';

const links = [
  { to: '/', label: 'Home' },
  { to: '/browse', label: 'Find Work' },
  { to: '/driver', label: '🚘 Driver' },
  { to: '/chat', label: 'Messages' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [incomingMessage, setIncomingMessage] = useState<(Message & { senderName?: string }) | null>(null);
  const alertTimer = useRef<number | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user?.id) return;

    const handleIncomingMessage = (message: Message & { senderName?: string }) => {
      if (message.senderId === user.id) return;
      setIncomingMessage(message);
      if (alertTimer.current) window.clearTimeout(alertTimer.current);
      alertTimer.current = window.setTimeout(() => setIncomingMessage(null), 7000);
    };

    socket.on('new_message', handleIncomingMessage);
    return () => {
      socket.off('new_message', handleIncomingMessage);
      if (alertTimer.current) window.clearTimeout(alertTimer.current);
    };
  }, [user?.id]);

  return (
    <>
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'var(--green)', height: 'var(--nav-height)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'white' }}>R</div>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'white', letterSpacing: -0.3 }}>Rozgar<span style={{ color: 'var(--amber)' }}>PK</span></span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {links.map((link) => (
          <Link key={link.to} to={link.to} style={{
            padding: '8px 14px', borderRadius: 6, fontSize: 14, fontWeight: 500,
            color: pathname === link.to ? 'white' : 'rgba(255,255,255,0.65)',
            background: pathname === link.to ? 'rgba(255,255,255,0.12)' : 'transparent',
            transition: 'all 0.15s',
          }}>{link.label}</Link>
        ))}

        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', margin: '0 6px' }} />

        {isAuthenticated ? (
          <>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8, color: 'white' }}>
              <span style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', borderRadius: '50%', background: '#ffffff22', fontWeight: 700 }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
              <span>{user?.name || 'User'}</span>
            </Link>

            <button type="button" className="btn btn-sm btn-ghost" onClick={logout} style={{ marginLeft: 8, background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.22)', color: 'white' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ padding: '8px 14px', borderRadius: 6, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>Login</Link>
            <Link to="/register" style={{ padding: '8px 14px', borderRadius: 6, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>Register</Link>
          </>
        )}

        <Link to="/post-job" style={{ padding: '9px 20px', background: 'var(--amber)', color: 'white', borderRadius: 6, fontSize: 14, fontWeight: 600, marginLeft: 4, transition: 'background 0.15s' }}>+ Post a Job</Link>
      </div>
    </nav>
    {isAuthenticated && incomingMessage && (
      <div role="status" aria-live="polite" style={{ position: 'fixed', top: 'calc(var(--nav-height) + 12px)', right: 16, zIndex: 120, width: 'min(360px, calc(100vw - 32px))', display: 'flex', alignItems: 'flex-start', gap: 10, padding: 14, background: 'white', border: '1px solid var(--border)', borderLeft: '4px solid var(--green)', borderRadius: 10, boxShadow: 'var(--shadow-md)' }}>
        <button type="button" onClick={() => { navigate('/chat', { state: { roomId: incomingMessage.roomId } }); setIncomingMessage(null); }} style={{ flex: 1, display: 'grid', gap: 4, padding: 0, border: 0, background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}>
          <strong>{incomingMessage.senderName || 'New message'}</strong>
          <span style={{ fontSize: 13, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{incomingMessage.text}</span>
        </button>
        <button type="button" aria-label="Dismiss message alert" onClick={() => setIncomingMessage(null)} style={{ border: 0, background: 'transparent', color: 'var(--ink-soft)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
    )}
    </>
  );
}
