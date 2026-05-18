import { cn } from '@/lib/utils';
import type { TextareaHTMLAttributes } from 'react';

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-[200px] w-full rounded-3xl border px-4 py-4 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-60',
        props.className,
      )}
    />
  );
}
