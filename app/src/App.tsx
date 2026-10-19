// App 主组件：4 视图 tab 路由（纯 React 结构，不用 IonApp 避免视口限制）
import { useMemo, useState } from 'react';
import { Header } from './components/Header';
import { useMistakes } from './hooks/useMistakes';
import { LibraryView } from './views/LibraryView';
import { CreateView } from './views/CreateView';
import { PaperView } from './views/PaperView';
import { SettingsView } from './views/SettingsView';

export type TabKey = 'library' | 'create' | 'paper' | 'settings';

export default function App() {
  const [tab, setTab] = useState<TabKey>('library');
  const mistakes = useMistakes();
  const basketCount = useMemo(() => mistakes.items.filter((m) => m.inBasket).length, [mistakes.items]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        activeTab={tab}
        onTabChange={setTab}
        totalCount={mistakes.items.length}
        basketCount={basketCount}
      />
      <main className="no-print flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {tab === 'library' && <LibraryView {...mistakes} />}
        {tab === 'create' && <CreateView onSave={mistakes.create} onCancel={() => setTab('library')} />}
        {tab === 'paper' && (
          <PaperView
            items={mistakes.items}
            clearBasket={mistakes.clearBasket}
            toggleBasket={mistakes.toggleBasket}
          />
        )}
        {tab === 'settings' && (
          <SettingsView
            items={mistakes.items}
            replaceAll={mistakes.replaceAll}
            mergeImport={mistakes.mergeImport}
          />
        )}
      </main>
    </div>
  );
}
