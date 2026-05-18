import { cn } from '@/lib/utils';
import type { HTMLAttributes, PropsWithChildren } from 'react';

export function Table({ className, children }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={cn('overflow-hidden rounded-xl border', className)}>
      <table className="min-w-full border-separate border-spacing-0 text-sm text-slate-100">{children}</table>
    </div>
  );
}

export function TableHeader({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <thead className={cn('', className)}>{children}</thead>;
}

export function TableRow({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <tr className={cn('transition', className)}>{children}</tr>;
}

export function TableHead({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <th className={cn('border-b px-4 py-3 text-left text-xs uppercase tracking-[0.15em] text-slate-400 text-center', className)}>{children}</th>;
}

export function TableBody({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <tbody className={cn('', className)}>{children}</tbody>;
}

export function TableCell({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <td className={cn('border-b px-4 py-4 text-sm text-slate-100 text-center', className)}>{children}</td>;
}

export function TableCaption({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <caption className={cn('px-4 py-3 text-left text-xs text-slate-500', className)}>{children}</caption>;
}
