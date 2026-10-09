---
title: Zenphoto Album Name Hack
published_at: 2011-02-16T10:11:11.000Z
modified_at: 
snippet: 
tags: Zenphoto
authors: Danny Wahl
---

[ZenPhoto](http://zenphoto.org/) is a pretty robust, but light weight photo
gallery software.  The front-end is pretty sparse, but the framework is
excellent – meaning you can customize the layout in almost any way at the site,
album, and image level without needing to hack the core source.  One thing I
needed to do was to change the CSS of individual galleries at the site level,
which unfortunately you can’t do out of the box.

Luckily, I was able to find pretty quickly some functions in the admin-functions
back-end that I was able to call in the template and integrate it fairly easily,
all with ‘native’ code. So here’s what you would see when looking at a gallery
by default:

```markup
<div id="albums">
<div class="album">...</div>
    <div class="album">...</div>
</div>
```

Browse to your theme directory and edit index.php to look like the following:

```php
<div id="albums">
    <?php while (next_album()): ?>
        <div class="album" id="<?php echo seoFriendly(getAlbumTitle()); ?>">
            …
        </div>
    <?php endwhile; ?>
</div>
```

the `echo seoFriendly();` function is the key here, and in the end you’ll have
something that looks like this:

```markup
<div id="albums">
<div class="album" id="escaped-album-title">...</div>
    <div class="album" id="another-valid-html-title">...</div>
</div>
```

If all of your album titles are safe (no spaces, punctuation, special
characters, etc…) then you could just use `getAlbumTitle();` but if they’re not,
you won’t pass validation.
