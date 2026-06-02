import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

const base =
  'w-full min-h-12 rounded-xl border border-gray-300 bg-white px-3 text-base outline-none focus:border-emerald-500';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${base} ${className}`} {...props} />;
}

export function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${base} py-2 leading-relaxed ${className}`} {...props} />;
}
