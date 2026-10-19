// 状态徽章组件
import { STATUS_LABEL, STATUS_TONE, type MistakeStatus } from '../types/mistake';

interface StatusBadgeProps {
  status: MistakeStatus;
}

const TONE_CLS: Record<string, string> = {
  rose: 'bg-rose-100 text-rose-700 border-rose-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const tone = STATUS_TONE[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${TONE_CLS[tone]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
