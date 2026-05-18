import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Textarea replaced by LineNumberedTextarea
import OutputPanel from '@/components/OutputPanel';
import SummaryTable from '@/components/SummaryTable';
import FileUpload from '@/components/FileUpload';
import type { DecodedEdiItem } from '@/lib/types';
import { Upload } from 'lucide-react';
import { LineNumberedTextarea } from '@/components/LineNumberedTextarea';

/**
 * Decode EDI Page
 *
 * Layout:
 * - Left panel: File upload, EDI textarea input, decode button
 * - Right panel: Decoded cargo items in summary table (read-only)
 *
 * Workflow:
 * - Users import .txt file or paste EDI text
 * - Click "Decode EDI" to parse mock data
 * - Right panel shows decoded cargo items in table
 * - editingMode=false so no edit/delete buttons appear
 */
export default function DecodeEdiPage() {
    const [rawEdiText, setRawEdiText] = useState<string>('');
    const [decodedItems, setDecodedItems] = useState<DecodedEdiItem[]>([]);
    const [isDecoding, setIsDecoding] = useState(false);
    const [decodeError, setDecodeError] = useState<string>('');
    const [decodeWarnings, setDecodeWarnings] = useState<string[]>([]);

    /**
   * Inserts a newline character after every single quote ('),
   * unless the single quote is immediately preceded by a question mark (?).
   * 
   * @param text - The raw EDI or input string to format.
   * @returns The prettified string with formatted newlines.
   */
    const handleFormat = () => {
        if (!rawEdiText) return;

        // (?<!\?) matches a position not preceded by a question mark
        // ' matches the literal single quote
        // (?!\n) matches a position not followed by a newline
        setRawEdiText(prev => prev.replace(/(\n)/g, "").replace(/(?<!\?)'/g, "'\n"));
    };

    // Decode EDI by calling backend API
    const handleDecodeEdi = async () => {
        if (!rawEdiText.trim()) {
            return;
        }

        setIsDecoding(true);
        setDecodeError('');
        setDecodeWarnings([]);

        try {
            const auth = localStorage.getItem('auth');
            const token = auth ? JSON.parse(auth).token : null;

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:8000/edi/edi-to-json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ edi: rawEdiText }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const detail = errorData.detail;
                if (detail && typeof detail === 'object') {
                    const errors = Array.isArray(detail.errors) ? detail.errors : [];
                    const warnings = Array.isArray(detail.warnings) ? detail.warnings : [];
                    
                    if (errors.length > 0) {
                        setDecodeError(errors.join('; '));
                        setDecodeWarnings(warnings);
                        setDecodedItems([]);
                        setIsDecoding(false);
                        return;
                    }
                    // If only warnings, proceed with parsing
                    setDecodeWarnings(warnings);
                } else {
                    throw new Error(detail || 'Failed to decode EDI');
                }
            }

            const data = await response.json();
            setDecodedItems(data.cargoItems || []);
        } catch (error) {
            console.error('Error decoding EDI:', error);
            setDecodedItems([]);
            setDecodeError(error instanceof Error ? error.message : 'Failed to decode EDI');
            setDecodeWarnings([]);
        } finally {
            setIsDecoding(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="mb-6">
                <h1 className="text-3xl font-semibold">Decode EDI</h1>
                <p className="mt-1 text-sm">
                    Import EDI files or paste raw EDI text to decode and review
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* LEFT PANEL */}
                <div className="space-y-6">
                    {/* EDI Text Input */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base">EDI Text</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <LineNumberedTextarea
                                placeholder="Paste your EDI text here, or import a file above..."
                                value={rawEdiText}
                                onChange={(val: string) => setRawEdiText(val)}
                                className="h-full"
                            />
                        </CardContent>
                    </Card>

                    {/* Decode Button */}
                    <div className="flex gap-4">
                        <Button
                            onClick={handleFormat}
                            variant="secondary"
                            className="w-full"
                            disabled={!rawEdiText.trim() || isDecoding}
                        >
                            Format
                        </Button>
                        <Button
                            onClick={handleDecodeEdi}
                            variant="primary"
                            className="w-full"
                            disabled={!rawEdiText.trim() || isDecoding}
                        >
                            {isDecoding ? 'Decoding...' : 'Decode EDI'}
                        </Button>
                    </div>
                    {decodeError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {decodeError}
                        </div>
                    )}
                    {decodeWarnings.length > 0 && (
                        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                            {decodeWarnings.map((warning, idx) => (
                                <div key={idx}>{warning}</div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT PANEL */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
                        Decoded Items
                    </h2>
                    <SummaryTable
                        data={decodedItems}
                        editingMode={false}
                        decodingMode={true}
                    />
                </div>
            </div>
        </div>
    );
}
