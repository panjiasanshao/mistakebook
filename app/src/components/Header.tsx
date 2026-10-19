// 顶部导航栏
import type { TabKey } from '../App';

interface HeaderProps {
  activeTab: TabKey;
  onTabChange: (t: TabKey) => void;
  totalCount: number;
  basketCount: number;
}

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'library', label: '错题库', emoji: '📖' },
  { key: 'create', label: '录入错题', emoji: '➕' },
  { key: 'paper', label: '重练组卷', emoji: '📝' },
  { key: 'settings', label: '设置', emoji: '⚙️' },
];

export function Header({ activeTab, onTabChange, totalCount, basketCount }: HeaderProps) {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md text-lg"
            style={{ backgroundColor: 'var(--app-primary)' }}
          >
            🎓
          </div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">学海灯塔 · 错题本</h1>
        </div>
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {TABS.map((t) => {
            const active = t.key === activeTab;
            const showBadge = t.key === 'library' || t.key === 'paper';
            const badge = t.key === 'library' ? totalCount : t.key === 'paper' ? basketCount : 0;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => onTabChange(t.key)}
                className={[
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2',
                  active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100',
                ].join(' ')}
                style={active ? { backgroundColor: 'var(--app-primary-light)', color: 'var(--app-primary-text)' } : undefined}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
                {showBadge && badge > 0 && (
                  <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={t.key === 'library'
                      ? { backgroundColor: 'rgba(99,102,241,0.2)', color: 'var(--app-primary-text)' }
                      : { backgroundColor: '#f43f5e', color: '#fff' }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
