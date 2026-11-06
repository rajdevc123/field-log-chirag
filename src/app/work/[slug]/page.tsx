import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getAllProjects, getProjectBySlug } from '@/content/getProjects';
import { CaseStudy } from '@/components/CaseStudy';
import { Figure } from '@/components/mdx/Figure';
import { Gallery } from '@/components/mdx/Gallery';
import { Video } from '@/components/mdx/Video';
import { TwoCol } from '@/components/mdx/TwoCol';
import { ProblemFraming } from '@/components/mdx/ProblemFraming';
import { ConversationalMedium } from '@/components/mdx/ConversationalMedium';
import { PhysicalForm } from '@/components/mdx/PhysicalForm';
import { SpatialLoop } from '@/components/mdx/SpatialLoop';
import { CompanionApp } from '@/components/mdx/CompanionApp';
import { ProjectConclusion } from '@/components/mdx/ProjectConclusion';
import { ReadingProgress } from '@/components/mdx/ReadingProgress';

const mdxComponents = {
  Figure,
  Gallery,
  Video,
  TwoCol,
  ProblemFraming,
  ConversationalMedium,
  PhysicalForm,
  SpatialLoop,
  CompanionApp,
  ProjectConclusion,
  ReadingProgress,
};

export function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = getProjectBySlug(params.slug);
  if (!project) {
    return {
      title: 'Project Not Found | Chirag Rajdeo',
    };
  }
  return {
    title: `Chirag Rajdeo | ${project.title}`,
    description:
      project.summary?.join(' ') || `${project.title} — ${project.role}`,
  };
}

export default function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = getProjectBySlug(params.slug);
  if (!project) {
    notFound();
  }

  return (
    <CaseStudy
      project={project}
      mdxContent={
        project.content ? (
          <MDXRemote source={project.content} components={mdxComponents} />
        ) : null
      }
    />
  );
}
