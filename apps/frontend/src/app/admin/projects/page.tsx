'use client';
import CrudPage, { FieldConfig } from '@/components/admin/CrudPage';
import { api } from '@/lib/api-client';

const fields: FieldConfig[] = [
  { key: 'title', label: 'Judul', type: 'text', required: true, placeholder: 'Nama project' },
  { key: 'slug', label: 'Slug', type: 'text', required: true, placeholder: 'nama-project' },
  { key: 'description', label: 'Deskripsi', type: 'textarea', required: true, placeholder: 'Deskripsi singkat...' },
  { key: 'longDesc', label: 'Deskripsi Panjang', type: 'textarea', placeholder: 'Deskripsi lengkap...' },
  { key: 'domain', label: 'Domain', type: 'text', placeholder: 'contoh.com' },
  { key: 'liveUrl', label: 'Live URL', type: 'text', placeholder: 'https://...' },
  { key: 'githubUrl', label: 'GitHub URL', type: 'text', placeholder: 'https://github.com/...' },
  { key: 'imageUrl', label: 'Image URL', type: 'text', placeholder: '/uploads/images/...' },
  { key: 'tags', label: 'Tags (JSON)', type: 'text', placeholder: '["Tag1","Tag2"]', defaultValue: '[]' },
  { key: 'featured', label: 'Featured', type: 'checkbox', placeholder: 'Tampilkan di halaman utama' },
  { key: 'sortOrder', label: 'Urutan', type: 'number', defaultValue: 0 },
  { key: 'status', label: 'Status', type: 'select', options: [{ label: 'Published', value: 'PUBLISHED' }, { label: 'Draft', value: 'DRAFT' }], defaultValue: 'PUBLISHED' },
];

export default function AdminProjectsPage() {
  return <CrudPage title="Proyek" fields={fields} fetchAll={api.getAdminProjects} create={api.createProject} update={api.updateProject} remove={api.deleteProject} displayField="title" secondaryField="slug" />;
}
