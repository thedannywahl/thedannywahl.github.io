---
title: Simple, Dynamic Sidebars
published_at: 2011-11-24T09:08:19.000Z
modified_at: 
snippet: 
tags: Wordpress
authors: Danny Wahl
---

One of the things I loved right off the bat about
[WordPress](http://wordpress.org/) is that it’s extremely flexible in terms of
output and rendering, and that its built in functions are simple but also
robust. Here’s an example of what I’m talking about. If you want to output a
sidebar (widget area) you simply call the `dynamic_sidebar()` function and WP
handles the rest. A practical example of that might look something like this:

```php
<div id="container">
    <aside id="sidebar">
        <?php dynamic_sidebar(); ?>
    </aside>
    <article id="content">
        ...
    </article>
</div>
```

It’s extremely simple to use and works well, no complaints here! When it come
time to layout the styles your CSS would be similar to this:

```css
#sidebar {
    float: right;
    width: 200px;
}

#content {
    margin-right: 210px; /* 10 px for spacing */
}
```

And that would generally work, but if you’re designing a theme for someone else
to use, they actually might not want to use your sidebar and if they don’t add
any widgets their content is going to have an empty 210px wide column on the
right-hand side. WordPress provides a way to handle this too by evaluating the
return value.

```php
<?php if ( ! dynamic_sidebar() ) { ?>
   <li>...</li>
   <li>...</li>
<?php } ?>
```

Well that’s good too, but again, if you’re building a theme for someone else
they probably don’t want to use your hard-coded links either! The good news is
there’s a solution that involves only a little more code. And actually we’re
still going to be using the return value to dynamically build our theme.

```php
<div id="container">
    <aside id="sidebar"><?php dynamic_sidebar() == TRUE ? $class = 'sidebar' : $class = 'no-sidebar'; ?></aside>
    <article id="content" class="<?php echo $class; ?>">
        ...
    </article>
</div>
```

What this does is immediately evaluate the return value (boolean) and store a
variable based on the value, e.g. `TRUE` means there is a sidebar, `FALSE` means
there is no sidebar. That variable is then echoed in another item as a class.
You might also notice that the `#sidebar` article has no white-space any more,
that’s to allow some of our CSS3 to work properly, but it’s not necessary. Now
let’s look at the CSS:

```css
#sidebar {
    float: right;
    width: 200px;
}

#sidebar:empty {
    display: none;
}

#content.sidebar {
    margin-right: 210px; /* 10 px for spacing */
}

#content.no-sidebar {
    margin-right: 0;
}
```

Only two more rules, none of which are overrides! The one that might look
interesting just because it’s not too common yet is the `:empty` pseudo class.
It’s a great little addition to CSS3 and you can
[read more](http://webdesignernotebook.com/css/a-quick-note-about-the-empty-pseudo-class/)
[about it](http://www.w3.org/TR/css3-selectors/#empty-pseudo), but again, you
don’t need it you can just use widths.

So there you have it, if there’s a sidebar with some actual widgets in it, it
will display, otherwise your content will look like it was never supposed to
have a sidebar in the first place.
