# ClearAI EDI Dashboard - Setup Guide

## Project Overview

A modern, enterprise-grade EDI (Electronic Data Interchange) web application UI built with:
- **React 18** with functional components and hooks
- **Vite** for fast development and optimized builds
- **TailwindCSS** for styling
- **React Router** for client-side routing
- **React Hook Form + Zod** for form validation
- **Lucide React** for icons
- **TypeScript** for type safety

## Quick Start

### 1. Install Dependencies

Navigate to the project root and run:

```bash
cd "/Users/mikaelanicoleramos/Documents/GitHub/clearai - takehome"
npm install
```

This installs all required packages defined in `package.json`.

### 2. Start Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

### 4. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
clearai-edi-ui/
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── label.tsx
│   │   │   ├── table.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   └── separator.tsx
│   │   ├── CargoForm.tsx          # Cargo item form with validation
│   │   ├── DashboardLayout.tsx    # Main dashboard wrapper
│   │   ├── FileUpload.tsx         # File upload component
│   │   ├── OutputPanel.tsx        # EDI output display
│   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   └── SummaryTable.tsx       # Reusable table component
│   ├── pages/
│   │   ├── LoginPage.tsx          # Authentication
│   │   ├── SignupPage.tsx         # User registration
│   │   ├── GenerateEdiPage.tsx    # Generate EDI workflow
│   │   └── DecodeEdiPage.tsx      # Decode EDI workflow
│   ├── lib/
│   │   ├── edi.ts                 # EDI generation/decoding logic
│   │   ├── types.ts               # Shared TypeScript types
│   │   └── utils.ts               # Utility functions
│   ├── styles/
│   │   └── globals.css            # Global Tailwind styles
│   ├── App.tsx                    # Main router component
│   └── main.tsx                   # React entry point
├── index.html                     # HTML template
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript config
├── tailwind.config.js             # Tailwind configuration
├── postcss.config.js              # PostCSS configuration
├── vite.config.ts                 # Vite configuration
└── README.md                      # This file
```

## Routing

The app uses React Router with the following routes:

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Redirect to `/login` | Default redirect |
| `/login` | LoginPage | User login |
| `/signup` | SignupPage | User registration |
| `/home` | DashboardLayout | Dashboard wrapper (protected) |
| `/home/generate-edi` | GenerateEdiPage | Generate EDI output (default after login) |
| `/home/decode-edi` | DecodeEdiPage | Decode EDI input |
| `*` | Redirect to `/login` | 404 fallback |

## Key Features

### Authentication
- Mock login/signup system using localStorage
- No backend required for demo
- Simple credential validation

### Generate EDI Page
- **Left Panel:**
  - Reusable SummaryTable showing all cargo items
  - Single-item cargo form with validation
  - "Add Cargo Item" button to create new items
  - "Generate EDI" button

- **Right Panel:**
  - EDI output display area
  - Copy button (copies to clipboard)
  - Export to File button (downloads as .txt)

### Decode EDI Page
- **Left Panel:**
  - File upload input for importing .txt files
  - Large textarea for pasting EDI text
  - "Decode EDI" button

- **Right Panel:**
  - Read-only SummaryTable of decoded items
  - No edit/delete buttons in this mode

### Cargo Form Validation
Uses **React Hook Form + Zod** for robust validation:

**Required Fields:**
- `cargoType` - Dropdown (FCX, LCL, FCL)
- `numberOfPackages` - Positive integer only

**Optional Fields:**
- `containerNumber` - Text input
- `masterBlNumber` - Text input
- `houseBlNumber` - Text input

**Validation Rules:**
- Required fields must be filled
- Number of packages must be > 0
- Form displays inline error messages
- Invalid fields highlighted with red border
- "Generate EDI" button disabled when form is invalid

### SummaryTable Component (Reusable)

**Props:**
```typescript
interface SummaryTableProps {
  data: CargoItem[];
  editingMode: boolean;
  onEdit?: (item: CargoItem) => void;
  onDelete?: (id: string) => void;
  onRowClick?: (item: CargoItem) => void;
}
```

**Behavior:**
- When `editingMode === true`: Shows Actions column with Edit/Delete buttons
- When `editingMode === false`: Actions column is hidden (read-only mode)
- Used by both Generate EDI and Decode EDI pages
- Responsive table with clean styling

### Mock EDI Logic

**Generation (`generateEdiString`):**
- Converts cargo items to EDI format strings
- Includes proper EDI segment markers (UNA, UNB, CARG, BLM, UNT)
- Returns formatted EDI text for output

**Decoding (`decodeEdiMock`):**
- Parses raw EDI text
- Extracts cargo items and details
- Returns array of DecodedEdiItem objects
- Handles malformed input gracefully

## Design System

### Colors
- **Background:** `slate-950` (very dark)
- **Surface:** `slate-900` (dark)
- **Text:** `slate-100` (light)
- **Accent:** `sky-500` (blue, primary actions)
- **Error:** `red-400` (validation errors)

### Components
- All UI components use `rounded-xl` or `rounded-3xl` for soft, modern appearance
- Subtle shadows with `shadow-soft` custom class
- Smooth transitions and hover states
- Focus rings for accessibility (blue)
- Disabled state styling

### Spacing
- Uses Tailwind's default 4px scale
- Generous padding on cards: `p-6`
- Clear visual hierarchy

### Typography
- Clear size distinctions
- Proper font weights (normal, medium, semibold)
- Mono font for code/EDI display
- Readable line heights

## Form Validation Example

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cargoFormSchema } from '@/lib/edi';

const { register, handleSubmit, formState: { errors, isValid } } = useForm({
  resolver: zodResolver(cargoFormSchema),
  mode: 'onChange'
});

// Fields are automatically validated based on schema
// Errors display inline
// Submit button disabled if form is invalid
```

