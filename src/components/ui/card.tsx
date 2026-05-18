import { cn } from '@/lib/utils';
import type { PropsWithChildren } from 'react';

export function Card({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('rounded-3xl border border-slate-200 bg-white shadow-soft', className)}>{children}</div>
  );
}

export function CardHeader({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('flex flex-col gap-2 border-b border-slate-200 px-6 py-5', className)}>{children}</div>;
}

export function CardTitle({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>;
}

export function CardContent({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('p-6', className)}>{children}</div>;
}

export function CardFooter({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4', className)}>{children}</div>;
}
