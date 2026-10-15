import type { BackupFile, MistakeItem } from '../types';

export function buildBackupJson(mistakes: MistakeItem[]): string {
  const payload: BackupFile = {
    appName: 'ChildMistakeBook',
    version: '2.1.0',
    exportDate: new Date().toISOString(),
    totalCount: mistakes.length,
    data: mistakes,
  };
  return JSON.stringify(payload, null, 2);
}

export function downloadBackup(json: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  a.href = url;
  a.download = `错题本备份包_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseBackup(text: string): MistakeItem[] {
  const parsed = JSON.parse(text) as Partial<BackupFile>;
  if (!parsed.data || !Array.isArray(parsed.data)) {
    throw new Error('备份文件格式不正确');
  }
  return parsed.data as MistakeItem[];
}
