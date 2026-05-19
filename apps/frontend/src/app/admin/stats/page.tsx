'use client';
import CrudPage, { FieldConfig } from '@/components/admin/CrudPage';
import { api } from '@/lib/api-client';

const fields: FieldConfig[] = [
  { key: 'label', label: 'Label', type: 'text', required: true, placeholder: 'Tahun Pengalaman' },
  { key: 'value', label: 'Nilai', type: 'text', required: true, placeholder: '9+' },
  { key: 'icon', label: 'Icon (Lucide)', type: 'text', placeholder: 'TrendingUp' },
  { key: 'sortOrder', label: 'Urutan', type: 'number', defaultValue: 0 },
];

export default function AdminStatsPage() {
  return <CrudPage title="Statistik" fields={fields} fetchAll={api.getStats} create={api.createStat} update={api.updateStat} remove={api.deleteStat} displayField="label" secondaryField="value" />;
}
