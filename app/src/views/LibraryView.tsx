import { useMemo, useState } from 'react';
import type { MistakeItem, MistakeStatus } from '../types';
import { REASONS, SUBJECTS } from '../constants';
import FlipCard from '../components/FlipCard';

type StatusFilter = 'ALL' | MistakeStatus;

interface LibraryViewProps {
  mistakes: MistakeItem[];
  basket: Set<string>;
  statusFilter: StatusFilter;
  onStatusFilterChange: (status: StatusFilter) => void;
  onToggleBasket: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: MistakeStatus) => void;
  onAddAllVisible: (filtered: MistakeItem[]) => void;
}

const STATUS_TABS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'ALL', label: '全部' },
  { key: 'PENDING', label: '待攻克' },
  { key: 'PROGRESS', label: '攻克中' },
  { key: 'MASTERED', label: '已掌握' },
];

export default function LibraryView({
  mistakes,
  basket,
  statusFilter,
  onStatusFilterChange,
  onToggleBasket,
  onDelete,
  onStatusChange,
  onAddAllVisible,
}: LibraryViewProps) {
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [reasonFilter, setReasonFilter] = useState('ALL');
  const [flippedIds, setFlippedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return mistakes.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (subjectFilter !== 'ALL' && item.subject !== subjectFilter) return false;
      if (reasonFilter !== 'ALL' && (!item.reasons || !item.reasons.includes(reasonFilter))) return false;
      if (keyword) {
        const matchQ = (item.questionText || '').toLowerCase().includes(keyword);
        const matchR = (item.reflection || '').toLowerCase().includes(keyword);
        const matchA = (item.analysis || '').toLowerCase().includes(keyword);
        const matchS = (item.source || '').toLowerCase().includes(keyword);
        if (!matchQ && !matchR && !matchA && !matchS) return false;
      }
      return true;
    });
  }, [mistakes, statusFilter, subjectFilter, reasonFilter, search]);

  const toggleFlip = (id: string) => {
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const statCards: Array<{ key: StatusFilter; label: string; value: number; icon: string; cardClass: string; iconClass: string; textClass: string }> = [
    { key: 'ALL', label: '全部错题', value: mistakes.length, icon: 'fa-layer-group', cardClass: 'border-slate-200 hover:border-indigo-400', iconClass: 'bg-slate-100 text-slate-500', textClass: 'text-slate-800' },
    { key: 'PENDING', label: '待攻克', value: mistakes.filter((m) => m.status === 'PENDING').length, icon: 'fa-triangle-exclamation', cardClass: 'border-rose-100 hover:border-rose-400', iconClass: 'bg-rose-50 text-rose-500', textClass: 'text-rose-600' },
    { key: 'PROGRESS', label: '攻克中', value: mistakes.filter((m) => m.status === 'PROGRESS').length, icon: 'fa-clock-rotate-left', cardClass: 'border-amber-100 hover:border-amber-400', iconClass: 'bg-amber-50 text-amber-500', textClass: 'text-amber-600' },
    { key: 'MASTERED', label: '已掌握', value: mistakes.filter((m) => m.status === 'MASTERED').length, icon: 'fa-circle-check', cardClass: 'border-emerald-100 hover:border-emerald-400', iconClass: 'bg-emerald-50 text-emerald-600', textClass: 'text-emerald-600' },
  ];

  return (
    <section className="space-y-6">
      {/* 统计卡片与快速筛选 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            onClick={() => onStatusFilterChange(card.key)}
            className={`bg-white p-4 rounded-xl border shadow-sm cursor-pointer transition-all flex items-center justify-between ${card.cardClass}`}
          >
            <div>
              <p className={`text-xs font-medium ${card.key === 'PENDING' ? 'text-rose-500' : card.key === 'PROGRESS' ? 'text-amber-500' : card.key === 'MASTERED' ? 'text-emerald-600' : 'text-slate-400'}`}>{card.label}</p>
              <h3 className={`text-2xl font-bold mt-1 ${card.textClass}`}>{card.value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.iconClass}`}>
              <i className={`fa-solid ${card.icon}`}></i>
            </div>
          </div>
        ))}
      </div>

      {/* 筛选与操作过滤条 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-sm"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索题干、反思备注或知识点..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="py-2 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">全部学科</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s === '政治' ? '道法/政治' : s}
              </option>
            ))}
          </select>

          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="py-2 px-3 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="ALL">全部错因</option>
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onAddAllVisible(filtered)}
            className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5"
          >
            <i className="fa-solid fa-cart-plus"></i>
            <span>将当前筛选全加入重练卷</span>
          </button>
        </div>

        {/* 状态单选标签排 */}
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium">状态：</span>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusFilterChange(tab.key)}
              className={`px-3 py-1 rounded-md ${
                statusFilter === tab.key ? 'bg-slate-800 text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 错题卡片网格容器 (翻转卡片布局) */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => (
            <FlipCard
              key={item.id}
              item={item}
              inBasket={basket.has(item.id)}
              isFlipped={flippedIds.has(item.id)}
              onToggleFlip={toggleFlip}
              onToggleBasket={onToggleBasket}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-300 text-2xl mb-3">
            <i className="fa-solid fa-inbox"></i>
          </div>
          <p className="text-slate-500 font-medium">未找到符合条件的错题</p>
          <p className="text-xs text-slate-400 mt-1">试着切换筛选条件，或者立即录入第一道错题吧！</p>
        </div>
      )}
    </section>
  );
}
