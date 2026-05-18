# 🎯 Component Usage Guide - Visual Reference

## Quick Component Usage Map

```
UI PRIMITIVES (Copy & Paste Ready)
├─ <Button variant="primary|secondary|outline|ghost" />
├─ <Card>
│  ├─ <CardHeader>
│  ├─ <CardContent>
│  └─ <CardFooter>
├─ <Input />
├─ <Select>
│  └─ <option>...</option>
├─ <Textarea />
├─ <Label htmlFor="..." />
├─ <Table>
│  ├─ <TableHeader><TableRow><TableHead>...</TableHead></TableRow></TableHeader>
│  └─ <TableBody><TableRow><TableCell>...</TableCell></TableRow></TableBody>
├─ <ScrollArea>
└─ <Separator />

FEATURE COMPONENTS
├─ <Sidebar />
├─ <DashboardLayout>
├─ <CargoForm item={item} onSave={handler} />
├─ <SummaryTable data={[]} editingMode={true|false} />
├─ <OutputPanel content={text} fileName="..." />
└─ <FileUpload onFileSelect={handler}>

PAGES
├─ LoginPage
├─ SignupPage
├─ GenerateEdiPage
└─ DecodeEdiPage
```

---

## 🎨 Button Component

```typescript
// PRIMARY (Blue, Main Actions)
<Button variant="primary" onClick={handler}>
  Save
</Button>

// SECONDARY (Gray, Alternative)
<Button variant="secondary">
  Cancel
</Button>

// GHOST (Transparent, Subtle)
<Button variant="ghost">
  More Options
</Button>

// OUTLINE (Bordered)
<Button variant="outline">
  Learn More
</Button>

// DISABLED STATE (All Variants)
<Button disabled>
  Disabled
</Button>

// WITH ICON
<Button variant="primary" className="gap-2">
  <Icon className="h-4 w-4" />
  Click Me
</Button>

// FULL WIDTH
<Button className="w-full">
  Full Width Button
</Button>
```

---

## 📋 Card Component

```typescript
// BASIC CARD
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// CARD WITHOUT FOOTER
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content only */}
  </CardContent>
</Card>

// CARD WITHOUT HEADER
<Card>
  <CardContent>
    {/* Direct content */}
  </CardContent>
</Card>
```

---

## 📝 Input Component

```typescript
// TEXT INPUT
<Input
  type="text"
  placeholder="Enter text..."
  value={text}
  onChange={(e) => setText(e.target.value)}
/>

// NUMBER INPUT
<Input
  type="number"
  min="1"
  value={num}
  onChange={(e) => setNum(e.target.value)}
/>

// WITH LABEL
<div>
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>

// DISABLED
<Input disabled placeholder="Disabled" />

// WITH ERROR STYLING
<Input
  className={errors.field ? 'ring-2 ring-red-500/50' : ''}
/>
```

---

## 🔽 Select Component

```typescript
// BASIC SELECT
<Select value={selected} onChange={(e) => setSelected(e.target.value)}>
  <option value="">-- Choose --</option>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</Select>

// WITH LABEL
<div>
  <Label htmlFor="type">Cargo Type</Label>
  <Select id="type">
    <option value="FCX">FCX</option>
    <option value="LCL">LCL</option>
    <option value="FCL">FCL</option>
  </Select>
</div>

// WITH ERROR
<Select className={errors.type ? 'ring-2 ring-red-500/50' : ''}>
  {/* options */}
</Select>
```

---

## 📄 Textarea Component

```typescript
// BASIC TEXTAREA
<Textarea
  placeholder="Enter EDI text..."
  value={text}
  onChange={(e) => setText(e.target.value)}
/>

// READ-ONLY
<Textarea
  readOnly
  value={ediOutput}
  className="min-h-[300px]"
/>

// WITH LABEL
<div>
  <Label htmlFor="content">Content</Label>
  <Textarea id="content" />
</div>

// CUSTOM HEIGHT
<Textarea className="min-h-[500px]" />
```

---

## 📊 Table Component

```typescript
// BASIC TABLE
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column 1</TableHead>
      <TableHead>Column 2</TableHead>
      <TableHead>Column 3</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.field1}</TableCell>
        <TableCell>{item.field2}</TableCell>
        <TableCell>{item.field3}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

// WITH ACTIONS
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>
          <Button variant="ghost">Edit</Button>
          <Button variant="ghost">Delete</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

// WITH CLICKABLE ROWS
<TableRow
  onClick={() => onSelect(item)}
  className="cursor-pointer"
>
  <TableCell>{item.name}</TableCell>
</TableRow>
```

---

