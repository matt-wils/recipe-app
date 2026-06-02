import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-emerald-600 text-white active:bg-emerald-700 disabled:opacity-50',
  secondary: 'bg-gray-100 text-gray-900 active:bg-gray-200',
  danger: 'bg-red-600 text-white active:bg-red-700',
  ghost: 'bg-transparent text-emerald-700 active:bg-emerald-50',
};

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`min-h-12 rounded-xl px-4 font-medium transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
