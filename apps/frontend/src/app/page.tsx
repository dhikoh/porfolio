import { serverFetch } from '@/lib/api-client';
import HomeClient from './home-client';

export const revalidate = 60;

export default async function HomePage() {
  let profile = null;
  let projects: Record<string, unknown>[] = [];
  let skills: Record<string, unknown>[] = [];
  let experiences: Record<string, unknown>[] = [];
  let education: Record<string, unknown>[] = [];
  let timeline: Record<string, unknown>[] = [];
  let stats: Record<string, unknown>[] = [];
  let processSteps: Record<string, unknown>[] = [];
  let settings: Record<string, string> = {};

  try {
    [profile, projects, skills, experiences, education, timeline, stats, processSteps, settings] = await Promise.all([
      serverFetch<Record<string, unknown>>('/profile'),
      serverFetch<Record<string, unknown>[]>('/projects?featured=true'),
      serverFetch<Record<string, unknown>[]>('/skills'),
      serverFetch<Record<string, unknown>[]>('/experiences'),
      serverFetch<Record<string, unknown>[]>('/education'),
      serverFetch<Record<string, unknown>[]>('/timeline'),
      serverFetch<Record<string, unknown>[]>('/stats'),
      serverFetch<Record<string, unknown>[]>('/process-steps'),
      serverFetch<Record<string, string>>('/settings'),
    ]);
  } catch (err) {
    console.error('Failed to fetch data:', err);
  }

  return (
    <HomeClient
      profile={profile}
      projects={projects}
      skills={skills}
      experiences={experiences}
      education={education}
      timeline={timeline}
      stats={stats}
      processSteps={processSteps}
      settings={settings}
    />
  );
}
