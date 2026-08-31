interface ProgressBarProps {
  percent: number;
  className?: string;
  size?: 'sm' | 'md';
}

export default function ProgressBar({ percent, className = '', size = 'md' }: ProgressBarProps) {
  const height = size === 'sm' ? '2px' : '3px';
  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      style={{ height, background: 'rgba(220, 194, 151, 0.12)' }}
    >
      <div
        className="h-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: 'var(--color-gold)' }}
      />
    </div>
  );
}
