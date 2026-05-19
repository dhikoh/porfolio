'use client';

import Navbar from '@/components/public/Navbar';
import HeroSection from '@/components/public/HeroSection';
import TrustSection from '@/components/public/TrustSection';
import AboutSection from '@/components/public/AboutSection';
import TimelineSection from '@/components/public/TimelineSection';
import ExpertiseSection from '@/components/public/ExpertiseSection';
import SkillsBarSection from '@/components/public/SkillsBarSection';
import ResumeSection from '@/components/public/ResumeSection';
import WorkSection from '@/components/public/WorkSection';
import ProcessSection from '@/components/public/ProcessSection';
import ContactSection from '@/components/public/ContactSection';
import Footer from '@/components/public/Footer';
import WhatsAppFloat from '@/components/public/WhatsAppFloat';
import SplashScreen from '@/components/public/SplashScreen';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface HomeClientProps {
  profile: any;
  projects: any[];
  skills: any[];
  experiences: any[];
  education: any[];
  timeline: any[];
  stats: any[];
  processSteps: any[];
  settings: Record<string, string>;
}

export default function HomeClient({
  profile, projects, skills, experiences, education, timeline, stats, processSteps, settings,
}: HomeClientProps) {
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#002329]">
        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-2xl font-semibold text-white mb-2">Portfolio sedang disiapkan</h1>
          <p className="text-white/50">Backend API belum tersedia atau sedang memproses data.</p>
        </div>
      </div>
    );
  }

  const expertiseSkills = skills.filter((s: any) => s.category === 'expertise');

  return (
    <>
      <SplashScreen />
      <Navbar fullName={profile.fullName} />
      <main>
        <HeroSection profile={profile} stats={stats} settings={settings} />
        {stats.length > 0 && <TrustSection stats={stats} />}
        <AboutSection profile={profile} settings={settings} />
        {timeline.length > 0 && <TimelineSection timeline={timeline} settings={settings} />}
        {expertiseSkills.length > 0 && <ExpertiseSection skills={expertiseSkills} settings={settings} />}
        {skills.filter((s: any) => s.category === 'technical').length > 0 && <SkillsBarSection skills={skills} settings={settings} />}
        <ResumeSection experiences={experiences} education={education} settings={settings} />
        {projects.length > 0 && <WorkSection projects={projects} settings={settings} />}
        {processSteps.length > 0 && <ProcessSection steps={processSteps} settings={settings} />}
        <ContactSection profile={profile} settings={settings} />
      </main>
      <Footer settings={settings} />
      <WhatsAppFloat settings={settings} />
    </>
  );
}
