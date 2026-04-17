import React from 'react';

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  min?: string;
  max?: string;
  type?: string;
  auth?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  placeholder,
  min,
  max,
  type = 'text',
  auth = false,
  className,
}) => {
    
    const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {};
    if(type === 'text' && !auth  ) {
        inputProps.inputMode = 'numeric';
        inputProps.onInput = (e) => {
            const input = e.target as HTMLInputElement;
            
            input.value = input.value.replace(/[^0-9.]/g, '');
            const parts = input.value.split('.');
            if (parts.length > 2) {
                input.value = parts[0] + '.' + parts.slice(1).join('');
            }
        }
    }

    return (
        <input
        type={type}
        {...inputProps}   
        placeholder={placeholder}
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`w-full flex-1 bg-slate-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${className}`}
    />
    );
};