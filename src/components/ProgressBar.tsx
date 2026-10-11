interface ProgressBarProps {
  percent: number;
  className?: string;
  size?: 'sm' | 'md';
}

export default function ProgressBar({ percent, className = '', size = 'md' }: ProgressBarProps) {
  const height = size === 'sm' ? '2px' : '3px';
  return (
    <div className={`progress-track ${className}`} style={{ height }}>
      <div
        className="progress-fill"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  );
}
