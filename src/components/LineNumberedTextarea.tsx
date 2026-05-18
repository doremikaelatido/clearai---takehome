import { useRef } from 'react';

interface LineNumberedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function LineNumberedTextarea({
  value,
  onChange,
  placeholder,
  className = '',
}: LineNumberedTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lineNumbersRef = useRef<HTMLDivElement | null>(null);

  const lineCount = value.split('\n').length;

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div
        className={`relative flex rounded-lg border border-slate-300 bg-white overflow-hidden ${className}`}
        style={{ height: '300px' }}
    >
      <div
        ref={lineNumbersRef}
        className="
            flex-shrink-0
            overflow-hidden
            bg-slate-100
            text-right
            text-xs
            text-slate-500
            select-none
        "
        style={{
            minWidth: '3rem',
            paddingRight: '0.5rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1} className="h-6 leading-6">
            {i + 1}
          </div>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        placeholder={placeholder}
        wrap="off"
        spellCheck={false}
        className="
            flex-1
            resize-none
            border-0
            outline-none
            font-mono
            text-sm
            leading-6
            p-2
            bg-transparent
            whitespace-pre
            overflow-auto
            text-slate-900
            caret-slate-900
        "
      />
    </div>
  );
}

export default LineNumberedTextarea;