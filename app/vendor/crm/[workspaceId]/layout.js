'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

const ITEMS = [
  ['overview', 'Overview', 'overview'],
  ['leads', 'Leads', ''],
  ['proposals', 'Proposals', 'proposals'],
  ['follow-ups', 'Follow-ups', 'follow-ups'],
  ['payments', 'Payments', 'payments'],
];

export default function WorkspaceLayout({ children }) {
  const { workspaceId } = useParams();
  const pathname = usePathname() || '';
  const base = `/vendor/crm/${workspaceId}`;

  function activeKey() {
    if (pathname.startsWith(`${base}/overview`)) return 'overview';
    if (pathname.startsWith(`${base}/proposals`)) return 'proposals';
    if (pathname.startsWith(`${base}/follow-ups`)) return 'follow-ups';
    if (pathname.startsWith(`${base}/payments`)) return 'payments';
    return 'leads';
  }

  const active = activeKey();

  return (
    <>
      <nav className="workspace-nav" aria-label="Workspace navigation">
        <div className="inner">
          {ITEMS.map(([key, label, slug]) => (
            <Link
              key={key}
              href={slug ? `${base}/${slug}` : base}
              className={active === key ? 'active' : ''}
              aria-current={active === key ? 'page' : undefined}
            >
              {label}
            </Link>
          ))}

          <Link href="/vendor/crm?select=1" className="switch">
  Switch workspace
</Link>
        </div>
      </nav>

      {children}

      <style jsx>{`
        .workspace-nav {
          position: sticky;
          top: 0;
          z-index: 20;
          background: #0f172a;
          border-bottom: 1px solid #334155;
          font-family: Inter, -apple-system, sans-serif;
        }
        .inner {
          max-width: 1100px;
          margin: auto;
          padding: 0 20px;
          display: flex;
          gap: 4px;
          overflow-x: auto;
        }
        .workspace-nav :global(a) {
          padding: 13px 14px;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
        }
        .workspace-nav :global(a.active) {
          color: #facc15;
          border-bottom-color: #facc15;
        }
        .workspace-nav :global(a.switch) {
          margin-left: auto;
          font-size: 13px;
        }
      `}</style>
    </>
  );
}
