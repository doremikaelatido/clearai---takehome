import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';

export function ScrollArea({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('overflow-auto rounded-3xl border border-slate-800 p-4', className)}>{children}</div>
  );
}
