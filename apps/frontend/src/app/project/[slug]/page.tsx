import { serverFetch } from '@/lib/api-client';
import { notFound } from 'next/navigation';
import ProjectDetail from './project-detail';
import type { Metadata } from 'next';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const project = await serverFetch<Record<string, unknown>>(`/projects/${slug}`);
    return {
      title: `${project.title} | Portfolio`,
      description: project.description as string,
    };
  } catch {
    return { title: 'Project Not Found' };
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  let project = null;
  try {
    project = await serverFetch<Record<string, unknown>>(`/projects/${slug}`);
  } catch {
    notFound();
  }

  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
