'use client';
import CrudPage, { FieldConfig } from '@/components/admin/CrudPage';
import { api } from '@/lib/api-client';

const fields: FieldConfig[] = [
  { key: 'degree', label: 'Gelar', type: 'text', required: true, placeholder: 'S1 Ilmu Komputer' },
  { key: 'institution', label: 'Institusi', type: 'text', required: true, placeholder: 'Universitas ...' },
  { key: 'year', label: 'Tahun', type: 'number', required: true, defaultValue: 2020 },
  { key: 'description', label: 'Deskripsi', type: 'textarea', placeholder: 'Deskripsi...' },
  { key: 'sortOrder', label: 'Urutan', type: 'number', defaultValue: 0 },
];

export default function AdminEducationPage() {
  return <CrudPage title="Pendidikan" fields={fields} fetchAll={api.getEducation} create={api.createEducation} update={api.updateEducation} remove={api.deleteEducation} displayField="degree" secondaryField="institution" />;
}
