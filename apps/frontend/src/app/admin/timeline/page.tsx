'use client';
import CrudPage, { FieldConfig } from '@/components/admin/CrudPage';
import { api } from '@/lib/api-client';

const fields: FieldConfig[] = [
  { key: 'year', label: 'Tahun', type: 'text', required: true, placeholder: '2024' },
  { key: 'title', label: 'Judul', type: 'text', required: true, placeholder: 'Milestone ...' },
  { key: 'description', label: 'Deskripsi', type: 'textarea', placeholder: 'Deskripsi...' },
  { key: 'sortOrder', label: 'Urutan', type: 'number', defaultValue: 0 },
];

export default function AdminTimelinePage() {
  return <CrudPage title="Timeline" fields={fields} fetchAll={api.getTimeline} create={api.createTimeline} update={api.updateTimeline} remove={api.deleteTimeline} displayField="title" secondaryField="year" />;
}
