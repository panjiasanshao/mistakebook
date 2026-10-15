import { useState } from 'react';
import type { MistakeItem } from '../types';

interface PaperViewProps {
  mistakes: MistakeItem[];
  basket: Set<string>;
  onClearBasket: () => void;
}

interface SheetSettings {
  title: string;
  subtitle: string;
  layout: 'columns' | 'single';
  includeAnswers: boolean;
}

function PaperSheetContent({ items, settings }: { items: MistakeItem[]; settings: SheetSettings }) {
  return (
    <>
      {/* 试卷抬头 */}
      <div className="text-center pb-6 border-b-2 border-slate-800 mb-6">
        <h2 className="text-2xl font-bold tracking-wider">{settings.title || '错题查漏补缺 · 自我突破重练卷'}</h2>
        <p className="text-sm text-slate-600 mt-2">{settings.subtitle || '姓名：__________  日期：____年__月__日'}</p>
        <div className="text-xs text-slate-400 mt-1 italic">（认真审题，沉着作答，战胜曾经错过的自己！）</div>
      </div>

      {/* 错题题目排版容器 */}
      <div className={settings.layout === 'columns' ? 'print-columns space-y-6' : 'space-y-8'}>
        {items.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-slate-400">
            <i className="fa-solid fa-folder-open text-3xl mb-2"></i>
            <p className="text-sm">组卷篮暂无错题，请先到“错题库”中挑选加入</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={item.id} className="print-item border-b border-slate-200 pb-5 mb-4 space-y-2.5">
              <div className="flex items-start space-x-2">
                <span className="font-bold text-sm bg-slate-900 text-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1 space-y-2">
                  <div className="text-xs font-semibold text-slate-500 flex items-center space-x-2">
                    <span>[{item.subject}]</span>
                    <span>({item.source || '复习练习'})</span>
                  </div>
                  {item.questionText && <p className="text-sm font-medium text-slate-900 leading-relaxed">{item.questionText}</p>}
                  {item.imageData && (
                    <div className="my-2">
                      <img src={item.imageData} alt="题目" className="max-h-56 object-contain rounded border border-slate-200" />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-dashed border-slate-300">
                <div className="text-[11px] text-slate-400 mb-1">【答题区 / 解题步骤】：</div>
                <div className="h-24 w-full border-b border-dashed border-slate-200"></div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 答案与错因附录页 */}
      {settings.includeAnswers && (
        <div className="print-page-break mt-12 pt-8 border-t-2 border-dashed border-slate-400">
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-1 rounded bg-slate-100 text-slate-700 text-sm font-bold tracking-wider border border-slate-300">
              【参考答案与解题反思】（仅供考后批改核对）
            </span>
          </div>
          <div className="space-y-4 text-xs">
            {items.map((item, idx) => (
              <div key={item.id} className="print-item p-3 rounded bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="font-bold text-slate-800">第 {idx + 1} 题【{item.subject}】参考答案与解析：</div>
                {item.reflection && <div className="text-amber-700 font-medium">重点错因警示：{item.reflection}</div>}
                <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">{item.analysis || '暂无详细文字解析'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function PaperView({ mistakes, basket, onClearBasket }: PaperViewProps) {
  const [title, setTitle] = useState('错题查漏补缺 · 自我突破重练卷');
  const [subtitle, setSubtitle] = useState('姓名：__________  日期：____年__月__日  得分：____');
  const [layout, setLayout] = useState<'columns' | 'single'>('columns');
  const [includeAnswers, setIncludeAnswers] = useState(true);

  const selectedList = mistakes.filter((m) => basket.has(m.id));
  const settings: SheetSettings = { title, subtitle, layout, includeAnswers };

  return (
    <section className="space-y-6">
      {/* 组卷控制台 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <span>重练测试卷配置</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">已选 {basket.size} 题</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">专为家庭打印机设计，自动排版为双栏 A4 试卷，隐藏解析仅留做题空间</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onClearBasket}
            className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg text-sm font-medium transition-all"
          >
            <i className="fa-solid fa-trash-can mr-1"></i> 清空组卷篮
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all flex items-center space-x-2"
          >
            <i className="fa-solid fa-print"></i>
            <span>立即打印 / 存为PDF</span>
          </button>
        </div>
      </div>

      {/* 试卷个性化设定 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <label className="block text-xs text-slate-500 mb-1">试卷标题</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">副标题 / 孩子姓名</label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">试卷版式</label>
          <select
            value={layout}
            onChange={(e) => setLayout(e.target.value as 'columns' | 'single')}
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-sm bg-white"
          >
            <option value="columns">标准双栏排版 (最省纸)</option>
            <option value="single">单栏大留白 (充足草稿区)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">文末附带答案页？</label>
          <select
            value={includeAnswers ? 'yes' : 'no'}
            onChange={(e) => setIncludeAnswers(e.target.value === 'yes')}
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-sm bg-white"
          >
            <option value="yes">是，试卷末尾附带答案供批改</option>
            <option value="no">否，仅输出练习题目</option>
          </select>
        </div>
      </div>

      {/* 试卷预览纸张 (模拟 A4 效果) */}
      <div className="bg-slate-200 p-4 sm:p-8 rounded-2xl flex justify-center">
        <div className="bg-white w-full max-w-4xl p-8 sm:p-12 shadow-md rounded-lg min-h-[900px] text-slate-900 border border-slate-300">
          <PaperSheetContent items={selectedList} settings={settings} />
        </div>
      </div>

      {/* 专门供浏览器原生调用的纯净打印层 */}
      <div id="printArea" className="print-only">
        <div className="bg-white p-2 text-slate-900">
          <PaperSheetContent items={selectedList} settings={settings} />
        </div>
      </div>
    </section>
  );
}
