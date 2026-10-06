import { Link, useLocation } from 'react-router-dom';

const adminTabs = [
  { to: '/admin', label: '📊 Dashboard Overview', exact: true },
  { to: '/admin/users', label: '👥 Users Management' },
  { to: '/admin/workers', label: '👷 Workers Management' },
  { to: '/admin/jobs', label: '📋 Jobs Management' },
  { to: '/admin/analytics', label: '📈 Analytics & Growth' },
];

export default function AdminNav() {
  const { pathname } = useLocation();

  return (
    <div style={{
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      borderBottom: '1.5px solid var(--border)',
      paddingBottom: 12,
      marginBottom: 24,
    }}>
      {adminTabs.map((tab) => {
        const isActive = tab.exact ? pathname === tab.to : pathname.startsWith(tab.to);
        return (
          <Link
            key={tab.to}
            to={tab.to}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'white' : 'var(--ink-mid)',
              background: isActive ? 'var(--green)' : 'var(--surface)',
              border: isActive ? '1px solid var(--green)' : '1px solid var(--border)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
