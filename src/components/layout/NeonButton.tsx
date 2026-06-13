import { hexToRgb } from '@/utils/colors';

interface NeonButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
  variant?: 'filled' | 'outline';
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export default function NeonButton({
  onClick,
  children,
  color = '#FF2E97',
  variant = 'filled',
  size = 'md',
  disabled = false,
}: NeonButtonProps) {
  const rgb = hexToRgb(color);
  const sizeClasses = size === 'sm' ? 'px-3 py-1 text-sm' : 'px-4 py-2 text-base';

  const baseStyle: React.CSSProperties = {
    color: variant === 'filled' ? color : color,
    borderColor: variant === 'outline' ? color : 'transparent',
    borderWidth: variant === 'outline' ? 1 : 0,
    borderStyle: 'solid',
    backgroundColor: variant === 'filled' ? '#1A1A28' : 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    textShadow: disabled ? 'none' : `0 0 8px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`,
    transition: 'all 0.2s ease',
    outline: 'none',
    fontFamily: 'Rajdhani, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.05em',
  };

  const hoverStyle: React.CSSProperties = {
    boxShadow: `0 0 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4), 0 0 24px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
    textShadow: `0 0 12px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8), 0 0 24px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`,
    backgroundColor: variant === 'filled' ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)` : 'transparent',
    borderColor: variant === 'outline' ? color : 'transparent',
  };

  return (
    <button
      className={`${sizeClasses} rounded transition-all duration-200`}
      style={baseStyle}
      onMouseEnter={(e) => {
        if (!disabled) Object.assign(e.currentTarget.style, hoverStyle);
      }}
      onMouseLeave={(e) => {
        if (!disabled) Object.assign(e.currentTarget.style, baseStyle);
      }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
