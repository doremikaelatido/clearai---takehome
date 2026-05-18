import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import type { CargoItem } from '@/lib/types';
import contract from '../../shared/edi-contract.json';
import { LoadJsonButton } from './LoadJsonButton';

interface SummaryTableProps {
  data: CargoItem[];
  editingMode: boolean;
  decodingMode: boolean;
  onEdit?: (item: CargoItem) => void;
  onDelete?: (id: string) => void;
  onRowClick?: (item: CargoItem) => void;
  onReset?: () => void;
  onLoadJson?: (items: CargoItem[], errorMessage?: string) => void;
  pageSize?: number; // optional - defaults to 10
}

/**
 * Reusable SummaryTable component for displaying cargo items.
 *
 * When editingMode is true, shows an Actions column with Edit and Delete buttons.
 * When editingMode is false, the Actions column is hidden for read-only display.
 *
 * Used by both Generate EDI and Decode EDI pages.
 */
export default function SummaryTable({
  data,
  editingMode,
  decodingMode,
  onEdit,
  onDelete,
  onRowClick,
  onReset,
  onLoadJson,
  pageSize = 10,
}: SummaryTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const normalizedPageSize = Math.max(1, Math.min(15, pageSize));

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((item) => {
      const values = [
        String(item.cargoType ?? ''),
        String(item.numberOfPackages ?? ''),
        String(item.containerNumber ?? ''),
        String(item.masterBlNumber ?? ''),
        String(item.houseBlNumber ?? ''),
      ];
      return values.join(' ').toLowerCase().includes(q);
    });
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / normalizedPageSize));

  // reset page when filters change
  if (page > totalPages) setPage(1);

  const start = (page - 1) * normalizedPageSize;
  const pageItems = filtered.slice(start, start + normalizedPageSize);

  if (!data.length) {
    return (
      <div className="rounded-3xl border border-slate-200 p-8 flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-slate-600">No cargo items yet. Add one to get started.</p>
        {!decodingMode && <LoadJsonButton onLoadJson={onLoadJson || (() => {})} disabled={!onLoadJson}/>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-3">
        <input
          aria-label="Search cargo items"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border rounded-md w-full max-w-sm text-sm"
        />
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="h-fit w-fit px-3 py-2 text-sm"
            onClick={onReset}
            disabled={!onReset}
          >
            Reset
          </Button>
          <LoadJsonButton onLoadJson={onLoadJson || (() => {})} disabled={!onLoadJson} />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {contract.tableColumns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
            {editingMode && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>

        <TableBody>
          {pageItems.map((item) => (
            <TableRow
              key={item.id}
              className={onRowClick ? 'cursor-pointer transition hover:bg-sky-50' : ''}
            >
              {contract.tableColumns.map((column) => (
                <TableCell key={column.key} className="text-slate-600">
                  {String(item[column.key as keyof CargoItem] ?? '—')}
                </TableCell>
              ))}

              {editingMode && (
                <TableCell>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      className="h-fit w-fit px-2 py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(item);
                      }}
                    >
                      <Edit2 color="blue" className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-fit w-fit px-2 py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(item.id);
                      }}
                    >
                      <Trash2 color="red" className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between mt-2">
        <div className="text-sm text-slate-500">
          Showing {start + 1}-{Math.min(start + normalizedPageSize, filtered.length)} of {filtered.length}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="h-fit w-fit px-2 py-1"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>

          <div className="text-sm">Page {page} / {totalPages}</div>

          <Button
            variant="ghost"
            className="h-fit w-fit px-2 py-1"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
