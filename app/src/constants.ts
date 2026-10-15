export const SUBJECTS = ['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治', '其他'];

export const REASONS = ['概念不清', '审题粗心', '计算失误', '思路堵塞', '新颖题型', '公式混淆'];

export interface ThemePalette {
  key: string;
  label: string;
  primary: string;
  light: string;
  text: string;
  swatch: string;
  borderClass: string;
  lightBgClass: string;
}

export const THEMES: ThemePalette[] = [
  { key: 'indigo', label: '经典靛蓝', primary: '#4f46e5', light: '#eef2ff', text: '#4338ca', swatch: 'bg-indigo-600', borderClass: 'border-indigo-600', lightBgClass: 'bg-indigo-50/40' },
  { key: 'emerald', label: '森林草绿', primary: '#059669', light: '#ecfdf5', text: '#065f46', swatch: 'bg-emerald-600', borderClass: 'border-emerald-600', lightBgClass: 'bg-emerald-50/40' },
  { key: 'amber', label: '晚霞暖杏', primary: '#d97706', light: '#fffbeb', text: '#92400e', swatch: 'bg-amber-500', borderClass: 'border-amber-500', lightBgClass: 'bg-amber-50/40' },
  { key: 'sky', label: '晴空碧海', primary: '#0284c7', light: '#f0f9ff', text: '#0369a1', swatch: 'bg-sky-500', borderClass: 'border-sky-500', lightBgClass: 'bg-sky-50/40' },
  { key: 'purple', label: '优雅紫罗兰', primary: '#7c3aed', light: '#f5f3ff', text: '#5b21b6', swatch: 'bg-purple-600', borderClass: 'border-purple-600', lightBgClass: 'bg-purple-50/40' },
];

export const THEME_STORAGE_KEY = 'child_mistake_theme';

export const STATUS_LABELS: Record<string, string> = {
  PENDING: '待攻克',
  PROGRESS: '攻克中',
  MASTERED: '已掌握 👏',
};
