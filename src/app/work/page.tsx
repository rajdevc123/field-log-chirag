import type { Metadata } from 'next';
import { getAllProjects, getProjectsByContext } from '@/content/getProjects';
import { WorkIndex } from '@/components/WorkIndex';

export const metadata: Metadata = {
  title: 'Chirag Rajdeo | Projects',
  description:
    'Selected interactive installations, physical computing, film production, and digital studio projects across NID, Future East Film, and Dr. Reddy’s Laboratories.',
};

export default function WorkPage() {
  const groups = getProjectsByContext();
  const allProjects = getAllProjects();

  return <WorkIndex groups={groups} allProjects={allProjects} />;
}
