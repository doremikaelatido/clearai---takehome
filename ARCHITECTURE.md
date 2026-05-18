# ClearAI EDI Dashboard - Architecture & Best Practices

## Component Architecture

### UI Primitives Layer (`/components/ui/`)

Low-level, reusable building blocks. These wrap HTML elements with consistent styling.

**Principles:**
- No business logic
- Accept standard HTML props + optional className override
- Always export as named export
- Use `cn()` utility for class merging

**Example:**
```typescript
export function Button({ className, variant = 'primary', ...props }) {
  return (
    <button
      className={cn(
        'base-styles',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
```

### Feature Components Layer (`/components/`)

Mid-level components combining UI primitives with business logic.

**Components:**
- `Sidebar` - Navigation and user context
- `DashboardLayout` - Main page wrapper
- `CargoForm` - Form with validation logic
- `SummaryTable` - Data display (reusable by multiple pages)
- `OutputPanel` - EDI output management
- `FileUpload` - File input handler

**Principles:**
- Single responsibility
- Accept data via props
- Lift state to parent when needed for shared state
- Use React Hook Form for complex forms

### Page Components Layer (`/pages/`)

Top-level route components that orchestrate features and manage page-level state.

**Pages:**
- `LoginPage` - Authentication flow
- `SignupPage` - Registration flow
- `GenerateEdiPage` - Generate workflow (orchestrates CargoForm, SummaryTable, OutputPanel)
- `DecodeEdiPage` - Decode workflow

**Principles:**
- Manage all page-level state (cargo items, form inputs, async loading)
- Pass data down and callbacks up
- Handle routing on state changes

## State Management Pattern

### Local State (useState)

Use for UI state that doesn't need to be shared:
```typescript
const [selectedId, setSelectedId] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);
```

### Shared State (lift to parent)

When multiple components need same state, lift to common parent:
```typescript
// GenerateEdiPage.tsx
const [cargoItems, setCargoItems] = useState<CargoItem[]>([]);

// Pass down
<SummaryTable data={cargoItems} ... />
<CargoForm item={selectedItem} onSave={handleSaveItem} ... />
```

### Form State (React Hook Form)

Use for complex form validation:
```typescript
const { register, watch, formState: { errors, isValid } } = useForm({
  resolver: zodResolver(cargoFormSchema),
  mode: 'onChange'
});
```

### Persistent State (localStorage)

Use for data that should survive refresh:
```typescript
// Auth state
localStorage.setItem('auth', JSON.stringify({ email, loggedIn: true }));
```

## Form Validation Strategy

### Zod Schema Definition

Define all validation rules once:
```typescript
export const cargoFormSchema = z.object({
  cargoType: z.enum(['FCX', 'LCL', 'FCL']),
  numberOfPackages: z.number().int().positive(),
  containerNumber: z.string().max(64).optional(),
});
```

### React Hook Form Integration

```typescript
const { register, formState: { errors, isValid } } = useForm({
  resolver: zodResolver(cargoFormSchema),
  mode: 'onChange'  // Real-time validation
});

// In template
{errors.numberOfPackages && (
  <p className="text-red-400">{errors.numberOfPackages.message}</p>
)}
```

### Submit Handling

```typescript
const handleSubmit = (data: FieldValues) => {
  // data is pre-validated by Zod
  // Safe to use directly
};
```

## Data Flow Patterns

### Unidirectional Data Flow

1. **Parent holds state** → generates single source of truth
2. **Pass data down via props** → children receive data
3. **Pass callbacks up via props** → children trigger updates
4. **Parent updates state** → triggers re-render

### Example: Cargo List Management

```typescript
// GenerateEdiPage (parent)
const [cargoItems, setCargoItems] = useState<CargoItem[]>([]);

// Pass to table for display
<SummaryTable data={cargoItems} onRowClick={handleSelectRow} />

// User clicks row
const handleSelectRow = (item: CargoItem) => {
  setSelectedId(item.id);
};

// Form displays selected item
<CargoForm item={selectedItem} onSave={handleSaveItem} />

// Form submission
const handleSaveItem = (updatedItem: CargoItem) => {
  setCargoItems(prev => prev.map(item =>
    item.id === updatedItem.id ? updatedItem : item
  ));
};
```

## Reusable Component Design: SummaryTable

The `SummaryTable` demonstrates how to build truly reusable components:

### Props Interface
```typescript
interface SummaryTableProps {
  data: CargoItem[];           // Required: the data to display
  editingMode: boolean;         // Feature flag: show/hide edit column
  onEdit?: (item: CargoItem) => void;     // Optional callback
  onDelete?: (id: string) => void;        // Optional callback
  onRowClick?: (item: CargoItem) => void; // Optional callback
}
```

### Conditional Rendering

```typescript
{editingMode && <TableHead>Actions</TableHead>}

{editingMode && (
  <TableCell>
    <Button onClick={onEdit}>Edit</Button>
    <Button onClick={onDelete}>Delete</Button>
  </TableCell>
)}
```

### Used By Multiple Pages

- **GenerateEdiPage:** `editingMode={true}` - users can edit/delete
- **DecodeEdiPage:** `editingMode={false}` - read-only view

## Async Operation Pattern

For async operations (like EDI generation):

```typescript
const handleGenerateEdi = async () => {
  setIsGenerating(true);
  try {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    const output = generateEdiString(cargoItems);
    setEdiOutput(output);
  } catch (error) {
    setError('Generation failed');
  } finally {
    setIsGenerating(false);
  }
};

// In template
<Button disabled={!isFormValid || isGenerating}>
  {isGenerating ? 'Generating...' : 'Generate EDI'}
</Button>
```

