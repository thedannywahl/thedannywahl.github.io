import { extract } from "$std/front_matter/any.ts";
import { join } from "$std/path/posix/mod.ts";

const DIRECTORY = "./routes/projects/";

export interface Project {
  name: string;
  title: string;
  publishedAt: Date;
  modifiedAt: Date;
  sPublishedAt: string;
  sModifiedAt: string;
  tags: string;
  snippet: string;
  content: string;
  authors: string;
  fqdn: string;
  url: string;
  permalink: string;
}

export async function getProjects(): Promise<Project[]> {
  const dirs = Deno.readDir(DIRECTORY);
  const promises = [];
  for await (const dir of dirs) {
    if (dir.isDirectory) promises.push(getProject(dir.name));
  }
  const posts = await Promise.all(promises) as Project[];
  posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  return posts;
}

export async function getProject(name: string): Promise<Project | null> {
  const text = await Deno.readTextFile(join(DIRECTORY, `${name}/index.md`));
  const { attrs, body } = extract(text);
  return {
    name,
    title: attrs.title,
    publishedAt: new Date(attrs.published_at),
    modifiedAt: new Date(attrs.modified_at),
    sPublishedAt: dateToString(attrs.published_at),
    sModifiedAt: dateToString(attrs.modified_at),
    tags: attrs.tags,
    snippet: attrs.snippet,
    content: body,
    authors: attrs.authors,
    fqdn: "iywahl.com",
    url: `/projects/${name}/`,
    permalink: `https://iywahl.com/projects/${name}/`,
  };
}

export function dateToString(toFormat: Date) {
  const formattedDate = new Date(toFormat).toLocaleDateString("en-us", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return `${formattedDate}`;
}
