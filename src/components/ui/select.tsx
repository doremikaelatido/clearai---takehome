import { cn } from '@/lib/utils';
import type { SelectHTMLAttributes } from 'react';

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'flex h-11 w-full rounded-xl border border-slate-300 px-4 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-60',
        props.className,
      )}
    />
  );
}
