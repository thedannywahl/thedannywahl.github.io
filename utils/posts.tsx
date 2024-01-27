import { extract } from "$std/front_matter/any.ts";
import { join } from "$std/path/posix/mod.ts";

const DIRECTORY = "./routes/blog/posts/";

export interface Post {
  slug: string;
  title: string;
  publishedAt: Date;
  modifiedAt: Date;
  sPublishedAt: string;
  sModifiedAt: string;
  tags: string;
  snippet: string;
  content: string;
  authors: string;
  url: string;
}

export async function getPosts(): Promise<Post[]> {
  const files = Deno.readDir(DIRECTORY);
  const promises = [];
  for await (const file of files) {
    const slug = file.name.replace(".md", "");
    promises.push(getPost(slug));
  }
  const posts = await Promise.all(promises) as Post[];
  posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  return posts;
}

export async function getPost(slug: string): Promise<Post | null> {
  const text = await Deno.readTextFile(join(DIRECTORY, `${slug}.md`));
  const { attrs, body } = extract(text);
  return {
    slug,
    title: attrs.title,
    publishedAt: new Date(attrs.published_at),
    modifiedAt: new Date(attrs.modified_at),
    sPublishedAt: dateToString(attrs.published_at),
    sModifiedAt: dateToString(attrs.modified_at),
    tags: attrs.tags,
    snippet: attrs.snippet,
    content: body,
    authors: attrs.authors,
    url: `/blog/${slug}`,
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
