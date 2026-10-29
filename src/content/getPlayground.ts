import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface PlaygroundItem {
  slug: string;
  title: string;
  year: number | string;
  tech: string[];
  note: string;
  embed: string;
  thumbnail: string;
  order: number;
  displayNumber: string;
  content: string;
}

const PLAYGROUND_DIR = path.join(process.cwd(), 'src/content/playground');

export function getAllPlaygroundItems(): PlaygroundItem[] {
  if (!fs.existsSync(PLAYGROUND_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(PLAYGROUND_DIR)
    .filter((file) => file.endsWith('.mdx'));

  const items = files.map((filename, index) => {
    const filePath = path.join(PLAYGROUND_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const slug = data.slug || filename.replace(/\.mdx$/, '');

    return {
      slug,
      title: data.title ?? slug,
      year: data.year ?? 2025,
      tech: Array.isArray(data.tech) ? data.tech : [],
      note: data.note ?? '',
      embed: data.embed ?? '',
      thumbnail: data.thumbnail ?? `/playground/${slug}/thumb.svg`,
      order: typeof data.order === 'number' ? data.order : index + 1,
      displayNumber: '01',
      content: content.trim(),
    };
  });

  const sorted = items.sort((a, b) => b.order - a.order);

  return sorted.map((item, idx) => ({
    ...item,
    displayNumber: String(sorted.length - idx).padStart(2, '0'),
  }));
}
