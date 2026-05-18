import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Copy, Download, Check } from 'lucide-react';
import { useState } from 'react';

interface OutputPanelProps {
  content: string;
  fileName?: string;
  isLoading?: boolean;
}

export default function OutputPanel({ content, fileName = 'edi-output.txt', isLoading = false}: OutputPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="flex overflow-hidden flex-col max-h-full min-h-0">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 pb-4">
        <CardTitle>EDI Output</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleCopy}
            disabled={!content || isLoading}
            className="gap-2 h-fit w-fit px-2 py-1"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 border-0 bg-sky-50 overflow- h-full">
        <div>
          <code className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-700">
            {isLoading ? 'Generating EDI...' : content || 'Output will appear here after generation.'}
          </code>
        </div>
      </ScrollArea>

      <div className="border-t border-slate-200 p-4">
        <Button
          variant="primary"
          onClick={handleExport}
          disabled={!content || isLoading}
          className="w-full gap-2"
        >
          <Download className="h-4 w-4" />
          Export to File
        </Button>
      </div>
    </Card>
  );
}
