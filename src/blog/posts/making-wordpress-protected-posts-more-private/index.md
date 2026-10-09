---
title: Making Wordpress Protected Posts More Private
published_at: 2011-11-28T12:37:43.000Z
modified_at: 
snippet: 
tags: Wordpress
authors: Danny Wahl
---

Boy that’s a lot of ‘P’s! Let’s just jump right in, shall we. Here’s the scenario, a user creates a post that they only want to share with select people because of the private nature of the post (notice I say post, not “content”) so they password their post and publish it. WordPress by default will block `the_content()` from displaying as well as `comments_template()`. That’s good! What’s not good is the amount of thing it doesn’t block. For example:

*   Post Title
*   Author
*   Post Date & time
*   Featured Image
*   The fact that comments are enabled
*   The post shows up in search & archives

There may be other things but this was the quick set I saw that I knew I needed to change. Turns out we can do this in just a couple of quick steps. First let’s look at what might be a standard single.php:

```php
<?php get_header(); ?>
    <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
        <header><h2><?php the_title(); ?></h2></header>
        <aside id="meta"><?php the_author(); ?> : <?php the_date(); ?></aside>
        <?php if ( has_post_thumbnail() ) : ?>
            <?php $post_thumbnail_id = get_post_thumbnail_id($post->ID); ?>
            <figure>
                <?php echo wp_get_attachment_link( $post_thumbnail_id, 'thumbnail', true ); ?>
                <figcaption>This is an image caption</figcaption>
            </figure>
        <?php endif; ?>
        <?php the_content(); ?>
    </article>
    <?php comments_template(); ?>
<?php get_footer(); ?>
```

Pretty simple, let’s break it down: Grab the header, the the author, time, and featured image, then the content and the comments. The only thing that wouldn’t show up would be the comments and the content. The title would also be prefixed with “Protected: “. That sure is a lot of information for a “Protected” post. Let’s fix that.

## single.php

The first step is to add a conditional to our above code, fortunately there’s an article class called `post-password-required` when a post is passworded and the user hasn’t input the password before. We’re going to leverage that by using the php function [`in_array()`](http://php.net/manual/en/function.in-array.php).

```php
<?php get_header(); ?>
    <?php if ( in_array( "post-password-required", get_post_class() ) ) : ?>
        <article id="post-<?php the_ID(); ?>">
            <header><h2>Password Required</h2></header>
            <?php the_content(); ?>
        </article>
    <?php else : ?>
        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            <header><h2><?php the_title(); ?></h2></header>
            <aside id="meta"><?php the_author(); ?> : <?php the_date(); ?></aside>
            <?php if ( has_post_thumbnail() ) : ?>
                <?php $post_thumbnail_id = get_post_thumbnail_id($post->ID); ?>
                <figure>
                    <?php echo wp_get_attachment_link( $post_thumbnail_id, 'thumbnail', true ); ?>
                    <figcaption>This is an image caption</figcaption>
                </figure>
            <?php endif; ?>
            <?php the_content(); ?>
            <?php comments_template(); ?>
        </article>
    <?php endif; ?>
<?php get_footer(); ?>
```

So if the post is going to require a password, we don’t serve any of that other content, just `the_content()`. We don’t even give them the title of the article.

Next we’re going to remove our protected posts from archive, search, category, and tag lists, again just to prevent exposing that the post even exists, because that could be annoying to visitors that don’t have the password! We’re going to achieve this by filtering our queries on those types of pages.

## functions.php

```php
// Exclude passworded posts from search and archive
function password_post_exclude($where, $wp_query = NULL) {  
    global $wpdb;  
    if ( ! $wp_query ) {
        global $wp_query;
    }
    if ( $wp_query->is_archive  || $wp_query->is_search ) {  
        $where .= " AND $wpdb->posts.post_password = ''";  
    }  
    return $where;  
}  
add_filter( 'posts_where','password_post_exclude', 1, 2 );
```

This is a pretty simple filter, we’re just using the [`wpdb`](http://codex.wordpress.org/Class_Reference/wpdb) class to append one more rule to the database query, and that rule is that the post password must be null. Kind of an odd way to do it, but this is the only way to check if a post is protected or not (in a query).

## Notes

That’s all there is to making your protected posts a little more private. Now I know what you’re thinking, obfuscation isn’t security. I know that. This isn’t to make things more secure, this is to increase the privacy of the post by limiting what information is shown and removing it from general access. I know what else you’re thinking: If your website is open to search engines your post is still going to get crawled and indexed for people to find. Yes and no; yes it will get crawled but here’s what it will index: Title: “Password Required” Content: “You need a password to view this post”. Versus the default of: Title: “Protected: Your Secret Post Title” Content: “You need a password to view this post”. So even if it gets indexed it’s not going to show up in search results, and again this isn’t about security!

Finally, since we’re serving our own title for the protected post you can remove the WP prep-end from the title with another custom function:

```php
// Remove "Protected: " from passworded posts because we serve our own title
function strip_the_title( $title ) {
    $title = attribute_escape( $title );
    $modified = '#Protected: #';
    $original = '';
    $title = preg_replace( $modified, $original, $title );
    return $title;
}
add_filter( 'the_title', 'strip_the_title' );
```