'use client';
import CrudPage, { FieldConfig } from '@/components/admin/CrudPage';
import { api } from '@/lib/api-client';

const fields: FieldConfig[] = [
  { key: 'name', label: 'Nama', type: 'text', required: true, placeholder: 'Nama skill' },
  { key: 'category', label: 'Kategori', type: 'select', required: true, options: [{ label: 'Expertise', value: 'expertise' }, { label: 'Technical', value: 'technical' }], defaultValue: 'technical' },
  { key: 'level', label: 'Level (%)', type: 'number', defaultValue: 80 },
  { key: 'icon', label: 'Icon (Lucide name)', type: 'text', placeholder: 'Code' },
  { key: 'description', label: 'Deskripsi', type: 'textarea', placeholder: 'Deskripsi skill...' },
  { key: 'sortOrder', label: 'Urutan', type: 'number', defaultValue: 0 },
];

export default function AdminSkillsPage() {
  return <CrudPage title="Keahlian" fields={fields} fetchAll={api.getSkills} create={api.createSkill} update={api.updateSkill} remove={api.deleteSkill} displayField="name" secondaryField="category" />;
}
