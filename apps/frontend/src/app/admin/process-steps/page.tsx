'use client';
import CrudPage, { FieldConfig } from '@/components/admin/CrudPage';
import { api } from '@/lib/api-client';

const fields: FieldConfig[] = [
  { key: 'number', label: 'Nomor', type: 'text', required: true, placeholder: '01' },
  { key: 'title', label: 'Judul', type: 'text', required: true, placeholder: 'Identifikasi Masalah' },
  { key: 'description', label: 'Deskripsi', type: 'textarea', placeholder: 'Deskripsi...' },
  { key: 'sortOrder', label: 'Urutan', type: 'number', defaultValue: 0 },
];

export default function AdminProcessStepsPage() {
  return <CrudPage title="Proses Kerja" fields={fields} fetchAll={api.getProcessSteps} create={api.createProcessStep} update={api.updateProcessStep} remove={api.deleteProcessStep} displayField="title" secondaryField="number" />;
}