## Styling Architecture

### Tailwind-First Approach

1. **Use utility classes** - Direct in component className
2. **Component variants** - Built into component props
3. **Custom utilities** - Defined in `tailwind.config.js`
4. **No CSS files** - Except globals.css for resets

### Color System

Define consistently:
```
Primary (Interactive):  sky-500
Surface:               slate-900
Background:            slate-950
Text Primary:          slate-100
Text Secondary:        slate-400
Text Muted:           slate-500
Error:                red-400
Success:              green-400
```

### Spacing Scale

Use 4px base unit:
- `p-4` = 16px padding
- `gap-6` = 24px gap
- `mb-8` = 32px margin-bottom

### Responsive Design

```typescript
<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
  {/* Mobile: 1 column, Tablet/Desktop: 2 columns */}
</div>
```

## Performance Best Practices

### 1. Component Memoization (when needed)

```typescript
import { memo } from 'react';

const SummaryTable = memo(function SummaryTable({ data, ...props }) {
  // Only re-renders if props actually change
});
```

### 2. useCallback for Event Handlers

```typescript
const handleSaveItem = useCallback((item: CargoItem) => {
  setCargoItems(prev => [...prev, item]);
}, []);  // stable reference
```

### 3. Event Handler Best Practices

```typescript
// Stop propagation when needed
const handleEdit = (e: React.MouseEvent) => {
  e.stopPropagation();
  // ... edit logic
};
```

## Error Handling

### Form-Level Validation

```typescript
{errors.numberOfPackages && (
  <p className="text-red-400 text-sm">
    {String(errors.numberOfPackages.message)}
  </p>
)}
```

### Async Operation Errors

```typescript
try {
  await generateEdi();
} catch (error) {
  setError('Generation failed. Please try again.');
}
```

### User Feedback

```typescript
{error && (
  <div className="bg-red-500/10 p-3 rounded text-red-400">
    {error}
  </div>
)}
```

## Accessibility Considerations

### Form Labels
```typescript
<Label htmlFor="cargoType">Cargo Type</Label>
<Select id="cargoType" {...register('cargoType')} />
```

### Focus Management
```typescript
// Tailwind handles focus ring
className="focus:ring-2 focus:ring-sky-500"
```

### Semantic HTML
```typescript
<form>
  <button type="submit">Submit</button>
  <button type="button">Cancel</button>
</form>
```

## Code Organization Tips

### Import Organization
```typescript
// 1. React + vendor libraries
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';

// 2. UI components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 3. Feature components
import SummaryTable from '@/components/SummaryTable';

// 4. Utilities & types
import { cn } from '@/lib/utils';
import type { CargoItem } from '@/lib/types';
```

### Type Organization
```typescript
// types.ts - single source of truth
export interface CargoItem {
  id: string;
  cargoType: CargoType;
  numberOfPackages: number;
}

export type CargoType = 'FCX' | 'LCL' | 'FCL';
```

### Utility Functions
```typescript
// utils.ts
export function cn(...classes) { /* merge classes */ }
export function formatCurrency(amount) { /* format */ }
export function debounce(fn, ms) { /* debounce */ }
```

## Testing Strategy (Future)

### Unit Tests (Components)
```typescript
test('CargoForm validates numberOfPackages > 0', () => {
  // Test validation logic
});
```

### Integration Tests (Pages)
```typescript
test('GenerateEdiPage creates and exports EDI', () => {
  // Test full workflow
});
```

### E2E Tests (User Flows)
```typescript
test('User can sign up, create cargo, and generate EDI', () => {
  // Test complete flow
});
```

## Deployment Considerations

### Build Optimization
```bash
npm run build
# Creates optimized dist/ folder
# All CSS is purged (unused styles removed)
# Code is minified and tree-shaken
```

### Environment Variables (Future)
```typescript
// .env
VITE_API_URL=https://api.example.com

// Usage
const API_URL = import.meta.env.VITE_API_URL;
```

### Build Analysis
```bash
# Analyze bundle size
npm run build
# Check dist/ folder size
```

## Common Patterns

### Conditional Classes
```typescript
className={cn(
  'base-styles',
  isActive && 'active-styles',
  isError && 'error-styles'
)}
```

### Optional Callbacks
```typescript
const handleClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  onEdit?.(item);  // Only call if exists
};
```

### Type-Safe Form Data
```typescript
const onSubmit = (data: FieldValues) => {
  const typedData = data as typeof cargoFormSchema._type;
  // Now type-safe
};
```

## Debugging Tips

### React DevTools
- Install "React Developer Tools" extension
- Inspect component hierarchy
- Watch state changes in real-time

### Vite DevTools
- Built-in source maps for debugging
- Fast HMR = instant feedback

### Console Logging
```typescript
console.log('Cargo items:', cargoItems);
console.log('Form validation:', { errors, isValid });
```

### Browser DevTools
- Elements: Inspect TailwindCSS classes
- Network: Monitor API calls (when connected)
- Console: Check for TypeScript/runtime errors

---

**Key Takeaway:** This architecture prioritizes:
- **Simplicity** - Easy to understand and modify
- **Reusability** - Components used across multiple pages
- **Maintainability** - Clear separation of concerns
- **Scalability** - Easy to add features without refactoring
- **Type Safety** - TypeScript catches errors before runtime
