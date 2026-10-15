import { useEffect, useRef, useState } from 'react';
import type { MistakeItem } from '../types';
import { REASONS, SUBJECTS } from '../constants';
import { compressImage } from '../lib/image';

interface CreateViewProps {
  pastedImage: string;
  onConsumePastedImage: () => void;
  onSaved: (item: MistakeItem) => void;
  onCancel: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning') => void;
}

export default function CreateView({ pastedImage, onConsumePastedImage, onSaved, onCancel, showToast }: CreateViewProps) {
  const [subject, setSubject] = useState('数学');
  const [source, setSource] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [selectedReasons, setSelectedReasons] = useState<Set<string>>(new Set());
  const [imageData, setImageData] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [reflection, setReflection] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pastedImage) {
      setImageData(pastedImage);
      onConsumePastedImage();
    }
  }, [pastedImage, onConsumePastedImage]);

  const resetForm = () => {
    setSubject('数学');
    setSource('');
    setDifficulty(3);
    setSelectedReasons(new Set());
    setImageData('');
    setQuestionText('');
    setReflection('');
    setAnalysis('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const ingestFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('请选择有效的图片文件', 'warning');
      return;
    }
    try {
      const compressed = await compressImage(file);
      setImageData(compressed);
      showToast('图片已成功压缩加载');
    } catch {
      showToast('图片处理失败，请重试', 'error');
    }
  };

  const toggleReason = (tag: string) => {
    setSelectedReasons((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageData && !questionText.trim()) {
      showToast('题目图片与文字至少需录入其中一项！', 'warning');
      return;
    }
    const newMistake: MistakeItem = {
      id: 'mistake_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      subject,
      source: source.trim() || '日常作业积累',
      difficulty,
      reasons: Array.from(selectedReasons),
      imageData,
      questionText: questionText.trim(),
      reflection: reflection.trim(),
      analysis: analysis.trim(),
      status: 'PENDING',
      createdAt: Date.now(),
      reviewCount: 0,
    };
    onSaved(newMistake);
    resetForm();
  };

  return (
    <section className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800">录入新错题</h2>
          <p className="text-xs text-slate-400 mt-0.5">支持电脑截图粘贴 (Ctrl+V) 及照片自动压缩，极速入库</p>
        </div>
        <span className="px-2.5 py-1 text-xs rounded-full bg-indigo-50 text-indigo-600 font-medium">自动无损压缩</span>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* 学科 + 来源 + 难度 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">所属学科 *</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s === '政治' ? '道法/政治' : s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">错题来源</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="如：期中模拟卷、课后作业"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">难度星级</label>
            <div className="flex items-center space-x-1.5 h-[38px] text-amber-400 text-lg cursor-pointer">
              {[1, 2, 3, 4, 5].map((i) =>
                i <= difficulty ? (
                  <i key={i} className="fa-solid fa-star" onClick={() => setDifficulty(i)}></i>
                ) : (
                  <i key={i} className="fa-regular fa-star" onClick={() => setDifficulty(i)}></i>
                ),
              )}
            </div>
          </div>
        </div>

        {/* 错因分类标签 */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">错因分类（可多选）</label>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((tag) => {
              const active = selectedReasons.has(tag);
              return (
                <span
                  key={tag}
                  onClick={() => toggleReason(tag)}
                  className={`reason-chip cursor-pointer px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    active
                      ? 'bg-indigo-600 text-white border border-indigo-600 shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>

        {/* 题目图片（支持粘贴与拖拽） */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            题目图片（重点推荐：直接在此页面按{' '}
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">Ctrl + V</kbd> 粘贴截图）
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files && e.dataTransfer.files[0];
              if (file) ingestFile(file);
            }}
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              dragOver ? 'border-indigo-500 bg-indigo-50/40' : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) ingestFile(file);
              }}
            />
            {!imageData ? (
              <div className="space-y-1">
                <i className="fa-solid fa-cloud-arrow-up text-2xl text-slate-400"></i>
                <p className="text-sm font-medium text-slate-600">点击上传、拖入照片，或直接按 Ctrl+V 粘贴截图</p>
                <p className="text-xs text-slate-400">系统将自动压缩至适中体积，保证本地流畅运行</p>
              </div>
            ) : (
              <div className="relative inline-block mt-2">
                <img src={imageData} alt="错题图片" className="max-h-64 rounded-lg shadow-sm border border-slate-200 object-contain mx-auto" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageData('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md hover:bg-rose-600"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 题目文字补充/题干 */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">题目文字补充说明 / 题干文本</label>
          <textarea
            rows={3}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="在此输入题目文本，或者对题目的简短摘录..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          ></textarea>
        </div>

        {/* 孩子反思与错因说明 */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">当时错误解法 & 孩子反思点</label>
          <textarea
            rows={2}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="当时错在哪里？漏看了什么条件？哪个公式记混了？"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          ></textarea>
        </div>

        {/* 正确答案与解析 */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">正确答案 & 详细解析（将呈现在卡片背面）</label>
          <textarea
            rows={3}
            value={analysis}
            onChange={(e) => setAnalysis(e.target.value)}
            placeholder="写下正解思路、关键步骤或解题技巧..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          ></textarea>
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            取消
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all flex items-center space-x-2"
          >
            <i className="fa-solid fa-check"></i>
            <span>保存并收入错题本</span>
          </button>
        </div>
      </form>
    </section>
  );
}
