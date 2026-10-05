interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
}

interface Props {
  items: NotificationItem[];
  onClose: () => void;
  onMarkAllRead?: () => void;
}

export default function NotificationDropdown({ items, onClose, onMarkAllRead }: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 52,
        right: 0,
        width: 340,
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: 'var(--shadow-md)',
        padding: 12,
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <strong style={{ fontSize: 15, color: 'var(--ink)' }}>Notifications</strong>
        <button type="button" className="btn btn-sm btn-ghost" onClick={onMarkAllRead}>Mark all read</button>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {items.length === 0 ? (
          <div style={{ padding: '18px 12px', color: 'var(--ink-soft)', textAlign: 'center' }}>No new notifications</div>
        ) : (
          items.slice(0, 5).map((item) => (
            <div
              key={item.id}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: item.isRead ? '#f9fafb' : '#f0fdf4',
                border: item.isRead ? '1px solid var(--border)' : '1px solid #bbf7d0',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{item.body}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 6 }}>{item.createdAt}</div>
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <button type="button" className="btn btn-sm btn-outline" onClick={onClose}>View all</button>
      </div>
    </div>
  );
}
