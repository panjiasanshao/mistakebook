// 3D 翻转卡片组件
import type { ReactNode } from 'react';

interface FlipCardProps {
  flipped: boolean;
  onFlip: () => void;
  front: ReactNode;
  back: ReactNode;
}

export function FlipCard({ flipped, onFlip, front, back }: FlipCardProps) {
  return (
    <div
      className={`flip-card${flipped ? ' flipped' : ''}`}
      onClick={onFlip}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onFlip(); } }}
    >
      <div className="flip-card-inner">
        <div className="flip-card-front">{front}</div>
        <div className="flip-card-back">{back}</div>
      </div>
    </div>
  );
}