## 🎯 Form Component with Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// DEFINE SCHEMA
const mySchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// USE IN COMPONENT
export function MyForm() {
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(mySchema),
    mode: 'onChange',
  });

  const onSubmit = (data) => {
    console.log(data); // Pre-validated!
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          {...register('email')}
          className={errors.email ? 'ring-2 ring-red-500/50' : ''}
        />
        {errors.email && (
          <p className="text-red-400 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register('password')}
          className={errors.password ? 'ring-2 ring-red-500/50' : ''}
        />
        {errors.password && (
          <p className="text-red-400 text-sm">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isValid}
      >
        Submit
      </Button>
    </form>
  );
}
```

---

## 🔄 SummaryTable Component

```typescript
// FOR EDITING (Edit/Delete Buttons Visible)
<SummaryTable
  data={items}
  editingMode={true}
  onRowClick={(item) => selectItem(item)}
  onEdit={(item) => editItem(item)}
  onDelete={(id) => deleteItem(id)}
/>

// FOR VIEWING (Edit/Delete Buttons Hidden)
<SummaryTable
  data={decodedItems}
  editingMode={false}
/>

// WITH NO CALLBACKS
<SummaryTable
  data={items}
  editingMode={false}
/>
```

---

## 📤 OutputPanel Component

```typescript
<OutputPanel
  content={ediText}
  fileName="output.txt"
  isLoading={false}
/>
```

**Features Included:**
- Copy button (copies to clipboard)
- Export button (downloads file)
- Read-only textarea
- Scrollable area
- Loading state

---

## 📁 FileUpload Component

```typescript
<FileUpload
  onFileSelect={(content, fileName) => {
    console.log('Imported:', fileName);
    setContent(content);
  }}
  accept=".txt"
>
  <Button variant="secondary">
    <UploadIcon className="h-4 w-4" />
    Upload File
  </Button>
</FileUpload>
```

---

## 🎨 Layout Pattern - Two Columns

```typescript
<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
  {/* LEFT COLUMN (Mobile: Full, Desktop: 50%) */}
  <div className="space-y-6">
    <h2 className="text-sm font-semibold uppercase text-slate-400">
      Left Section
    </h2>
    {/* Content here */}
  </div>

  {/* RIGHT COLUMN (Mobile: Full, Desktop: 50%) */}
  <div>
    <h2 className="text-sm font-semibold uppercase text-slate-400">
      Right Section
    </h2>
    {/* Content here */}
  </div>
</div>
```

---

## ✅ Form Validation Pattern

```typescript
// 1. DEFINE SCHEMA
const schema = z.object({
  field: z.string().min(1, 'Required'),
  number: z.number().positive('Must be positive'),
});

// 2. SETUP FORM
const { register, formState: { errors, isValid } } = useForm({
  resolver: zodResolver(schema),
  mode: 'onChange',
});

// 3. RENDER WITH ERROR STATE
<Input
  {...register('field')}
  className={errors.field ? 'ring-2 ring-red-500/50' : ''}
/>
{errors.field && <p className="text-red-400">{errors.field.message}</p>}

// 4. SUBMIT BUTTON
<Button disabled={!isValid}>
  {isValid ? 'Submit' : 'Fix errors'}
</Button>
```

---

## 🔐 State Management Pattern

```typescript
// LOCAL STATE
const [items, setItems] = useState([]);

// UPDATE STATE
const handleAdd = () => {
  setItems([...items, newItem]);
};

const handleDelete = (id) => {
  setItems(items.filter(item => item.id !== id));
};

const handleUpdate = (updatedItem) => {
  setItems(items.map(item =>
    item.id === updatedItem.id ? updatedItem : item
  ));
};

// PASS TO CHILDREN
<SummaryTable
  data={items}
  onDelete={handleDelete}
  onEdit={handleUpdate}
/>
```

---

## 📱 Responsive Classes

```typescript
// TEXT SIZE
className="text-sm lg:text-base"

// DISPLAY
className="hidden lg:block"

// COLUMNS
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// PADDING
className="p-4 lg:p-8"

// MARGINS
className="mb-4 lg:mb-8"
```

---

## 🎯 Loading State Pattern

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleGenerate = async () => {
  setIsLoading(true);
  try {
    const result = await generateEdi();
    setOutput(result);
  } finally {
    setIsLoading(false);
  }
};

// BUTTON
<Button disabled={isLoading}>
  {isLoading ? 'Generating...' : 'Generate'}
</Button>

// OUTPUT
<OutputPanel
  content={output}
  isLoading={isLoading}
/>
```

---

## 🚨 Error State Pattern

```typescript
const [error, setError] = useState('');

const handleSubmit = async () => {
  setError('');
  try {
    await api.call();
  } catch (err) {
    setError(err.message || 'Operation failed');
  }
};

// ERROR DISPLAY
{error && (
  <div className="bg-red-500/10 p-3 rounded text-red-400">
    {error}
  </div>
)}
```

---

## ✨ Empty State Pattern

```typescript
{!items.length ? (
  <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center">
    <p className="text-sm text-slate-500">
      No items yet. Add one to get started.
    </p>
  </div>
) : (
  <SummaryTable data={items} />
)}
```

---

## 🎓 Complete Page Example

```typescript
export default function MyPage() {
  // STATE
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // HANDLERS
  const handleAdd = () => {
    setItems([...items, { id: uuid(), name: '' }]);
  };

  const handleSave = (item) => {
    setItems(items.map(i => i.id === item.id ? item : i));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError('');
    try {
      const output = await generate(items);
      setOutput(output);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // RENDER
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Title</h1>
        <p className="text-slate-400">Description</p>
      </div>

      {error && (
        <div className="bg-red-500/10 p-3 rounded text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* LEFT PANEL */}
        <div className="space-y-6">
          <SummaryTable
            data={items}
            editingMode={true}
            onRowClick={setSelected}
          />
          <Button onClick={handleAdd}>Add Item</Button>
          {selected && <MyForm item={selected} onSave={handleSave} />}
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Generate'}
          </Button>
        </div>

        {/* RIGHT PANEL */}
        <div>
          <OutputPanel content={output} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
```

---

**All components are ready to use!** Copy & paste these patterns into your code.
