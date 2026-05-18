# ClearAI EDI Dashboard - Code Reference & Examples

Quick reference guide with copy-paste ready code examples.

## Installation Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open browser
# Navigate to http://localhost:5173
```

## File Generation Checklist

All required files have been generated:

- ✅ Config files: `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`
- ✅ Entry point: `src/main.tsx`, `src/App.tsx`, `index.html`
- ✅ Styles: `src/styles/globals.css`
- ✅ UI Components: `src/components/ui/*.tsx` (9 files)
- ✅ Feature Components: `src/components/*.tsx` (5 files)
- ✅ Pages: `src/pages/*.tsx` (4 files)
- ✅ Utilities: `src/lib/*.ts` (3 files)
- ✅ Documentation: `README.md`, `SETUP.md`, `ARCHITECTURE.md`, `CODE_EXAMPLES.md`

## Common Workflows

### Adding a New Cargo Item

```typescript
// In GenerateEdiPage.tsx
const handleAddCargo = () => {
  const newItem = createEmptyCargoItem();
  setCargoItems([...cargoItems, newItem]);
  setSelectedId(newItem.id);
};
```

### Editing an Existing Cargo Item

```typescript
// CargoForm.tsx handles this via React Hook Form
// Form automatically loads data when item prop changes
// handleSaveItem updates parent state

const handleSaveItem = useCallback((updatedItem: CargoItem) => {
  setCargoItems((prev) =>
    prev.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    )
  );
}, []);
```

### Generating EDI Output

```typescript
const handleGenerateEdi = async () => {
  setIsGenerating(true);
  await new Promise((resolve) => setTimeout(resolve, 500));
  const output = generateEdiString(cargoItems);
  setEdiOutput(output);
  setIsGenerating(false);
};
```

### Decoding EDI Input

```typescript
const handleDecodeEdi = async () => {
  setIsDecoding(true);
  await new Promise((resolve) => setTimeout(resolve, 500));
  const decoded = decodeEdiMock(rawEdiText);
  setDecodedItems(decoded);
  setIsDecoding(false);
};
```

### Exporting to File

```typescript
// In OutputPanel.tsx
const handleExport = () => {
  const element = document.createElement('a');
  const file = new Blob([content], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = fileName;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
```

### Copying to Clipboard

```typescript
const handleCopy = async () => {
  await navigator.clipboard.writeText(content);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

## Component Usage Examples

### Using SummaryTable with Editing

```typescript
<SummaryTable
  data={cargoItems}
  editingMode={true}
  onRowClick={handleSelectRow}
  onDelete={handleDeleteItem}
  onEdit={handleSelectRow}
/>
```

### Using SummaryTable Read-Only

```typescript
<SummaryTable
  data={decodedItems}
  editingMode={false}
/>
```

### Using CargoForm

```typescript
{selectedItem && (
  <CargoForm
    item={selectedItem}
    onSave={handleSaveItem}
  />
)}
```

### Using OutputPanel

```typescript
<OutputPanel
  content={ediOutput}
  fileName="cargo-edi.txt"
  isLoading={isGenerating}
/>
```

### Using FileUpload

```typescript
<FileUpload
  onFileSelect={(content, fileName) => {
    setRawEdiText(content);
  }}
  accept=".txt"
>
  <Button variant="secondary" className="w-full gap-2">
    <Upload className="h-4 w-4" />
    Choose File
  </Button>
</FileUpload>
```

## Button Variants

```typescript
// Primary (blue)
<Button variant="primary">Save</Button>

// Secondary (dark gray)
<Button variant="secondary">Cancel</Button>

// Ghost (transparent)
<Button variant="ghost">More Options</Button>

// Outline (bordered)
<Button variant="outline">Details</Button>

// Disabled state (all variants)
<Button disabled>Disabled</Button>
```

## Form Validation Examples

### Required Field
```typescript
<div>
  <Label htmlFor="cargoType">
    Cargo Type <span className="text-red-400">*</span>
  </Label>
  <Select id="cargoType" {...register('cargoType')} />
  {errors.cargoType && (
    <p className="mt-1 text-xs text-red-400">
      {String(errors.cargoType.message)}
    </p>
  )}
</div>
```

### Numeric Input with Min Value
```typescript
<div>
  <Label htmlFor="numberOfPackages">
    Number of Packages <span className="text-red-400">*</span>
  </Label>
  <Input
    id="numberOfPackages"
    type="number"
    min="1"
    {...register('numberOfPackages', { valueAsNumber: true })}
    className={errors.numberOfPackages ? 'ring-2 ring-red-500/50' : ''}
  />
  {errors.numberOfPackages && (
    <p className="mt-1 text-xs text-red-400">
      {String(errors.numberOfPackages.message)}
    </p>
  )}
</div>
```

### Optional Field
```typescript
<div>
  <Label htmlFor="containerNumber">Container Number</Label>
  <Input id="containerNumber" type="text" {...register('containerNumber')} />
</div>
```

## Layout Patterns

### Two-Column Responsive Layout

```typescript
<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
  {/* Left column */}
  <div className="space-y-6">
    {/* Content here */}
  </div>

  {/* Right column */}
  <div>
    {/* Content here */}
  </div>
</div>
```

### Section with Heading

```typescript
<div className="space-y-6">
  <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
    Section Title
  </h2>
  <div>
    {/* Content here */}
  </div>
</div>
```

### Card with Header and Content

```typescript
<Card>
  <CardHeader>
    <CardTitle>Title Here</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Buttons or actions */}
  </CardFooter>
