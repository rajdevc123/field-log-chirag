import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { siteConfig, WorkContextId, WorkContextMeta } from './site';

export interface ProjectFrontmatter {
  slug: string;
  title: string;
  titleParts?: [string, string];
  titleOffset?: [string, string];
  context: WorkContextId;
  year: number | string;
  role: string;
  collaborators?: string[];
  tools: string[];
  tags: string[];
  thumbnail: string;
  heroMedia?: string;
  media?: string[];
  colors?: string[];
  summary?: string[];
  externalUrl?: string;
  order: number;
  featured?: boolean;
}

export interface ProjectEntry extends ProjectFrontmatter {
  content: string;
  displayNumber: string;
  nextSlug: string;
  nextTitle: string;
}

export interface ProjectContextGroup {
  context: WorkContextMeta;
  projects: ProjectEntry[];
}

const PROJECTS_DIR = path.join(process.cwd(), 'src/content/projects');

export function getAllProjects(): ProjectEntry[] {
  if (!fs.existsSync(PROJECTS_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(PROJECTS_DIR)
    .filter((file) => file.endsWith('.mdx'));

  const rawProjects = files.map((filename) => {
    const filePath = path.join(PROJECTS_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const slug = data.slug || filename.replace(/\.mdx$/, '');

    return {
      slug,
      title: data.title ?? slug,
      titleParts: data.titleParts ?? splitTitleIntoTwo(data.title ?? slug),
      titleOffset: data.titleOffset ?? ['42%', '48%'],
      context: (data.context ?? 'nid') as WorkContextId,
      year: data.year ?? 2025,
      role: data.role ?? 'Designer / Developer',
      collaborators: Array.isArray(data.collaborators) ? data.collaborators : [],
      tools: Array.isArray(data.tools) ? data.tools : [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      thumbnail: data.thumbnail ?? `/projects/${slug}/thumb.svg`,
      heroMedia: data.heroMedia,
      media: Array.isArray(data.media)
        ? data.media
        : [data.heroMedia || data.thumbnail || `/projects/${slug}/thumb.svg`],
      colors: Array.isArray(data.colors)
        ? data.colors
        : ['#252526', '#1c1c1e', '#2d3134'],
      summary: Array.isArray(data.summary) ? data.summary : [],
      externalUrl: data.externalUrl,
      order: typeof data.order === 'number' ? data.order : 1,
      featured: Boolean(data.featured),
      content,
    };
  });

  // Sort descending by order (newest / highest number at the visual top)
  const sorted = rawProjects.sort((a, b) => b.order - a.order);

  return sorted.map((project, idx) => {
    const nextIdx = (idx + 1) % sorted.length;
    const nextProject = sorted[nextIdx];
    return {
      ...project,
      displayNumber: String(project.order).padStart(2, '0'),
      nextSlug: nextProject ? nextProject.slug : project.slug,
      nextTitle: nextProject ? nextProject.title : project.title,
    };
  });
}

export function getProjectsByContext(): ProjectContextGroup[] {
  const all = getAllProjects();

  return siteConfig.contexts
    .map((ctx) => ({
      context: ctx,
      projects: all.filter((p) => p.context === ctx.id),
    }))
    .filter((group) => group.projects.length > 0);
}

export function getProjectBySlug(slug: string): ProjectEntry | undefined {
  const all = getAllProjects();
  return all.find((p) => p.slug === slug);
}

function splitTitleIntoTwo(title: string): [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return [title, 'Project'];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}
