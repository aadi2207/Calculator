import React, { useState } from 'react';
import { soundEngine, SoundType } from '../utils/soundEngine';

export interface KeypadButtonProps {
  label: React.ReactNode;
  sublabel?: string;
  badge?: string;
  variant?: 'digit' | 'fn' | 'op' | 'equal' | 'danger' | 'ghost' | 'active';
  sound?: SoundType;
  span?: number;
  heightClass?: string;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
  title?: string;
}

export const KeypadButton: React.FC<KeypadButtonProps> = ({
  label,
  sublabel,
  badge,
  variant = 'digit',
  sound = 'digit',
  span = 1,
  heightClass = 'h-13 sm:h-14',
  disabled = false,
  onClick,
  className = '',
  title,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Variant color definitions based on CSS variables
  let variantStyles = 'bg-theme-btn text-theme-text border-theme-border/80 hover:bg-theme-btn-hover active:bg-theme-btn-active';

  if (variant === 'fn') {
    variantStyles = 'bg-theme-btn-fn text-theme-text-muted hover:text-theme-text hover:bg-theme-btn-fn-hover border-theme-border/70 font-medium';
  } else if (variant === 'op') {
    variantStyles = 'bg-theme-btn-op text-theme-accent hover:bg-theme-btn-op-hover border-theme-accent/30 font-semibold';
  } else if (variant === 'equal') {
    variantStyles = 'bg-theme-btn-equal text-white hover:bg-theme-btn-equal-hover border-blue-400/40 font-bold shadow-md shadow-blue-500/20';
  } else if (variant === 'danger') {
    variantStyles = 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30 font-medium';
  } else if (variant === 'active') {
    variantStyles = 'bg-theme-accent/20 text-theme-accent border-theme-accent font-semibold ring-1 ring-theme-accent/50';
  } else if (variant === 'ghost') {
    variantStyles = 'bg-transparent text-theme-text-muted hover:bg-theme-elevated border-transparent';
  }

  const spanClass = span === 2 ? 'col-span-2' : span === 3 ? 'col-span-3' : span === 4 ? 'col-span-4' : 'col-span-1';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    soundEngine.play(sound);
    onClick();
  };

  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={handleClick}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => !disabled && setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={`
        relative group flex flex-col items-center justify-center
        rounded-xl border select-none transition-all duration-75
        ${heightClass} ${spanClass} ${variantStyles}
        ${disabled ? 'opacity-35 cursor-not-allowed filter grayscale pointer-events-none' : 'cursor-pointer'}
        ${isPressed ? 'translate-y-[2px] shadow-tactile-pressed' : 'shadow-tactile hover:-translate-y-[1px]'}
        ${className}
      `}
    >
      {/* Keyboard hotkey hint badge */}
      {badge && (
        <span className="absolute top-1 right-1.5 text-[9px] font-mono opacity-40 group-hover:opacity-80 transition-opacity">
          {badge}
        </span>
      )}

      {/* Main label */}
      <span className="text-base sm:text-lg font-mono tracking-tight leading-none">
        {label}
      </span>

      {/* Sublabel if present */}
      {sublabel && (
        <span className="text-[10px] font-mono text-theme-text-dim mt-0.5 leading-none">
          {sublabel}
        </span>
      )}
    </button>
  );
};
