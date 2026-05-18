import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import type { PropsWithChildren } from 'react';

interface FileUploadProps extends PropsWithChildren {
  onFileSelect: (content: string, fileName: string) => void;
  accept?: string;
  className?: string;
}

export default function FileUpload({
  onFileSelect,
  accept = '.txt,.txt',
  className,
  children,
}: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onFileSelect(content, file.name);
    };
    reader.readAsText(file);

    e.target.value = '';
  };

  return (
    <label className={cn('group relative inline-block cursor-pointer', className)}>
      <input
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      {children}
    </label>
  );
}
