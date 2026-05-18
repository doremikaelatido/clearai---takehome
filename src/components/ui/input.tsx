import { cn } from '@/lib/utils';
import type { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'flex h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 transition-shadow focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-60',
        props.className,
      )}
    />
  );
}
