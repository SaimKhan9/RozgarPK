import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../api/services';

interface NotificationItem {
  id: string;
  type: 'proposal' | 'proposal_update' | 'message' | 'review' | 'job' | 'system';
  title: string;
  description: string;
  time: string;
  link: string;
  isUnread: boolean;
  avatar?: string;
}

const formatTimeAgo = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';
  return d.toLocaleDateString();
};

const getIcon = (type: NotificationItem['type']) => {
  switch (type) {
    case 'proposal':
      return { icon: '📨', bg: '#EFF6FF', color: '#1D4ED8' };
    case 'proposal_update':
      return { icon: '🎉', bg: '#F0FDF4', color: '#166534' };
    case 'message':
      return { icon: '💬', bg: '#FEF3C7', color: '#B45309' };
    case 'review':
      return { icon: '⭐', bg: '#FEF9C3', color: '#A16207' };
    case 'job':
      return { icon: '💼', bg: '#F3E8FF', color: '#7E22CE' };
    case 'system':
    default:
      return { icon: '🔔', bg: '#E0E7FF', color: '#4338CA' };
  }
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'proposals' | 'messages'>('all');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll();
      setNotifications(res.data?.data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = () => {
    const all = new Set<string>(notifications.map((n) => n.id));
    setReadIds(all);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setReadIds((prev) => new Set([...prev, item.id]));
    if (item.link) {
      navigate(item.link);
    }
  };

  const filtered = notifications.filter((item) => {
    const isUnread = item.isUnread && !readIds.has(item.id);
    if (filter === 'unread') return isUnread;
    if (filter === 'proposals') return item.type === 'proposal' || item.type === 'proposal_update';
    if (filter === 'messages') return item.type === 'message';
    return true;
  });

  const unreadCount = notifications.filter((n) => n.isUnread && !readIds.has(n.id)).length;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 840 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: 'var(--ink)' }}>
            Notifications
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
            Stay updated with proposals, incoming messages, and marketplace activity.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 13 }}
          >
            ✓ Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1.5px solid var(--border)',
        paddingBottom: 12,
        marginBottom: 20,
      }}>
        {[
          { key: 'all', label: `All (${notifications.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'proposals', label: 'Proposals' },
          { key: 'messages', label: 'Messages' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: filter === tab.key ? 700 : 500,
              background: filter === tab.key ? 'var(--green)' : 'var(--surface)',
              color: filter === tab.key ? 'white' : 'var(--ink-soft)',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-soft)' }}>
            Loading notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-soft)' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔔</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>
              No notifications found
            </div>
            <div style={{ fontSize: 13 }}>
              {filter === 'unread'
                ? 'All caught up! You have no unread notifications.'
                : 'Activity and updates will appear here.'}
            </div>
          </div>
        ) : (
          filtered.map((item) => {
            const isUnread = item.isUnread && !readIds.has(item.id);
            const style = getIcon(item.type);

            return (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  cursor: 'pointer',
                  background: isUnread ? '#F0FDF4' : 'white',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = isUnread ? '#DCFCE7' : 'var(--surface)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = isUnread ? '#F0FDF4' : 'white')}
              >
                {/* Icon or Avatar */}
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: style.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    flexShrink: 0,
                  }}
                >
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt=""
                      style={{ width: '100%', height: '100%', borderRadius: 10, objectFit: 'cover' }}
                    />
                  ) : (
                    style.icon
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                    <h4 style={{
                      fontSize: 14,
                      fontWeight: isUnread ? 800 : 600,
                      color: 'var(--ink)',
                      marginBottom: 3,
                    }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: 11, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
                      {formatTimeAgo(item.time)}
                    </span>
                  </div>

                  <p style={{
                    fontSize: 13,
                    color: isUnread ? 'var(--ink)' : 'var(--ink-soft)',
                    lineHeight: 1.4,
                    margin: 0,
                  }}>
                    {item.description}
                  </p>
                </div>

                {/* Unread indicator dot */}
                {isUnread && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--green)',
                      alignSelf: 'center',
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
