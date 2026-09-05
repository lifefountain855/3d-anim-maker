import React, { useState } from 'react';

// Types for schema field definitions
export type FieldType = 'text' | 'number' | 'select' | 'checkbox';

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string | number | boolean;
}

// Generic shape of each item created in the array
export interface ArrayItem {
  [key: string]: string | number | boolean | undefined;
}

// Component Props
export interface VisualArrayEditorProps {
  onChange?: (items: ArrayItem[]) => void;
}

// Master schema configuration
const ITEM_SCHEMA: FieldSchema[] = [
  { key: 'title', label: 'Item Name', type: 'text', required: true, placeholder: 'e.g., Widget A' },
  { key: 'category', label: 'Category', type: 'select', required: true, options: ['Hardware', 'Software', 'Service'] },
  { key: 'price', label: 'Price ($)', type: 'number', required: false, placeholder: '0.00' },
  { key: 'active', label: 'Is Active?', type: 'checkbox', required: false, defaultValue: true }
];

/**
 * global:
    * x.y.z.
    * xr.yr.zr.
    * xs.ys.zs.
    * damping?
    * minviewportwidth?
    * phase1:
    * start:
    * end:
    * x.y.z.
    * xr.yr.zr.
    * xs.ys.zs.
    * damping?
    * minviewportwidth?
 */

export default function VisualArrayEditor({ onChange }: VisualArrayEditorProps) {
  const [items, setItems] = useState<ArrayItem[]>([]);

  // Generate a blank item populated with defaults
  const createEmptyItem = (): ArrayItem => {
    const newItem: ArrayItem = {};
    ITEM_SCHEMA.forEach((field) => {
      newItem[field.key] = field.defaultValue !== undefined ? field.defaultValue : '';
    });
    return newItem;
  };

  const handleAddItem = (): void => {
    const updated = [...items, createEmptyItem()];
    setItems(updated);
    if (onChange) onChange(updated);
  };

  const handleUpdateItem = (index: number, fieldKey: string, value: string | number | boolean): void => {
    const updated = items.map((item, i) => {
      if (i === index) {
        return { ...item, [fieldKey]: value };
      }
      return item;
    });
    setItems(updated);
    if (onChange) onChange(updated);
  };

  const handleDeleteItem = (index: number): void => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    if (onChange) onChange(updated);
  };

  return (
    <div style={{ maxWidth: '600px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((item, index) => (
          <div 
            key={index} 
            style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              padding: '16px',
              backgroundColor: '#f8fafc',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <strong>Item #{index + 1}</strong>
              <button 
                type="button" 
                onClick={() => handleDeleteItem(index)}
                style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {ITEM_SCHEMA.map((field) => (
                <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
                  </label>

                  {(field.type === 'text' || field.type === 'number') && (
                    <input
                      type={field.type}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={String(item[field.key] ?? '')}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleUpdateItem(
                          index, 
                          field.key, 
                          field.type === 'number' ? Number(e.target.value) : e.target.value
                        )
                      }
                      style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  )}

                  {field.type === 'select' && (
                    <select
                      value={String(item[field.key] ?? '')}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                        handleUpdateItem(index, field.key, e.target.value)
                      }
                      style={{ padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      <option value="">Select option...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {field.type === 'checkbox' && (
                    <input
                      type="checkbox"
                      checked={Boolean(item[field.key])}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        handleUpdateItem(index, field.key, e.target.checked)
                      }
                      style={{ width: 'fit-content' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddItem}
        style={{
          marginTop: '16px',
          padding: '8px 16px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        + Add New Object
      </button>
    </div>
  );
};