import React from 'react'
import { useStore } from '../store/index.js'

const TABS = [
  { id: 'chains', label: 'Production Chains', icon: '⛓' },
  { id: 'machines', label: 'Machines', icon: '⚙' },
  { id: 'recipes', label: 'Recipes', icon: '📋' },
]

export default function Header() {
  const activeView = useStore(s => s.activeView)
  const setActiveView = useStore(s => s.setActiveView)

  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo">◈</span>
        <span className="header-title">Star Technology<span className="header-sub">Modeler</span></span>
      </div>
      <nav className="header-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-tab ${activeView === t.id ? 'active' : ''}`}
            onClick={() => setActiveView(t.id)}
          >
            <span className="nav-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>
      <div className="header-right">
        <span className="version-badge">v0.1</span>
      </div>
      <style>{`
        .header {
          display: flex;
          align-items: center;
          gap: 0;
          padding: 0 20px;
          height: 52px;
          background: var(--bg-1);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .header-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-right: 32px;
          flex-shrink: 0;
        }
        .header-logo {
          font-size: 20px;
          color: var(--accent);
          line-height: 1;
        }
        .header-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-0);
          letter-spacing: 0.5px;
        }
        .header-sub {
          font-weight: 400;
          color: var(--text-1);
          margin-left: 6px;
          font-size: 13px;
        }
        .header-nav {
          display: flex;
          gap: 2px;
          flex: 1;
        }
        .nav-tab {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: var(--radius);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-1);
          transition: all 0.15s;
          font-family: var(--font-ui);
        }
        .nav-tab:hover { background: var(--bg-3); color: var(--text-0); }
        .nav-tab.active {
          background: var(--accent-glow);
          color: var(--accent);
          border: 1px solid var(--accent-dim);
        }
        .nav-icon { font-size: 14px; }
        .header-right { margin-left: auto; }
        .version-badge {
          font-size: 11px;
          font-family: var(--font-mono);
          color: var(--text-2);
          background: var(--bg-3);
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid var(--border);
        }
      `}</style>
    </header>
  )
}
