import { basename, dirname } from 'node:path';
import { normalizePost } from '../../../build/blog.js';

export default {
  layout: 'partials/blog-post.njk',
  permalink: data => data.draft === true ? false : `/blog/${basename(dirname(data.page.inputPath))}/index.html`,
  eleventyComputed: {
    post: data => normalizePost(data, basename(dirname(data.page.inputPath))),
    description: data => data.post.description || data.blog.posts.find(post => post.slug === data.post.slug)?.description || '',
  },
};