// 难度星级显示/选择组件（用 emoji ★/☆ 显示）
interface StarRatingProps {
  value: number;             // 1-5
  editable?: boolean;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ value, editable, onChange, size = 'md' }: StarRatingProps) {
  const sizeCls = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base';
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={`inline-flex items-center gap-0.5 text-amber-500 ${sizeCls}`}>
      {stars.map((n) => (
        <span
          key={n}
          role={editable ? 'button' : undefined}
          tabIndex={editable ? 0 : undefined}
          onClick={editable && onChange ? () => onChange(n) : undefined}
          onKeyDown={editable && onChange ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(n); } } : undefined}
          style={{ cursor: editable ? 'pointer' : 'default' }}
          aria-label={`${n} 星`}
        >
          {n <= value ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
}
