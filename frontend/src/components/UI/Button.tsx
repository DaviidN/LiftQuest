import React from 'react';
import type { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  menu?: boolean;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  menu = false,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
}) => {

  // Base styles
  const baseStyles = `rounded-lg font-medium transition-all flex items-center gap-2 focus:outline-none ${menu ? "justify-start" : "justify-center"}`;

  // Variant styles
  const variantStyles = {
    primary: 'bg-gradient-to-r from-btnPrimary-from to-btnPrimary-to hover:from-btnPrimaryHover-from hover:to-btnPrimaryHover-to text-white border-none',
    secondary: 'bg-btnSecondary hover:bg-btnSecondaryHover border-purple-500/30 hover:border-purple-500/50 text-purple-200',
    tertiary: 'bg-btnTertiary hover:bg-btnTertiaryHover border-slate-500 hover:border-slate-400',
    ghost: 'border-none hover:bg-btnGhostHover',
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
    ${variantStyles[variant]}
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
      className={`text-center ${combinedStyles}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};