import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import CargoForm from '@/components/CargoForm';
import OutputPanel from '@/components/OutputPanel';
import SummaryTable from '@/components/SummaryTable';
import { createEmptyCargoItem } from '@/lib/edi';
import type { CargoItem } from '@/lib/types';
import { Plus } from 'lucide-react';
import request from '@/lib/api';

/**
 * Generate EDI Page
 *
 * Layout:
 * - Left panel: Summary table, cargo form, action buttons
 * - Right panel: EDI output textarea, copy + export buttons
 *
 * Workflow:
 * - One empty cargo item exists by default
 * - Users can add more cargo items
 * - Click table row to edit that item in the form
 * - Only one item editable at a time
 * - Generate EDI button creates mock EDI output
 */
export default function GenerateEdiPage() {
    const [cargoItems, setCargoItems] = useState<CargoItem[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [ediOutput, setEdiOutput] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCreatingMode, setIsCreatingMode] = useState(false);
    const [generateError, setGenerateError] = useState<string>('');
    const [generateWarnings, setGenerateWarnings] = useState<string[]>([]);

    const selectedItem = cargoItems.find((item) => item.id === selectedId) || null;

    const handleCancel = (() => {
        if (isCreatingMode) {
            setCargoItems((prev) => prev.slice(0, -1));
        }
        setSelectedId(null);
        setIsCreatingMode(false);
    });

    // Add a new empty cargo item
    const handleAddCargo = () => {
        const newItem = createEmptyCargoItem();
        setCargoItems([...cargoItems, newItem]);
        setSelectedId(newItem.id);
        setIsCreatingMode(true);
    };

    // Update the currently selected cargo item
    const handleSaveItem = useCallback((updatedItem: CargoItem) => {
        setCargoItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
        setSelectedId(null);
    }, []);

    // Delete a cargo item
    const handleDeleteItem = (id: string) => {
        const updated = cargoItems.filter((item) => item.id !== id);
        setCargoItems(updated);
        if (selectedId === id) {
            setSelectedId(updated[0]?.id || null);
        }
    };

    // Select a cargo item from the table
    const handleSelectRow = (item: CargoItem) => {
        setSelectedId(item.id);
        setIsCreatingMode(false);
    };

    // Reset: clear all cargo items
    const handleReset = () => {
        if (confirm('Are you sure you want to clear all cargo items?')) {
            setCargoItems([]);
            setSelectedId(null);
            setEdiOutput('');
        }
    };

    // Load JSON: validate and load cargo items from backend
    const handleLoadJson = (items: CargoItem[], errorMessage?: string) => {
        if (errorMessage) {
            console.error('Error loading JSON:', errorMessage);
            alert(`Failed to load JSON: ${errorMessage}`);
            return;
        }
        // Validate items are CargoItem type and set them
        if (Array.isArray(items) && items.length > 0) {
            setCargoItems(items);
            setSelectedId(null);
            setEdiOutput('');
        } else {
            alert('No valid cargo items found in JSON file');
        }
    };

    const normalizeCargoType = (cargoType: unknown) => {
        if (typeof cargoType === 'string') {
            return cargoType;
        }

        if (cargoType && typeof cargoType === 'object' && 'value' in cargoType) {
            return String((cargoType as { value: unknown }).value);
        }

        return String(cargoType ?? '');
    };

    // Generate EDI by calling backend API
    const handleGenerateEdi = async () => {
        setIsGenerating(true);
        setGenerateError('');
        setGenerateWarnings([]);
        try {
            const token = localStorage.getItem('auth')
                ? JSON.parse(localStorage.getItem('auth') || '{}').token
                : null;

            if (!token) {
                throw new Error('No authentication token found');
            }

            const payload = {
                cargoItems: cargoItems.map((item) => ({
                    ...item,
                    cargoType: normalizeCargoType(item.cargoType),
                })),
            };

            const data = await request('/edi/json-to-edi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!data.edi) {
                const detail = data.detail || {};
                if (detail && typeof detail === 'object') {
                    const errors = Array.isArray(detail.errors) ? detail.errors : [];
                    const warnings = Array.isArray(detail.warnings) ? detail.warnings : [];

                    if (errors.length > 0) {
                        setGenerateError(errors.join('; '));
                        setGenerateWarnings(warnings);
                        setIsGenerating(false);
                        return;
                    }
                    // If only warnings, proceed with generation
                    setGenerateWarnings(warnings);
                } else {
                    throw new Error(detail || 'Failed to generate EDI');
                }
            }
            setEdiOutput(data.edi);
        } catch (error) {
            console.error('Error generating EDI:', error);
            setGenerateError(error instanceof Error ? error.message : 'Failed to generate EDI');
            setEdiOutput('');
            setGenerateWarnings([]);
        } finally {
            setIsGenerating(false);
        }
    };

    const isFormValid = cargoItems.every(
        (item) => item.cargoType && item.numberOfPackages > 0,
    );

    return (
        <div className="space-y-8 space-x-5 h-[90%]">
            <div className="mb-6">
                <h1 className="text-3xl font-semibold">Generate EDI</h1>
                <p className="mt-1 text-sm text-slate-400">
                    Add cargo items and generate EDI output for integration
                </p>
            </div>

            <div className="grid grid-cols-5 gap-20 h-full">
                {/* LEFT PANEL */}
                <div className="space-y-2 grid col-span-3 h-fit">
                    {/* Summary Table */}
                    {!selectedItem &&
                        <>
                            <div>
                                <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
                                    Cargo Summary
                                </h2>
                                <SummaryTable
                                    data={cargoItems}
                                    editingMode={true}
                                    onRowClick={handleSelectRow}
                                    onDelete={handleDeleteItem}
                                    onEdit={handleSelectRow}
                                    onReset={handleReset}
                                    onLoadJson={handleLoadJson}
                                    decodingMode={false}
                                />
                            </div>

                            {/* Add Cargo Button */}
                            <Button
                                onClick={handleAddCargo}
                                variant="secondary"
                                className="w-full gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Cargo Item
                            </Button>
                        </>
                    }

                    {/* Editable Cargo Form */}
                    {selectedItem && (
                        <CargoForm
                            creatingMode={isCreatingMode}
                            item={selectedItem}
                            onSave={handleSaveItem}
                            onCancel={handleCancel}
                        />
                    )}

                    {/* Generate EDI Button */}
                    {!selectedItem &&
                        <>
                            <Button
                                onClick={handleGenerateEdi}
                                variant="primary"
                                disabled={!isFormValid || isGenerating}
                            >
                                {isGenerating ? 'Generating...' : 'Generate EDI'}
                            </Button>
                            {generateError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    {generateError}
                                </div>
                            )}
                            {generateWarnings.length > 0 && (
                                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
                                    {generateWarnings.map((warning, idx) => (
                                        <div key={idx}>{warning}</div>
                                    ))}
                                </div>
                            )}
                        </>
                    }
                </div>

                {/* RIGHT PANEL */}
                <div className="col-span-2 max-h-[55%]">
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-400">
                        Output
                    </h2>
                    <OutputPanel
                        content={ediOutput}
                        fileName="cargo-edi.txt"
                        isLoading={isGenerating}
                    />
                </div>
            </div>
        </div>
    );
}
