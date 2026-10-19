// 重练组卷视图：A4 双栏打印 + 答案附录页
import type { useMistakes } from '../hooks/useMistakes';
import type { MistakeItem } from '../types/mistake';

type Props = Pick<ReturnType<typeof useMistakes>, 'items' | 'clearBasket' | 'toggleBasket'>;

export function PaperView({ items, clearBasket, toggleBasket }: Props) {
  const basketItems = items.filter((m) => m.inBasket);

  function handlePrint() {
    window.print();
  }

  return (
    <section className="space-y-6">
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">重练组卷</h2>
            <p className="text-xs text-slate-500 mt-0.5">当前组卷篮：<b className="text-rose-500">{basketItems.length}</b> 道题</p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={clearBasket}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
              🗑️ 清空组卷篮
            </button>
            <button onClick={handlePrint} disabled={basketItems.length === 0}
              className="px-4 py-1.5 text-sm text-white rounded-lg font-medium disabled:opacity-50"
              style={{ backgroundColor: 'var(--app-primary)' }}>
              🖨️ 打印试卷
            </button>
          </div>
        </div>
      </div>

      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">组卷篮中的错题</h3>
        {basketItems.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            <div className="text-2xl mb-2">🛒</div>
            组卷篮为空。回到错题库，勾选要重练的题目加入组卷篮。
          </div>
        ) : (
          <ul className="space-y-2">
            {basketItems.map((m, idx) => (
              <li key={m.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: 'var(--app-primary-light)', color: 'var(--app-primary-text)' }}>
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{m.subject} · {m.source || '未填来源'}</p>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{m.questionText || '（无题干，看图答题）'}</p>
                </div>
                <button onClick={() => toggleBasket(m.id)} className="text-xs text-slate-400 hover:text-rose-600" aria-label="从组卷篮移除">✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {basketItems.length > 0 && (
        <div id="printArea" className="bg-white p-8 sm:p-10 shadow-sm border border-slate-200 rounded-lg">
          <div className="print-header">
            <h1 className="text-center text-2xl font-bold mb-1">错题重练试卷</h1>
            <div className="text-center text-sm text-slate-600 mb-4">
              共 {basketItems.length} 道题 · 出题时间：{new Date().toLocaleDateString('zh-CN')}
            </div>
            <div className="flex justify-between text-sm border-y border-slate-300 py-2 mb-6">
              <span>姓名：____________</span>
              <span>学号：____________</span>
              <span>日期：____________</span>
              <span>得分：____________</span>
            </div>
          </div>

          <div className="print-columns">
            {basketItems.map((m, idx) => <PaperQuestion key={m.id} idx={idx + 1} m={m} />)}
          </div>

          <div className="print-page-break" />
          <div className="mt-6 pt-4">
            <h2 className="text-xl font-bold text-slate-800 mb-4 border-b-2 border-slate-300 pb-2">参考答案与解析</h2>
            <div className="print-columns">
              {basketItems.map((m, idx) => <PaperAnswer key={m.id} idx={idx + 1} m={m} />)}
            </div>
            <div className="mt-8 p-4 bg-slate-50 rounded border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 mb-2">错因警示汇总</h3>
              <ul className="text-xs text-slate-600 space-y-1">
                {basketItems.map((m, idx) => (
                  <li key={m.id}>第 {idx + 1} 题 [{m.subject}]：{m.reasons.length > 0 ? m.reasons.join('、') : '未分类'}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function PaperQuestion({ idx, m }: { idx: number; m: MistakeItem }) {
  return (
    <div className="print-item mb-6 break-inside-avoid">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-bold text-slate-800">{idx}.</span>
        <span className="text-xs text-slate-500">[{m.subject}{m.source ? ` · ${m.source}` : ''}]</span>
        <span className="text-xs text-slate-400">★{m.difficulty}</span>
      </div>
      {m.imageData && <div className="mb-2"><img src={m.imageData} alt="题目" className="max-w-full max-h-72 object-contain" /></div>}
      {m.questionText && <p className="text-sm text-slate-700 whitespace-pre-wrap mb-3">{m.questionText}</p>}
      <div className="border-t border-dashed border-slate-300 pt-2 mt-2 space-y-4">
        <p className="text-xs text-slate-400">作答区：</p>
        <div className="h-32" />
        <div className="h-24" />
      </div>
    </div>
  );
}

function PaperAnswer({ idx, m }: { idx: number; m: MistakeItem }) {
  return (
    <div className="print-item mb-5 break-inside-avoid">
      <p className="text-sm font-semibold text-slate-800 mb-1">第 {idx} 题解析：</p>
      <p className="text-sm text-slate-700 whitespace-pre-wrap">{m.analysis || '（未填写解析）'}</p>
      {m.reflection && <p className="text-xs text-slate-500 mt-1">反思点：{m.reflection}</p>}
    </div>
  );
}
