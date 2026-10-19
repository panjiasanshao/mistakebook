// 设置视图：5 套主题切换 + JSON 导入导出
import { useRef, useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import type { useMistakes } from '../hooks/useMistakes';
import type { MistakeItem } from '../types/mistake';

type Props = Pick<ReturnType<typeof useMistakes>, 'items' | 'replaceAll' | 'mergeImport'>;

const VERSION = 'v2.1.0 (Family Edition)';

export function SettingsView({ items, replaceAll, mergeImport }: Props) {
  const { key, themes, change } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    const data = {
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      version: VERSION,
      count: items.length,
      mistakes: items,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `错题本备份_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage(`已导出 ${items.length} 道错题`);
    setError(null);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>, mode: 'replace' | 'merge') {
    const f = e.target.files?.[0];
    if (!f) return;
    setError(null); setMessage(null);
    try {
      const text = await f.text();
      const data = JSON.parse(text) as { mistakes?: MistakeItem[] };
      if (!Array.isArray(data.mistakes)) throw new Error('备份文件格式错误：缺少 mistakes 数组');
      const valid = data.mistakes.filter((m) => m && typeof m.id === 'string' && typeof m.subject === 'string');
      if (valid.length === 0) throw new Error('备份文件中没有有效错题记录');
      if (mode === 'replace') {
        await replaceAll(valid);
        setMessage(`已替换为备份中的 ${valid.length} 道错题`);
      } else {
        await mergeImport(valid);
        setMessage(`已合并导入 ${valid.length} 道错题`);
      }
    } catch (err) {
      setError('导入失败：' + (err as Error).message);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1">主题配色</h2>
        <p className="text-xs text-slate-500 mb-4">选择适合的配色方案，主题保存在浏览器本地存储</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {themes.map((t) => (
            <button key={t.key} onClick={() => change(t.key)}
              className={`p-3 rounded-xl border-2 transition-all ${key === t.key ? 'border-slate-800' : 'border-slate-200 hover:border-slate-400'}`}>
              <div className="w-full h-10 rounded-md mb-2" style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDark})` }} />
              <div className="text-xs font-medium text-slate-700 text-center">{t.emoji} {t.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1">数据备份与恢复</h2>
        <p className="text-xs text-slate-500 mb-4">换电脑或更换浏览器时，通过 JSON 文件备份和恢复错题数据</p>
        <div className="space-y-3">
          <button onClick={handleExport}
            className="w-full sm:w-auto px-4 py-2 text-white rounded-lg text-sm font-medium flex items-center justify-center sm:justify-start space-x-2"
            style={{ backgroundColor: 'var(--app-primary)' }}>
            <span>⬇️</span><span>导出备份（{items.length} 道错题）</span>
          </button>
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-600 mb-2">导入备份文件：</p>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => void handleImport(e, 'merge')} />
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={() => fileRef.current?.click()}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700">
                📤 合并导入（保留现有错题）
              </button>
              <label className="px-4 py-2 border border-rose-200 hover:bg-rose-50 rounded-lg text-sm font-medium text-rose-700 cursor-pointer">
                🔄 完全替换（清空现有错题）
                <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => void handleImport(e, 'replace')} />
              </label>
            </div>
          </div>
        </div>
        {message && <p className="mt-3 text-sm text-emerald-600">✅ {message}</p>}
        {error && <p className="mt-3 text-sm text-rose-600">❗ {error}</p>}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-1">关于</h2>
        <p className="text-xs text-slate-500">
          学海灯塔 · 错题本 &nbsp;|&nbsp; 版本：{VERSION} &nbsp;|&nbsp; 当前收录：<b style={{ color: 'var(--app-primary-text)' }}>{items.length}</b> 道错题
        </p>
        <p className="text-xs text-slate-400 mt-1">数据存储：浏览器原生 IndexedDB（仅本地）</p>
      </div>
    </section>
  );
}
