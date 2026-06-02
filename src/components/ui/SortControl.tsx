import { ArrowUpDown } from 'lucide-react';
import type { SortField, SortOrder } from '../../types';

interface SortControlProps {
  field: SortField;
  order: SortOrder;
  onChange: (field: SortField, order: SortOrder) => void;
}

const OPTIONS: { value: `${SortField}:${SortOrder}`; label: string }[] = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'name:asc', label: 'Name (A-Z)' },
  { value: 'name:desc', label: 'Name (Z-A)' },
  { value: 'tags:asc', label: 'Tag (A-Z)' },
];

export function SortControl({ field, order, onChange }: SortControlProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-600">
      <ArrowUpDown size={16} />
      <select
        className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm"
        value={`${field}:${order}`}
        onChange={(e) => {
          const [f, o] = e.target.value.split(':') as [SortField, SortOrder];
          onChange(f, o);
        }}
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
