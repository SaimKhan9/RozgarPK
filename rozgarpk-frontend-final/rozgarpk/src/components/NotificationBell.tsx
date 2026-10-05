interface Props {
  unreadCount: number;
  onClick: () => void;
}

export default function NotificationBell({ unreadCount, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Notifications"
      style={{
        position: 'relative',
        width: 40,
        height: 40,
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.18)',
        background: 'rgba(255,255,255,0.08)',
        color: 'white',
        display: 'grid',
        placeItems: 'center',
        fontSize: 18,
        cursor: 'pointer',
      }}
    >
      🔔
      {unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -2,
            minWidth: 18,
            height: 18,
            borderRadius: 999,
            background: '#ef4444',
            color: 'white',
            fontSize: 10,
            fontWeight: 700,
            display: 'grid',
            placeItems: 'center',
            padding: '0 4px',
          }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
