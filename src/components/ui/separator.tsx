import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export function Separator(props: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn('my-5 h-px bg-slate-800', props.className)} />;
}
