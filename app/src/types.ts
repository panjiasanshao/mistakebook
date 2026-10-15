export type MistakeStatus = 'PENDING' | 'PROGRESS' | 'MASTERED';

export interface MistakeItem {
  id: string;
  subject: string;
  source: string;
  difficulty: number; // 难度星级 1-5
  reasons: string[];
  questionText: string;
  reflection: string;
  analysis: string;
  status: MistakeStatus;
  createdAt: number;
  reviewCount: number;
  imageData?: string;
}

export interface BackupFile {
  appName: string;
  version: string;
  exportDate: string;
  totalCount: number;
  data: MistakeItem[];
}