## State Management

The app uses **only React hooks** (no Redux):

- **`useState`** - For local component state (cargo items, form inputs, UI state)
- **`useEffect`** - For side effects (though minimal in this UI)
- **`useCallback`** - For optimized callbacks in components
- **React Hook Form** - For complex form state and validation
- **localStorage** - For mock authentication persistence

## File Upload Example

```typescript
<FileUpload
  onFileSelect={(content: string, fileName: string) => {
    // Handle file content
    setRawEdiText(content);
  }}
  accept=".txt"
>
  <Button>Choose File</Button>
</FileUpload>
```

## Output Export Example

The OutputPanel component handles:
- **Copy to Clipboard:** Uses native `navigator.clipboard.writeText()`
- **Export to File:** Creates blob and triggers download via `<a>` tag
- **Toast Feedback:** Temporary "Copied" confirmation

## Development Tips

### Hot Module Replacement
Vite provides instant HMR - changes to components are reflected immediately in browser.

### TypeScript Strict Mode
All TypeScript compilation is in strict mode for better type safety:
```json
"strict": true
```

### Adding New Components
1. Create component in appropriate folder (`components/`, `pages/`, or `components/ui/`)
2. Export as default or named export
3. Use existing UI primitives from `components/ui/`
4. Follow naming and styling conventions

### Adding New Routes
Update `src/App.tsx` to add new routes:
```typescript
<Route path="/new-page" element={<NewPage />} />
```

### Customizing Tailwind
Edit `tailwind.config.js` to extend colors, spacing, shadows, etc.

## Browser Support

Works on all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance Notes

- Vite provides instant HMR and optimized bundling
- TailwindCSS is purged to only include used styles
- Component lazy loading can be added if needed
- Large EDI files render efficiently due to textarea virtualization

## Future Enhancements

1. **Real Backend Integration:**
   - Replace mock auth with JWT tokens
   - Connect form submission to API
   - Save/load cargo items from database

2. **Advanced Features:**
   - Undo/redo for cargo items
   - Template management
   - Batch EDI generation
   - EDI validation against standards

3. **UI Improvements:**
   - Dark/light mode toggle
   - Customizable themes
   - Advanced data table features (sorting, filtering)
   - Modal dialogs for confirmations

4. **Performance:**
   - Code splitting by route
   - Lazy load heavy dependencies
   - Service worker for offline support

## Troubleshooting

### Port Already in Use
If port 5173 is in use:
```bash
npm run dev -- --port 3000
```

### Module Not Found Errors
Ensure all dependencies are installed:
```bash
npm install
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
The codebase uses strict type checking. Some errors may appear as warnings:
```bash
npm run build  # Runs TypeScript check before build
```

### Styling Issues
Tailwind styles not loading? Verify:
- `tailwind.config.js` includes correct `content` paths
- `src/styles/globals.css` is imported in `main.tsx`
- Dev server is running

## License & Attribution

Built as a demonstration of modern React development patterns and enterprise UI design.

---

**Questions or suggestions?** Review the component code - extensive JSDoc comments explain key sections.
