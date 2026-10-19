// 录入错题视图：Ctrl+V 粘贴、拖拽上传、Canvas 压缩、元数据录入
import { useCallback, useEffect, useRef, useState } from 'react';
import { StarRating } from '../components/StarRating';
import { compressImage } from '../db/imagePipeline';
import { REASON_TAGS, SUBJECTS, type ReasonTag, type Subject } from '../types/mistake';

interface CreateViewProps {
  onSave: (input: {
    subject: Subject;
    source: string;
    difficulty: number;
    reasons: ReasonTag[];
    questionText: string;
    reflection: string;
    analysis: string;
    imageData?: string;
  }) => Promise<unknown>;
  onCancel: () => void;
}

export function CreateView({ onSave, onCancel }: CreateViewProps) {
  const [subject, setSubject] = useState<Subject>('数学');
  const [source, setSource] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [reasons, setReasons] = useState<Set<ReasonTag>>(new Set());
  const [questionText, setQuestionText] = useState('');
  const [reflection, setReflection] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [imageData, setImageData] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function toggleReason(r: ReasonTag) {
    setReasons((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r); else next.add(r);
      return next;
    });
  }

  const handleImageFile = useCallback(async (file: File) => {
    setBusy(true); setError(null);
    try {
      const dataUrl = await compressImage(file);
      setImageData(dataUrl);
    } catch (e) {
      setError('图片处理失败：' + (e as Error).message);
    } finally { setBusy(false); }
  }, []);

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) void handleImageFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) void handleImageFile(f);
  }

  function clearImage() {
    setImageData(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // 全局 Ctrl+V 粘贴截图
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const it of items) {
        if (it.type.startsWith('image/')) {
          const f = it.getAsFile();
          if (f) {
            e.preventDefault();
            void handleImageFile(f);
            break;
          }
        }
      }
    }
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [handleImageFile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await onSave({
        subject, source, difficulty,
        reasons: Array.from(reasons),
        questionText, reflection, analysis,
        imageData,
      });
      onCancel();
    } catch (err) {
      setError('保存失败：' + (err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <section className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">录入新错题</h2>
          <p className="text-xs text-slate-400 mt-0.5">支持电脑截图粘贴 (Ctrl+V) 及照片自动压缩，极速入库</p>
        </div>
        <span className="px-2.5 py-1 text-xs rounded-full font-medium"
          style={{ backgroundColor: 'var(--app-primary-light)', color: 'var(--app-primary-text)' }}>
          自动无损压缩
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">所属学科 *</label>
            <select value={subject} onChange={(e) => setSubject(e.target.value as Subject)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">错题来源</label>
            <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="如：期中模拟卷、课后作业"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">难度星级</label>
            <div className="flex items-center h-[38px]">
              <StarRating value={difficulty} editable onChange={setDifficulty} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">错因分类（可多选）</label>
          <div className="flex flex-wrap gap-2">
            {REASON_TAGS.map((r) => {
              const active = reasons.has(r);
              return (
                <button type="button" key={r} onClick={() => toggleReason(r)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${active ? 'text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  style={active ? { backgroundColor: 'var(--app-primary)', borderColor: 'var(--app-primary)' } : undefined}>
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            题目图片（重点推荐：直接在此页面按 <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">Ctrl + V</kbd> 粘贴截图）
          </label>
          <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-4 text-center cursor-pointer transition-all bg-slate-50/50">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
            {!imageData ? (
              <div className="space-y-1">
                <div className="text-2xl">☁️⬆️</div>
                <p className="text-sm font-medium text-slate-600">点击上传、拖入照片，或直接按 Ctrl+V 粘贴截图</p>
                <p className="text-xs text-slate-400">系统将自动压缩至适中体积，保证本地流畅运行</p>
              </div>
            ) : (
              <div className="relative inline-block">
                <img src={imageData} alt="预览" className="max-h-64 rounded-lg shadow-sm border border-slate-200 object-contain mx-auto" />
                <button type="button" onClick={(e) => { e.stopPropagation(); clearImage(); }}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-rose-600">
                  ✕
                </button>
              </div>
            )}
            {busy && <p className="text-xs mt-2" style={{ color: 'var(--app-primary-text)' }}>⏳ 压缩中...</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">题目文字补充说明 / 题干文本</label>
          <textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} rows={3}
            placeholder="在此输入题目文本，或者对题目的简短摘录..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">当时错误解法 & 孩子反思点</label>
          <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={2}
            placeholder="当时错在哪里？漏看了什么条件？哪个公式记混了？"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">正确答案 & 详细解析（将呈现在卡片背面）</label>
          <textarea value={analysis} onChange={(e) => setAnalysis(e.target.value)} rows={3}
            placeholder="写下正解思路、关键步骤或解题技巧..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
        </div>

        {error && <p className="text-sm text-rose-600">❗ {error}</p>}

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button type="button" onClick={onCancel}
            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">取消</button>
          <button type="submit" disabled={busy}
            className="px-6 py-2 text-white rounded-lg text-sm font-medium shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
            style={{ backgroundColor: 'var(--app-primary)' }}>
            <span>✓</span><span>保存并收入错题本</span>
          </button>
        </div>
      </form>
    </section>
  );
}
