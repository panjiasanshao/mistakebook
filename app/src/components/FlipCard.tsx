import type { MistakeItem, MistakeStatus } from '../types';

interface FlipCardProps {
  item: MistakeItem;
  inBasket: boolean;
  isFlipped: boolean;
  onToggleFlip: (id: string) => void;
  onToggleBasket: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: MistakeStatus) => void;
}

function StatusBadge({ status }: { status: MistakeStatus }) {
  if (status === 'PENDING') {
    return (
      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 whitespace-nowrap">
        <i className="fa-solid fa-triangle-exclamation mr-1"></i>待攻克
      </span>
    );
  }
  if (status === 'PROGRESS') {
    return (
      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200 whitespace-nowrap">
        <i className="fa-solid fa-clock-rotate-left mr-1"></i>攻克中
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 whitespace-nowrap">
      <i className="fa-solid fa-circle-check mr-1"></i>已掌握
    </span>
  );
}

export default function FlipCard({ item, inBasket, isFlipped, onToggleFlip, onToggleBasket, onDelete, onStatusChange }: FlipCardProps) {
  return (
    <div id={`flip-card-${item.id}`} className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
      <div className="flip-card-inner">
        {/* 卡片正面：题干、反思与未答状态 */}
        <div className="flip-card-front bg-white border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold whitespace-nowrap">{item.subject}</span>
                <span className="text-xs text-slate-400 truncate max-w-[130px]">{item.source || '日常积累'}</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="flex space-x-0.5">
                  {[1, 2, 3, 4, 5].map((i) =>
                    i <= (item.difficulty || 3) ? (
                      <i key={i} className="fa-solid fa-star text-amber-400 text-xs"></i>
                    ) : (
                      <i key={i} className="fa-regular fa-star text-slate-300 text-xs"></i>
                    ),
                  )}
                </div>
                <StatusBadge status={item.status} />
              </div>
            </div>

            {item.imageData && (
              <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 max-h-40 overflow-hidden flex items-center justify-center">
                <img src={item.imageData} alt="题目图片" className="object-contain max-h-36 rounded" />
              </div>
            )}

            {item.questionText && <p className="text-sm font-medium text-slate-800 line-clamp-3 leading-relaxed">{item.questionText}</p>}

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {(item.reasons || []).map((r) => (
                <span key={r} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium">
                  {r}
                </span>
              ))}
            </div>

            {item.reflection && (
              <div className="text-xs text-amber-800 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/60">
                <span className="font-bold flex items-center mb-0.5">
                  <i className="fa-solid fa-lightbulb mr-1 text-amber-600"></i>当时错因与反思：
                </span>
                <p className="line-clamp-2">{item.reflection}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs mt-3">
            <button
              type="button"
              onClick={() => onToggleFlip(item.id)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition-all flex items-center space-x-1.5"
            >
              <i className="fa-solid fa-repeat"></i>
              <span>翻转看答案</span>
            </button>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => onToggleBasket(item.id)}
                className={`px-2.5 py-1.5 rounded-lg transition-all font-medium flex items-center space-x-1 ${
                  inBasket ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <i className={`fa-solid ${inBasket ? 'fa-check' : 'fa-plus'}`}></i>
                <span>{inBasket ? '已在卷' : '组卷'}</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                title="删除错题"
                className="p-1.5 text-slate-300 hover:text-rose-500 rounded transition-all"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>

        {/* 卡片背面：正确解析、思路步骤与状态流转 */}
        <div className="flip-card-back bg-gradient-to-b from-slate-900 to-slate-800 text-white border border-slate-700 shadow-xl p-5 flex flex-col justify-between">
          <div className="space-y-3 min-h-0">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-700">
              <span className="text-xs font-bold text-indigo-300 flex items-center">
                <i className="fa-solid fa-key mr-1.5"></i> 正确答案与解析
              </span>
              <button
                type="button"
                onClick={() => onToggleFlip(item.id)}
                className="text-xs text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-2.5 py-1 rounded-md font-medium flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              >
                <i className="fa-solid fa-rotate-left"></i>
                <span>翻回题目</span>
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto pr-1 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed space-y-2">
              {item.analysis ? item.analysis : <p className="text-slate-500 italic py-4">录入时未填写详细文字解析</p>}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700 text-xs space-y-2.5">
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>核对后标记掌握情况：</span>
              <span className="text-indigo-400 font-medium">已复习 {item.reviewCount || 0} 次</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onStatusChange(item.id, 'PENDING')}
                className={`py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                  item.status === 'PENDING'
                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                    : 'bg-slate-800 text-rose-400 border-rose-500/40 hover:bg-slate-700'
                }`}
              >
                待攻克
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(item.id, 'PROGRESS')}
                className={`py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                  item.status === 'PROGRESS'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-slate-800 text-amber-400 border-amber-500/40 hover:bg-slate-700'
                }`}
              >
                攻克中
              </button>
              <button
                type="button"
                onClick={() => onStatusChange(item.id, 'MASTERED')}
                className={`py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                  item.status === 'MASTERED'
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-800 text-emerald-400 border-emerald-500/40 hover:bg-slate-700'
                }`}
              >
                已掌握 👏
              </button>
            </div>
            <button
              type="button"
              onClick={() => onToggleFlip(item.id)}
              className="w-full py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center justify-center space-x-1 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>返回正面看题目</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
