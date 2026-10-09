import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
import { readTagIcons } from './tag-icons.js';

export const origin = 'https://iywahl.com';
const postsDirectory = new URL('../src/blog/posts/', import.meta.url);
const reserved = new Set(['archive', 'tags', 'page', 'feed', 'feed.xml', 'media', 'downloads']);
const markdown = new MarkdownIt();
const legacyFeedIds = new Map(Object.entries(JSON.parse(readFileSync(new URL('../src/data/feed-ids.json', import.meta.url), 'utf8'))));

export function normalizePost(data, slug) {
  if (!/^[a-z0-9][a-z0-9.'-]*$/.test(slug) || reserved.has(slug)) throw new Error(`Invalid blog slug: ${slug}`);
  const date = new Date(data.published_at);
  if (typeof data.title !== 'string' || !data.title.trim() || !data.published_at || !Number.isFinite(date.getTime())) {
    throw new Error(`Invalid blog metadata: ${slug}`);
  }
  if (data.draft !== undefined && typeof data.draft !== 'boolean') throw new Error(`Invalid draft flag: ${slug}`);
  const modified = data.modified_at ? new Date(data.modified_at) : null;
  if (modified && !Number.isFinite(modified.getTime())) throw new Error(`Invalid modified date: ${slug}`);
  const labels = Array.isArray(data.tags) ? data.tags : String(data.tags || '').split(',');
  const tagIcons = readTagIcons();
  const topics = [...new Set(labels.map(label => String(label).trim()).filter(Boolean))].map(label => {
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return { label, slug, ...(Object.hasOwn(tagIcons, slug) ? tagIcons[slug] : { icon: 'tag', color: null }) };
  });
  if (topics.some(topic => !topic.slug)) throw new Error(`Invalid topic: ${slug}`);
  return { slug, title: data.title, date, updated: modified && modified >= date ? modified : null,
    description: String(data.snippet || ''), author: String(data.authors || 'Danny Wahl'), topics,
    draft: data.draft === true, url: `/blog/${slug}/`,
    canonical: `${origin}/blog/${slug}/`, feedId: legacyFeedIds.get(slug) || `${origin}/blog/${slug}/` };
}

export function readBlog() {
  const posts = readdirSync(postsDirectory, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => {
    const text = readFileSync(new URL(`${entry.name}/index.md`, postsDirectory), 'utf8');
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/);
    if (!match) throw new Error(`Missing frontmatter: ${entry.name}`);
    const post = normalizePost(parse(match[1]), entry.name);
    if (!post.description) {
      const excerpt = markdown.parse(match[2], {}).filter(token => token.type === 'inline')
        .map(token => token.children.map(child => ['text', 'code_inline'].includes(child.type) ? child.content :
          ['softbreak', 'hardbreak'].includes(child.type) ? ' ' : '').join(''))
        .find(text => text.trim())?.replace(/\s+/g, ' ').trim() || post.title;
      post.description = excerpt.length <= 180 ? excerpt : `${excerpt.slice(0, 180).replace(/\s+\S*$/, '')}...`;
    }
    return post;
  }).filter(post => !post.draft).sort((first, second) => second.date - first.date || first.slug.localeCompare(second.slug));
  const topicMap = new Map();
  for (const post of posts) {
    for (const topic of post.topics) {
      const previous = topicMap.get(topic.slug);
      if (previous && previous.label.toLowerCase() !== topic.label.toLowerCase()) {
        throw new Error(`Topic slug collision: ${topic.label}`);
      }
      if (!previous) topicMap.set(topic.slug, { ...topic, posts: [] });
      topicMap.get(topic.slug).posts.push(post);
    }
  }
  const years = [...new Set(posts.map(post => post.date.getUTCFullYear()))].map(year => ({
    year, posts: posts.filter(post => post.date.getUTCFullYear() === year),
  }));
  return { posts, years, updatedAt: new Date(Math.max(0, ...posts.map(post => (post.updated || post.date).getTime()))),
    topics: [...topicMap.values()].sort((first, second) => first.label.localeCompare(second.label)) };
}

export function sanitizeMarkdown(html) {
  return sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'input', 'del'],
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['id', 'class'], a: ['href', 'title'], img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      input: ['type', 'checked', 'disabled'], pre: ['style'], span: ['style'] },
    allowedStyles: { '*': {
      '--shiki-light': [/^#[\da-f]{3,8}$/i], '--shiki-dark': [/^#[\da-f]{3,8}$/i],
      '--shiki-light-bg': [/^#[\da-f]{3,8}$/i], '--shiki-dark-bg': [/^#[\da-f]{3,8}$/i],
    } },
    allowedSchemes: ['https', 'http', 'mailto'],
    transformTags: { input: () => ({ tagName: 'input', attribs: { type: 'checkbox', disabled: 'disabled' } }) },
  });
}