import React from 'react';
import type { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
}) => {
  // Check if custom colors are provided
  const hasCustomColors = className.includes('bg-') || className.includes('text-');

  // Base styles
  const baseStyles = 'rounded-lg font-medium transition-all flex items-center justify-center gap-2';

  // Variant styles
  const variantStyles = {
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-none',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    tertiary: 'text-purple-400 hover:text-purple-300 border-gray-600 rounded-lg hover:border-purple-500 hover:bg-purple-500/10',
    ghost: 'hover:bg-white/10 text-white',
    outline: 'border-2 border-dashed border-gray-600 hover:border-purple-500 hover:bg-purple-500/10 text-white',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  // Disabled styles
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';

  const combinedStyles = `
    ${baseStyles}
    ${hasCustomColors ? '' : variantStyles[variant] }
    ${sizeStyles[size]}
    ${disabledStyles}
    ${widthStyles}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedStyles}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};