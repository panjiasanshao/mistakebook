import { useCallback, useEffect, useRef, useState } from 'react';
import type { MistakeItem, MistakeStatus } from './types';
import { THEMES, THEME_STORAGE_KEY } from './constants';
import { dbGetAllMistakes, dbSaveMistake, dbDeleteMistake } from './lib/db';
import { compressImage } from './lib/image';
import { buildBackupJson, downloadBackup, parseBackup } from './lib/backup';
import { sampleMistakes } from './data/samples';
import LibraryView from './views/LibraryView';
import CreateView from './views/CreateView';
import PaperView from './views/PaperView';
import SettingsView from './views/SettingsView';
import Toast, { type ToastState } from './components/Toast';

type TabKey = 'library' | 'create' | 'paper' | 'settings';
type StatusFilter = 'ALL' | MistakeStatus;

const NAV_ITEMS: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'library', label: '错题库', icon: 'fa-book-open' },
  { key: 'create', label: '录入错题', icon: 'fa-circle-plus' },
  { key: 'paper', label: '重练组卷', icon: 'fa-file-pen' },
  { key: 'settings', label: '设置', icon: 'fa-gear' },
];

export default function App() {
  const [tab, setTab] = useState<TabKey>('library');
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [basket, setBasket] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [pastedImage, setPastedImage] = useState('');
  const [themeKey, setThemeKey] = useState('indigo');
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const importedFromBackup = useRef(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2400);
  }, []);

  const refreshMistakesData = useCallback(async () => {
    let list = await dbGetAllMistakes();
    if (list.length === 0) {
      for (const item of sampleMistakes) {
        await dbSaveMistake(item);
      }
      list = await dbGetAllMistakes();
    } else {
      // 自动补充演示题目的插图（解决已打开过页面无图的问题）
      let updatedAny = false;
      for (const sample of sampleMistakes) {
        const existing = list.find((m) => m.id === sample.id);
        if (existing && !existing.imageData && sample.imageData) {
          existing.imageData = sample.imageData;
          await dbSaveMistake(existing);
          updatedAny = true;
        }
      }
      if (updatedAny) {
        list = await dbGetAllMistakes();
      }
    }
    setMistakes(list);
  }, []);

  // 主题应用：注入 CSS 变量并持久化
  const applyTheme = useCallback((key: string) => {
    const theme = THEMES.find((t) => t.key === key) || THEMES[0];
    localStorage.setItem(THEME_STORAGE_KEY, theme.key);
    document.documentElement.style.setProperty('--primary', theme.primary);
    document.documentElement.style.setProperty('--primary-light', theme.light);
    document.documentElement.style.setProperty('--primary-text', theme.text);
    setThemeKey(theme.key);
  }, []);

  // 初始化：主题 + 数据 + 全局粘贴捕获
  useEffect(() => {
    applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || 'indigo');
    refreshMistakesData();
  }, [applyTheme, refreshMistakesData]);

  useEffect(() => {
    const handler = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            try {
              const compressed = await compressImage(blob);
              setPastedImage(compressed);
              setTab('create');
              showToast('已从剪贴板捕获并压缩截图！');
            } catch (err) {
              console.error(err);
            }
          }
          break;
        }
      }
    };
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [showToast]);

  const handleToggleBasket = useCallback((id: string) => {
    setBasket((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleAddAllVisible = useCallback(
    (filtered: MistakeItem[]) => {
      setBasket((prev) => {
        const next = new Set(prev);
        filtered.forEach((item) => next.add(item.id));
        return next;
      });
      showToast(`已将 ${filtered.length} 道错题加入组卷篮`);
    },
    [showToast],
  );

  const handleClearBasket = useCallback(() => {
    setBasket(new Set());
    showToast('组卷篮已清空');
  }, [showToast]);

  const handleStatusChange = useCallback(
    async (id: string, newStatus: MistakeStatus) => {
      const item = mistakes.find((m) => m.id === id);
      if (!item) return;
      const updated: MistakeItem = { ...item, status: newStatus, reviewCount: (item.reviewCount || 0) + 1 };
      await dbSaveMistake(updated);
      await refreshMistakesData();
      showToast(`已标记为：${newStatus === 'MASTERED' ? '已掌握 👏' : newStatus === 'PROGRESS' ? '攻克中 🚀' : '待攻克 ⚠️'}`);
    },
    [mistakes, refreshMistakesData, showToast],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await dbDeleteMistake(id);
      setBasket((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      await refreshMistakesData();
      showToast('错题已从错题本中移除');
    },
    [refreshMistakesData, showToast],
  );

  const handleSaved = useCallback(
    async (item: MistakeItem) => {
      await dbSaveMistake(item);
      await refreshMistakesData();
      showToast('错题已成功收录！');
      setTab('library');
    },
    [refreshMistakesData, showToast],
  );

  const handleExport = useCallback(() => {
    if (mistakes.length === 0) {
      showToast('当前没有可导出的错题数据！', 'warning');
      return;
    }
    downloadBackup(buildBackupJson(mistakes));
    showToast('备份文件已下载，请妥善保存以供换机使用！');
  }, [mistakes, showToast]);

  const handleImportFile = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const data = parseBackup(text);
        for (const item of data) {
          await dbSaveMistake(item);
        }
        importedFromBackup.current = true;
        await refreshMistakesData();
        showToast(`成功恢复 ${data.length} 道错题！`);
        setTab('library');
      } catch {
        showToast('解析备份文件失败，请确保文件完整', 'error');
      }
    },
    [refreshMistakesData, showToast],
  );

  const total = mistakes.length;

  return (
    <div className="min-h-screen flex flex-col">
      {/* 顶部导航栏 (非打印区) */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-colors"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <i className="fa-solid fa-graduation-cap text-lg"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">学海灯塔 · 错题本</h1>
            </div>
          </div>

          {/* 导航标签 */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            {NAV_ITEMS.map((nav) => {
              const active = tab === nav.key;
              return (
                <button
                  key={nav.key}
                  type="button"
                  onClick={() => setTab(nav.key)}
                  className={`px-2 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                    active ? 'bg-[var(--primary-light)] text-[var(--primary-text)] font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <i className={`fa-solid ${nav.icon}`}></i>
                  <span className="hidden sm:inline">{nav.label}</span>
                  {nav.key === 'library' && (
                    <span className="ml-1 text-xs bg-[var(--primary-light)] text-[var(--primary-text)] px-1.5 py-0.5 rounded-full font-bold">
                      {total}
                    </span>
                  )}
                  {nav.key === 'paper' && (
                    <span className="ml-1 text-xs bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">{basket.size}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* 主体工作区 */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {tab === 'library' && (
          <LibraryView
            mistakes={mistakes}
            basket={basket}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onToggleBasket={handleToggleBasket}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            onAddAllVisible={handleAddAllVisible}
          />
        )}
        {tab === 'create' && (
          <CreateView
            pastedImage={pastedImage}
            onConsumePastedImage={() => setPastedImage('')}
            onSaved={handleSaved}
            onCancel={() => setTab('library')}
            showToast={showToast}
          />
        )}
        {tab === 'paper' && <PaperView mistakes={mistakes} basket={basket} onClearBasket={handleClearBasket} />}
        {tab === 'settings' && (
          <SettingsView
            mistakes={mistakes}
            themeKey={themeKey}
            onApplyTheme={(key) => {
              applyTheme(key);
              showToast(`已应用【${THEMES.find((t) => t.key === key)?.label || '经典靛蓝'}】主题`);
            }}
            onExport={handleExport}
            onImportFile={handleImportFile}
          />
        )}
      </main>

      <Toast toast={toast} />
    </div>
  );
}
