'use client';
import CrudPage, { FieldConfig } from '@/components/admin/CrudPage';
import { api } from '@/lib/api-client';

const fields: FieldConfig[] = [
  { key: 'title', label: 'Posisi', type: 'text', required: true, placeholder: 'Software Engineer' },
  { key: 'company', label: 'Perusahaan', type: 'text', required: true, placeholder: 'PT ...' },
  { key: 'location', label: 'Lokasi', type: 'text', placeholder: 'Jakarta' },
  { key: 'startDate', label: 'Mulai', type: 'text', required: true, placeholder: '2020-01' },
  { key: 'endDate', label: 'Selesai', type: 'text', placeholder: '2024-12' },
  { key: 'current', label: 'Masih Bekerja', type: 'checkbox' },
  { key: 'description', label: 'Deskripsi', type: 'textarea', placeholder: 'Deskripsi...' },
  { key: 'highlights', label: 'Highlights (JSON)', type: 'textarea', placeholder: '["Point 1","Point 2"]', defaultValue: '[]' },
  { key: 'sortOrder', label: 'Urutan', type: 'number', defaultValue: 0 },
];

export default function AdminExperiencesPage() {
  return <CrudPage title="Pengalaman" fields={fields} fetchAll={api.getExperiences} create={api.createExperience} update={api.updateExperience} remove={api.deleteExperience} displayField="title" secondaryField="company" />;
}