</Card>
```

## Type Definitions Quick Reference

### CargoItem Type
```typescript
interface CargoItem {
  id: string;                  // UUID
  cargoType: CargoType;        // 'FCX' | 'LCL' | 'FCL'
  numberOfPackages: number;    // Positive integer
  containerNumber?: string;    // Optional
  masterBlNumber?: string;     // Optional
  houseBlNumber?: string;      // Optional
}

type CargoType = 'FCX' | 'LCL' | 'FCL';
```

### Form Schema
```typescript
const cargoFormSchema = z.object({
  cargoType: z.enum(['FCX', 'LCL', 'FCL']),
  numberOfPackages: z.number().int().positive(),
  containerNumber: z.string().max(64).optional(),
  masterBlNumber: z.string().max(128).optional(),
  houseBlNumber: z.string().max(128).optional(),
});
```

## Utility Functions Reference

### `cn()` - Merge Classes
```typescript
import { cn } from '@/lib/utils';

const className = cn(
  'base-class',
  isActive && 'active-class',
  customClass
);
```

### `createEmptyCargoItem()` - Create New Item
```typescript
import { createEmptyCargoItem } from '@/lib/edi';

const newItem = createEmptyCargoItem();
// Returns: CargoItem with defaults
```

### `generateEdiString()` - Generate EDI Output
```typescript
import { generateEdiString } from '@/lib/edi';

const ediOutput = generateEdiString(cargoItems);
// Returns: Formatted EDI string
```

### `decodeEdiMock()` - Parse EDI Input
```typescript
import { decodeEdiMock } from '@/lib/edi';

const items = decodeEdiMock(rawEdiText);
// Returns: Array of DecodedEdiItem
```

## Route Navigation

### Navigate to Login
```typescript
navigate('/login');
```

### Navigate to Dashboard
```typescript
navigate('/home/generate-edi');
```

### Navigate to Decode Page
```typescript
navigate('/home/decode-edi');
```

### Navigate with State
```typescript
navigate('/home/generate-edi', { state: { cargoId: '123' } });
```

## Styling Quick Reference

### Text Colors
```typescript
className="text-slate-100"   // Primary text (white)
className="text-slate-400"   // Secondary text (gray)
className="text-slate-500"   // Muted text (lighter gray)
className="text-sky-400"     // Accent (blue)
className="text-red-400"     // Error (red)
```

### Background Colors
```typescript
className="bg-slate-950"     // Dark background
className="bg-slate-900"     // Surface
className="bg-sky-500/10"    // Blue tint (with opacity)
```

### Spacing
```typescript
className="p-6"              // Padding
className="gap-2"            // Gap between items
className="mb-3"             // Margin bottom
className="space-y-6"        // Vertical stack spacing
className="space-x-2"        // Horizontal stack spacing
```

### Borders & Shadows
```typescript
className="border border-slate-800"     // Border
className="rounded-xl"                  // 12px rounded
className="rounded-3xl"                 // 24px rounded
className="shadow-soft"                 // Custom shadow
```

### Responsive
```typescript
className="grid-cols-1 lg:grid-cols-2"  // 1 col mobile, 2 col desktop
className="hidden lg:block"             // Hide on mobile
className="text-sm lg:text-base"        // Responsive font size
```

## Common Patterns

### Empty State
```typescript
{!items.length && (
  <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center">
    <p className="text-sm text-slate-500">No items yet. Add one to get started.</p>
  </div>
)}
```

### Loading State
```typescript
<Button disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

### Error Display
```typescript
{error && (
  <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
    {error}
  </div>
)}
```

### Success Feedback
```typescript
{copied && (
  <span className="text-xs text-green-400">✓ Copied to clipboard</span>
)}
```

### Conditional Rendering
```typescript
{isLoggedIn && <Dashboard />}
{!isLoggedIn && <LoginPage />}

// Or with ternary
{condition ? <ComponentA /> : <ComponentB />}
```

## Event Handlers

### Form Submit
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // Handle submission
};
```

### Stop Propagation
```typescript
const handleClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  // Only this handler runs
};
```

### Input Change
```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

### Select Change
```typescript
const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  setSelectedOption(e.target.value);
};
```

## localStorage Helpers

### Save Auth State
```typescript
localStorage.setItem('auth', JSON.stringify({
  email: 'user@example.com',
  loggedIn: true
}));
```

### Retrieve Auth State
```typescript
const auth = JSON.parse(localStorage.getItem('auth') || '{}');
if (auth.loggedIn) {
  // User is authenticated
}
```

### Clear Auth State
```typescript
localStorage.removeItem('auth');
```

## Performance Tips

### Memoize Component
```typescript
export default memo(function MyComponent({ data }) {
  return <div>{data}</div>;
});
```

### Optimize Callback
```typescript
const handleClick = useCallback(() => {
  // Handler logic
}, [dependency]);
```

### Conditional Field Rendering
```typescript
{formData.type === 'express' && (
  <Input placeholder="Tracking number" />
)}
```

## Accessibility Best Practices

### Form Labels
```typescript
<label htmlFor="fieldId">Label Text</label>
<input id="fieldId" ... />
```

### Button Types
```typescript
<button type="submit">Submit</button>  // Form submission
<button type="button">Cancel</button>  // Regular button
<button type="reset">Clear</button>    // Form reset
```

### ARIA Labels (when needed)
```typescript
<button aria-label="Close dialog">×</button>
```

### Focus Visible
```typescript
className="focus:outline-none focus:ring-2 focus:ring-sky-500"
```

## Deployment Commands

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Then deploy dist/ folder to hosting
# (Netlify, Vercel, AWS S3, etc.)
```

---

**Need more examples?** Check the component code - every file has JSDoc comments explaining key sections!
