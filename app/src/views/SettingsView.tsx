import { useRef } from 'react';
import type { MistakeItem } from '../types';
import { THEMES } from '../constants';

interface SettingsViewProps {
  mistakes: MistakeItem[];
  themeKey: string;
  onApplyTheme: (key: string) => void;
  onExport: () => void;
  onImportFile: (file: File) => void;
}

const THEME_LABELS: Record<string, string> = {
  indigo: '经典靛蓝',
  emerald: '森林草绿',
  amber: '晚霞暖杏',
  sky: '晴空碧海',
  purple: '优雅紫罗兰',
};

export default function SettingsView({ mistakes, themeKey, onApplyTheme, onExport, onImportFile }: SettingsViewProps) {
  const importInputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl font-bold text-slate-800">系统设置与偏好</h2>
          <p className="text-xs text-slate-400 mt-1">个性化主题色彩定制，以及本地数据迁移和备份中心</p>
        </div>

        {/* 1. 多配色方案 */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <label className="block text-sm font-bold text-slate-700">
            <i className="fa-solid fa-palette text-indigo-500 mr-1.5"></i> 界面配色主题
          </label>
          <p className="text-xs text-slate-400">为孩子挑选喜欢的界面风格，保护视力且激发学习兴趣：</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
            {THEMES.map((theme) => {
              const active = themeKey === theme.key;
              return (
                <button
                  key={theme.key}
                  type="button"
                  onClick={() => onApplyTheme(theme.key)}
                  className={`theme-btn border-2 p-3 rounded-xl flex flex-col items-center space-y-2 hover:shadow-sm transition-all text-center ${
                    active ? `${theme.borderClass} ${theme.lightBgClass}` : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full shadow-inner flex items-center justify-center text-white text-xs ${theme.swatch}`}>
                    {active && <i className="fa-solid fa-check"></i>}
                  </div>
                  <span className="text-xs font-semibold text-slate-800">{theme.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. 换机备份与数据导出 */}
        <div className="space-y-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-700 flex items-center">
              <i className="fa-solid fa-floppy-disk text-indigo-500 mr-1.5"></i> 换机备份与数据迁移
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">所有题目及图片均保存在本机浏览器中，可打包备份下载并在新电脑一键还原。</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border border-slate-200 bg-slate-50/50 p-4 rounded-xl space-y-2.5">
              <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs">
                <i className="fa-solid fa-file-export"></i>
                <span>导出数据备份包</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">打包下载包含题目、反思及压缩图片的 .json 文件，适合保存到 U 盘或网盘。</p>
              <button
                type="button"
                onClick={onExport}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-all shadow-sm"
              >
                <i className="fa-solid fa-download mr-1"></i> 立即导出并保存
              </button>
            </div>

            <div className="border border-slate-200 bg-slate-50/50 p-4 rounded-xl space-y-2.5">
              <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs">
                <i className="fa-solid fa-file-import"></i>
                <span>导入恢复错题本</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">在新电脑或换浏览器后，选择导出的备份文件即可完整无损还原。</p>
              <label className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-all shadow-sm flex items-center justify-center cursor-pointer">
                <i className="fa-solid fa-upload mr-1"></i> 选择备份文件恢复
                <input
                  ref={importInputRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImportFile(file);
                    if (importInputRef.current) importInputRef.current.value = '';
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        {/* 3. 本地存储概览与版本号 */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs text-slate-600">
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-500">当前错题总数：</span>
            <span className="font-mono font-bold text-indigo-600">{mistakes.length} 道</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-500">数据引擎：</span>
            <span className="text-slate-700">IndexedDB 本地大容量私有数据库</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-500">软件版本：</span>
            <span className="font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold">v2.1.0 (Family Edition)</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-[11px] text-slate-400">
            <span>最后更新日期：2026年10月</span>
            <span>无联网授权 · 纯单机离线运行</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export { THEME_LABELS };
