// 错题本数据类型定义
export type Subject =
  | '数学' | '语文' | '英语' | '物理' | '化学'
  | '生物' | '历史' | '地理' | '道法/政治' | '其他';

export type ReasonTag =
  | '概念不清' | '审题粗心' | '计算失误'
  | '思路堵塞' | '新颖题型' | '公式混淆';

export type MistakeStatus = 'PENDING' | 'PROGRESS' | 'MASTERED';

export interface MistakeItem {
  id: string;
  subject: Subject;
  source: string;
  difficulty: number;
  reasons: ReasonTag[];
  questionText: string;
  reflection: string;
  analysis: string;
  status: MistakeStatus;
  createdAt: number;
  reviewCount: number;
  imageData?: string;
  inBasket?: boolean;
}

export const SUBJECTS: Subject[] = [
  '数学', '语文', '英语', '物理', '化学',
  '生物', '历史', '地理', '道法/政治', '其他',
];

export const REASON_TAGS: ReasonTag[] = [
  '概念不清', '审题粗心', '计算失误',
  '思路堵塞', '新颖题型', '公式混淆',
];

export const STATUS_LABEL: Record<MistakeStatus, string> = {
  PENDING: '待攻克',
  PROGRESS: '攻克中',
  MASTERED: '已掌握',
};

export const STATUS_TONE: Record<MistakeStatus, 'rose' | 'amber' | 'emerald'> = {
  PENDING: 'rose',
  PROGRESS: 'amber',
  MASTERED: 'emerald',
};

export const STATUS_ICON: Record<MistakeStatus, string> = {
  PENDING: '⚠️',
  PROGRESS: '🚀',
  MASTERED: '👏',
};

export type ThemeKey = 'indigo' | 'forest' | 'sunset' | 'ocean' | 'violet';

export interface ThemePreset {
  key: ThemeKey;
  name: string;
  emoji: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryText: string;
}

export const THEMES: ThemePreset[] = [
  { key: 'indigo', name: '经典靛蓝', emoji: '🔵', primary: '#4f46e5', primaryDark: '#4338ca', primaryLight: '#eef2ff', primaryText: '#4338ca' },
  { key: 'forest', name: '森林草绿', emoji: '🌿', primary: '#059669', primaryDark: '#047857', primaryLight: '#ecfdf5', primaryText: '#065f46' },
  { key: 'sunset', name: '晚霞暖杏', emoji: '🌅', primary: '#ea580c', primaryDark: '#c2410c', primaryLight: '#fff7ed', primaryText: '#9a3412' },
  { key: 'ocean', name: '晴空碧海', emoji: '🌊', primary: '#0891b2', primaryDark: '#0e7490', primaryLight: '#ecfeff', primaryText: '#155e75' },
  { key: 'violet', name: '优雅紫罗兰', emoji: '🟣', primary: '#7c3aed', primaryDark: '#6d28d9', primaryLight: '#f5f3ff', primaryText: '#5b21b6' },
];
