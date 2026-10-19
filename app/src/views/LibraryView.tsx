// 错题库视图：统计卡片+筛选+3D翻转卡片网格
import { useMemo, useState } from 'react';
import { FlipCard } from '../components/FlipCard';
import { StarRating } from '../components/StarRating';
import { StatusBadge } from '../components/StatusBadge';
import type { useMistakes } from '../hooks/useMistakes';
import { REASON_TAGS, STATUS_LABEL, STATUS_TONE, SUBJECTS, type MistakeStatus, type MistakeItem, type Subject } from '../types/mistake';

type Props = ReturnType<typeof useMistakes>;

export function LibraryView({ items, setStatus, remove, toggleBasket, addManyToBasket }: Props) {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<Subject | 'ALL'>('ALL');
  const [reasonFilter, setReasonFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<MistakeStatus | 'ALL'>('ALL');
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());

  const stats = useMemo(() => ({
    all: items.length,
    pending: items.filter((m) => m.status === 'PENDING').length,
    progress: items.filter((m) => m.status === 'PROGRESS').length,
    mastered: items.filter((m) => m.status === 'MASTERED').length,
  }), [items]);

  const filtered = useMemo(() => items.filter((m) => {
    if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
    if (subjectFilter !== 'ALL' && m.subject !== subjectFilter) return false;
    if (reasonFilter !== 'ALL' && !m.reasons.includes(reasonFilter as never)) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const text = `${m.questionText} ${m.reflection} ${m.source} ${m.reasons.join(' ')}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  }), [items, search, subjectFilter, reasonFilter, statusFilter]);

  function toggleFlip(id: string) {
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <section className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="全部错题" value={stats.all} emoji="🗂️" tone="slate"
          active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')} />
        <StatCard label="待攻克" value={stats.pending} emoji="⚠️" tone="rose"
          active={statusFilter === 'PENDING'} onClick={() => setStatusFilter('PENDING')} />
        <StatCard label="攻克中" value={stats.progress} emoji="🚀" tone="amber"
          active={statusFilter === 'PROGRESS'} onClick={() => setStatusFilter('PROGRESS')} />
        <StatCard label="已掌握" value={stats.mastered} emoji="👏" tone="emerald"
          active={statusFilter === 'MASTERED'} onClick={() => setStatusFilter('MASTERED')} />
      </div>

      {/* 筛选条 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <span className="absolute left-3.5 top-2.5 text-slate-400">🔍</span>
            <input
              type="text"
              value={search}
              onInput={(e) => setSearch((e.target as HTMLInputElement).value)}
              placeholder="搜索题干、反思备注或知识点..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value as Subject | 'ALL')}
            className="py-2 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            <option value="ALL">全部学科</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={reasonFilter} onChange={(e) => setReasonFilter(e.target.value)}
            className="py-2 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            <option value="ALL">全部错因</option>
            {REASON_TAGS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button onClick={() => void addManyToBasket(filtered.map((m) => m.id))}
            className="px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5"
            style={{ backgroundColor: 'var(--app-primary-light)', color: 'var(--app-primary-text)' }}>
            <span>🛒</span><span>将当前筛选全加入重练卷</span>
          </button>
        </div>
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">状态：</span>
          {(['ALL', 'PENDING', 'PROGRESS', 'MASTERED'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-md font-medium ${statusFilter === s ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              {s === 'ALL' ? '全部' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* 卡片网格 */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-3xl mb-3">📭</div>
          <p className="text-slate-500 font-medium">未找到符合条件的错题</p>
          <p className="text-xs text-slate-400 mt-1">试着切换筛选条件，或者立即录入第一道错题吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((m) => (
            <FlipCard
              key={m.id}
              flipped={flippedIds.has(m.id)}
              onFlip={() => toggleFlip(m.id)}
              front={<FrontFace m={m} inBasket={!!m.inBasket} onToggleBasket={() => toggleBasket(m.id)} onRemove={() => remove(m.id)} />}
              back={<BackFace m={m} onBack={() => toggleFlip(m.id)} onStatus={(s) => setStatus(m.id, s)} />}
            />
          ))}
        </div>
      )}
    </section>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  emoji: string;
  tone: 'slate' | 'rose' | 'amber' | 'emerald';
  active: boolean;
  onClick: () => void;
}

function StatCard({ label, value, emoji, tone, active, onClick }: StatCardProps) {
  const TONE_CLS: Record<string, string> = {
    slate: 'border-slate-200 text-slate-800 bg-slate-100',
    rose: 'border-rose-100 text-rose-600 bg-rose-50',
    amber: 'border-amber-100 text-amber-600 bg-amber-50',
    emerald: 'border-emerald-100 text-emerald-600 bg-emerald-50',
  };
  const cls = TONE_CLS[tone];
  const [borderCls, textColorCls, bgColorCls] = cls.split(' ');
  return (
    <div onClick={onClick}
      className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all flex items-center justify-between ${borderCls} ${active ? 'ring-2 ring-offset-1' : ''}`}
      style={active ? { borderColor: 'var(--app-primary)' } : undefined}>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <h3 className={`text-2xl font-bold mt-1 ${textColorCls}`}>{value}</h3>
      </div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${bgColorCls}`}>{emoji}</div>
    </div>
  );
}

function FrontFace({ m, inBasket, onToggleBasket, onRemove }: {
  m: MistakeItem;
  inBasket: boolean;
  onToggleBasket: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="h-full flex flex-col bg-white p-5 rounded-xl border border-slate-200 shadow-sm overflow-y-auto">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded-md text-xs font-medium"
            style={{ backgroundColor: 'var(--app-primary-light)', color: 'var(--app-primary-text)' }}>
            {m.subject}
          </span>
          <StatusBadge status={m.status} />
        </div>
        <StarRating value={m.difficulty} size="sm" />
      </div>
      {m.source && <p className="text-xs text-slate-400 mb-2">🏷️ {m.source}</p>}
      {m.reasons.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {m.reasons.map((r) => (
            <span key={r} className="px-2 py-0.5 text-xs rounded bg-rose-50 text-rose-600">{r}</span>
          ))}
        </div>
      )}
      {m.imageData && (
        <div className="mb-2 rounded-lg overflow-hidden border border-slate-100">
          <img src={m.imageData} alt="题目图片" className="max-h-40 w-full object-contain" />
        </div>
      )}
      {m.questionText && <p className="text-sm text-slate-700 mb-2 whitespace-pre-wrap">{m.questionText}</p>}
      {m.reflection && (
        <div className="mt-auto pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">💡 反思：{m.reflection}</p>
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <button onClick={(e) => { e.stopPropagation(); onToggleBasket(); }}
          className={`px-2.5 py-1 rounded-md font-medium transition-all ${inBasket ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          {inBasket ? '✓ 已加入组卷' : '🛒 加入组卷'}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="px-2.5 py-1 rounded-md font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all">
          🗑️ 删除
        </button>
      </div>
      <p className="mt-2 text-center text-xs" style={{ color: 'var(--app-primary-text)' }}>
        🔄 点击卡片翻转看答案
      </p>
    </div>
  );
}

function BackFace({ m, onBack, onStatus }: {
  m: MistakeItem;
  onBack: () => void;
  onStatus: (s: MistakeStatus) => void;
}) {
  return (
    <div className="h-full flex flex-col p-5 rounded-xl border overflow-y-auto"
      style={{ background: `linear-gradient(135deg, var(--app-primary-light), #fff)`, borderColor: 'var(--app-primary)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="px-2 py-0.5 rounded-md text-xs font-medium text-white"
          style={{ backgroundColor: 'var(--app-primary)' }}>
          正确答案 & 解析
        </span>
        <button onClick={(e) => { e.stopPropagation(); onBack(); }} className="text-xs px-2 py-1 rounded bg-white border border-slate-200 hover:bg-slate-50">
          ↩️ 翻回题目
        </button>
      </div>
      <div className="flex-1 overflow-y-auto text-sm text-slate-700 whitespace-pre-wrap">
        {m.analysis || <span className="text-slate-400 italic">（尚未填写解析）</span>}
      </div>
      <div className="mt-3 pt-3 border-t border-indigo-100">
        <p className="text-xs text-slate-500 mb-2">已复习 {m.reviewCount} 次 · 标记掌握状态：</p>
        <div className="grid grid-cols-3 gap-2">
          {(['PENDING', 'PROGRESS', 'MASTERED'] as const).map((s) => (
            <button key={s} onClick={(e) => { e.stopPropagation(); onStatus(s); }}
              className={`px-2 py-1.5 rounded-md text-xs font-medium border transition-all ${m.status === s ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
