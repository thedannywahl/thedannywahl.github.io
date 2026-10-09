import nunjucks from 'nunjucks';
import { readProjects, projectArtwork, structuredData } from './build/site.js';
import { readBlog, sanitizeMarkdown } from './build/blog.js';
import anchor from 'markdown-it-anchor';
import Shiki from '@shikijs/markdown-it';
import rss from '@11ty/eleventy-plugin-rss';

const shiki = await Shiki({
  themes: { light: 'github-light', dark: 'github-dark' },
  defaultColor: false,
  langAlias: { markup: 'html', apacheconf: 'nginx' },
});

export default function (configuration) {
  configuration.setUseTemplateCache(false);
  configuration.addPreprocessor('drafts', 'md', data => {
    if (data.draft === true) return false;
  });
  const environment = new nunjucks.Environment(new nunjucks.FileSystemLoader('src', {
    noCache: true,
  }), { autoescape: true, throwOnUndefined: true });
  environment.addGlobal('projectArtwork', projectArtwork);
  environment.addGlobal('structuredData', structuredData);
  configuration.setLibrary('njk', environment);
  configuration.addLayoutAlias('partials/blog-layout.njk', 'blog-layout.njk');
  configuration.addLayoutAlias('partials/blog-post.njk', 'blog-post.njk');
  configuration.addGlobalData('projects', readProjects);
  configuration.addGlobalData('blog', readBlog);
  configuration.addPlugin(rss);
  configuration.addFilter('isoDate', date => date.toISOString());
  configuration.addFilter('displayDate', date => new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long', timeZone: 'UTC',
  }).format(date));
  configuration.addFilter('cleanUrl', url => url.replace(/index\.html$/, ''));
  configuration.amendLibrary('md', markdown => {
    markdown.enable('code');
    markdown.use(anchor);
    markdown.use(shiki);
    const render = markdown.render.bind(markdown);
    markdown.render = (...argumentsList) => sanitizeMarkdown(render(...argumentsList));
  });
  configuration.addPassthroughCopy('src/styles');
  configuration.addPassthroughCopy('src/scripts');
  configuration.addWatchTarget('src/assets/projects');
  configuration.ignores.add('src/partials/**');
  return {
    dir: { input: 'src', output: '.generated/site', includes: 'partials' },
    templateFormats: ['html', 'njk', 'md'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: false,
  };
}