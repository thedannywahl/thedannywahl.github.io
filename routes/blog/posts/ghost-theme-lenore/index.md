---
title: Ghost Theme 'Lenore'
published_at: 2015-03-19T04:50:20.000Z
modified_at: 
snippet: 
tags: Ghost
authors: Danny Wahl
---

[Ghost](http://ghost.org/) is a blogging platform. _Lenore_ is a theme designed
to showcase writing and as such most of its features are about what it doesn't
do.

![](/blog/ghost-theme-lenore/lenore-banner-2.jpg)

## Demo

A demo site of this theme is available at
[Github Pages](https://thedannywahl.github.io/ghost_theme-lenore/)

## Features

- Ghost 0.5.10 compatible:
  - Images \[[logo](http://support.ghost.org/change-my-ghost-blog-logo/),
    [blog cover](http://support.ghost.org/upload-cover-image-ghost-blog/),
    [author](http://support.ghost.org/change-user-image-cover-photo/),
    [post](http://support.ghost.org/add-image-post/),
    [tag](http://support.ghost.org/using-tag-manager/#tag-image)\]
  - [Tags](http://support.ghost.org/using-tag-manager/)
  - [Pages](http://support.ghost.org/publish-a-static-page/)
  - [Featured Posts](http://support.ghost.org/post-settings-overview/#set-post-as-featured)
  - [Navigation](http://support.ghost.org/add-navigation-menu-ghost-blog/)
  - [Code Injection](http://support.ghost.org/use-code-injection/)
- Dynamic rem/em based
  [root/compontent/element](https://css-tricks.com/rems-ems/) sizing
- 1.9KB of CSS (inluding
  [normalize.css](http://necolas.github.io/normalize.css/)!)
- woff2 font with woff fallback
  ([read more](https://gist.github.com/sergejmueller/cf6b4f2133bcb3e2f64a))
- 19 social sharing links
  - Email, twitter, Facebook, Google+, LinkedIn enabled by default
  - Uncomment others in `post.hbs`
- HTML Validated with [Nu HTML Checker](http://validator.w3.org/nu/)
- Insanely easy to customize:
  - lightweight CSS specification
  - shallow nesting
  - no IDs

## Un-features

- Exactly one layout. Use it with or without images, logos, descriptions, bios;
  it looks great with any options- and you don't have to edit a thing, it just
  works.
- No grid
- No JavaScript
- No images
- No external resources!
- No shims, fallbacks, or browser hacks ‐ because you don't need them

## Browser Compatiblity

- [x] Firefox
- [x] Safari
- [x] Chrome
- [x] IE9

- [x] iOS Safari 7
- [x] Opera
- [x] Android
- [x] Vivaldi

## Layouts

Lenore supports several different content configurations, below are links to
some examples. Note that none of these examples require theme customization,
they just work.

### Author

![](/blog/ghost-theme-lenore/lenore-author-archive.jpg)

[Author archive: ✓image, ✓cover](https://thedannywahl.github.io/ghost_theme-lenore/author/poe/)

[Author archive: ✗image, ✗cover](https://thedannywahl.github.io/ghost_theme-lenore/author/ghost-writer/)

[Author post: ✓with bio](https://thedannywahl.github.io/ghost_theme-lenore/author-with-bioimages/)

[Author post: ✗bio](https://thedannywahl.github.io/ghost_theme-lenore/author-without-bioimages/)

### Page

![](/blog/ghost-theme-lenore/lenore-page-layout.jpg)

[Page: ✓image](https://thedannywahl.github.io/ghost_theme-lenore/layouts/)

[Page: ✗image](https://thedannywahl.github.io/ghost_theme-lenore/features/)

### Tag Archive

![](/blog/ghost-theme-lenore/lenore-tag-archive.jpg)

[Tag archive: ✓image, ✓description](https://thedannywahl.github.io/ghost_theme-lenore/tag/tag-image-and-description/)

[Tag archive: ✗image, ✓description](https://thedannywahl.github.io/ghost_theme-lenore/tag/description/)

[Tag archive: ✓image, ✗description](https://thedannywahl.github.io/ghost_theme-lenore/tag/tag-image/)

[Tag archive: ✗image, ✗description](https://thedannywahl.github.io/ghost_theme-lenore/tag/paged/)

### Post

![](/blog/ghost-theme-lenore/lenore-post.jpg)

[Post: ✓image](https://thedannywahl.github.io/ghost_theme-lenore/image-and-tags/)

[Post: ✗image](https://thedannywahl.github.io/ghost_theme-lenore/tags-no-image/)

[Post: ✓tags](https://thedannywahl.github.io/ghost_theme-lenore/tags-no-image/)

[Post: ✗tags](https://thedannywahl.github.io/ghost_theme-lenore/no-image-no-tags/)

## Customization

Lenore is easy to customize and everything you want to customize is commented in
the file you need to edit.

### Stylesheets

The CSS has a table of contents and comments labeled inline. Want to change the
link color? Find it in the table of contents and search for it. It's this easy:

```css
a {
	color: #4b87aa; /*<==11*/
	text-decoration: none;
	transition: all 0.25s;
}
a:hover,
a:focus,
a:active{
	color: #068bd8; /*<==12*/
}
```

Or how about the max-width of post content?

```css
article {
 max-width: 34rem; /*<==06*/
}
```

### Social Sharing

There are also a number of social sharing links in `post.hbs`. By default only 5
are enabled. To enable or disable different networks, simply uncomment them by
removing the handlebars around the `<li>` elements:

```handlebars
{{!--REDDIT
	<li><a class="reddit" href="http://www.reddit.com/submit/?url={{@blog.url}}{{url}}">reddit</a></li>
--}}
```

becomes:

```handlebars
<li>
  <a class="reddit" href="http://www.reddit.com/submit/?url={{@blog.url}}{{url}}">
    reddit
  </a>
</li>
```

All social networks have a helper class for ease of styling. In total there are
19 sharing options provided.

## Download & Support

Lenore is available for download on github and support is provided via github
issues.

[Download _Lenore: A Theme for Writing_](https://github.com/thedannywahl/ghost_theme-lenore/releases)
