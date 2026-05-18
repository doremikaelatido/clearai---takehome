import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
}

export function Button({ className, variant = 'primary', ...props }: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-sky-500 text-white hover:bg-sky-600',
        variant === 'secondary' && 'text-slate-900 hover:bg-slate-300',
        variant === 'outline' && 'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50',
        variant === 'ghost' && 'bg-transparent text-slate-700 hover:bg-slate-100',
        className,
      )}
      {...props}
    />
  );
}
