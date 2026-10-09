---
title: "Moodle Output: An Introduction"
published_at: 2014-07-18T16:44:33.000Z
modified_at: 
snippet: 
tags: Moodle
authors: Danny Wahl
---

Here at iyWahl we’re not really developers. Sure we write some code, and we have even released a few plugins for [Moodle](https://github.com/thedannywahl/Zebra_4_Moodle_2), [WordPress](https://github.com/thedannywahl/California_4_WordPress_3), and [Mahara](https://github.com/thedannywahl/Zebra_4_Mahara) but really we’re in the educational technology consulting business. Recently [we took over development](/blog/new-home-elegance/ "New Home for Elegance") of the [Elegance](https://moodle.org/plugins/view.php?plugin=theme_elegance "Elegance") Moodle theme from its original author and began auditing the code. We quickly released a [Moodle 2.7 compatible](/blog/elegance-2-7-release/ "Elegance 2.7 release") version- but to the ([understandable](https://moodle.org/mod/forum/discuss.php?d=263376#p1141999)) [dissatisfaction](https://moodle.org/mod/forum/discuss.php?d=263376#p1142297) [of a lot](https://moodle.org/mod/forum/discuss.php?d=263376#p1142539) [of users](https://moodle.org/mod/forum/discuss.php?d=263376#p1143365) some of the changes we made were perceived as “worse” or at least “not better” than the older version of the theme. So in this post I’d like to clarify why some of the changes we made were made and why they’re actually better. This may get a bit technical but I’ll try to keep it simple.

## $OUTPUT Rules All

In Moodle what a plugin can do is determined by what kind of plugin it is. This is logical AND makes sense. For example an activity (say Forum) is not allowed to ask you if you want to change your site logo. Other software, like WordPress aren’t so well defined. Have you ever changed themes and had an entire post-type (like testimonials) disappear? That’s because themes in WordPress are allowed to do things beyond change the look and feel of the site. Imagine in Moodle if you changed your theme and suddenly couldn’t use the Quiz module any more! So we have a good system of permissions in Moodle and what’s allowed to do what.

Now we’re going to introduce you to `$OUTPUT`. $OUTPUT is a variable (meaning its content changes) that stores everything that gets output to a page- i.e. what you see in Moodle. This is a not-quite-technically-accurate definition because there are other global variables like `$CFG`, `$THEME`, `$PAGE`, `$USER`, and `$DB` but I think you get the idea. When a plugin has some data or information that it wants to display on the screen it gives it to $OUTPUT. For example, a list of quiz questions, or a button group that says “ok” or “cancel”. Generally the way that things are given to, read from, or changed in $OUTPUT is via what’s called in programming language a "[method](http://en.wikipedia.org/wiki/Method_(programming))". Simply stated a method is a way of doing things- this applies offline as well as online. I have a method of stacking our plates (largest on bottom, smallest on top) so they don’t fall over. People have various methods of parking their cars- and the method varies depending on the type of parking spot.

## Method to the Madness

Methods in Moodle are defined by Moodle core- and this is why a quiz can’t change a logo or a theme can’t add an activity type. Moodle core will, in a programmatic way, tell the plugin “sorry you can’t do that.” There’s pretty much one exception to this, themes actually CAN do pretty much whatever they want with $OUTPUT. Sure, there are a few limitations (like the example above) but really they can add to, remove from, or change ANYTHING inside of $OUTPUT. This isn’t actually a bad thing, look and feel requires, to a degree, modifying the document structure- some times! The bad thing is that ONLY themes have this power. So let’s give an example of why this is good, and then an example of why it might be bad.

### The Good: Font Icons

Iconography definitely falls into the “look & feel” department. So if a theme wants to use a font icon (like [fontawesome](http://fontawesome.io/)) it will have to change $OUTPUT. The transaction would look something like this:

> Quiz Module: Hey, $OUTPUT the user is adding a quiz to the course page. Make sure you use that piece of paper with a fat red check mark on it as the icon.
> 
> $OUTPUT: Cool, thanks for that info.
> 
> $OUTPUT: Yo! Theme, here’s everything you need to put on the page, get to work.
> 
> Theme plugin: Hold up $OUTPUT Imma let you finish, but font-awesome has the best icons. So We’re going to use a “question mark” icon instead.

Ta-da! Now you’re using an icon font to change the look-and feel of your website, but not really changing the functionality- which is the textbook definition of what a theme should do.

### The Bad: “Share This” Links

Let’s say you work at an actually-forward-thinking school that’s not bound by stuff like COPPA or CISPA, or a think-of-the-children mindset, or just a university. Pretend your school really wants to be able to add an array of “share this” links at the bottom of every forum post, next to the “reply”, “edit”, and “permalink” links. There are a number of options that you might try (or think you can try):

#### “local” plugin type

At first a developer might think “I’ll just make a small plugin that modifies the method that makes forum posts to include “share” links. They write a “local” plugin- meaning it’s not one of the well-defined plugin types (like assignment, theme, authentication, etc…) and write their new version of the method- and voila! It doesn’t work! Remember, Moodle tells plugins that they can’t change other plugins’ methods or their part of $OUTPUT.

#### Forum 2: Electric Boogaloo!

The next option is to fork (or make a copy of) the forum module and change its name (and all mentions of its name) to something different, like “Forum 2″. Then you change the method of your new module to add sharing links. Install the new Forum 2 on your Moodle and people can start using it. But now you have 2 forum modules. Do you leave them both enabled? One without sharing links and the other with? No, that’s silly- turn off the old forum. And now your Moodle administrator has 9,000 emails from teachers and students saying they can’t find their old posts- their conditional activities and course completion are broken. Fix it! Fix it! Fix it!. Now you need to write _another_ plugin called a “tool” that takes all of the old “Forum” instances on your site and converts them to “Forum 2″ types. What a nightmare! And don’t forget as soon as Moodle updates the original “Forum” you need to track those changes and copy them to your new version.

#### Or…

### The Ugly: The Social-est Theme

Instead of continuing with the “social” sharing example let’s switch to another one. Assume that you want to add some touch icons to your theme. There’s a variety of ways to achieve this and we’ll look at some of them here, with their drawbacks and advantages.

#### The “HTML” Way

This is probably the most straight forward way to add touch icons to your theme. Simply put the icons in the /pix/ folder and add the meta tag to your layout. Of course if your theme uses multiple layout files (which it probably does) you’ll need to add it to all all 5 or 6 or 7 layout files. The downside here is that by working outside of the image API you will probably cause some caching issues- and you _might_ even end up with broken images, depending on the site config.

#### The “Moodle” Way

So why not just use the `pix_url()` method instead? Good idea, actually! Then your touch icons are handled Moodle and all edge cases of config and cache are taken into account for you. But what if you have different themes for desktop and for mobile?

#### And On it Goes…

Okay, rather than itemizing every option we’re simply going to go down the rabbit trail. Now what if your site has a different theme for desktop vs. mobile? Simply add the new method and the images to both themes. Now what if your site allows teachers to choose their own course theme? Simply add the new method and images to all themes. Now what if some of those themes are “core” themes (included with Moodle) like “More”? Simply clone that theme (see the bullet point above) and add the method and images to your new theme OR create a new “child” theme (a theme that requires another theme) and add your method and images to that theme OR edit the core code \[please don’t do that!!!!\]

Did we mention that if you make a child theme to make a few modifications that settings aren’t inherited? They’re not. So if you want to clone “more” and make a few changes you’re really out of luck. You’re really just inheriting layout, styles, and JS – which would be good if that’s all themes could do. But that custom logo you created? Nope.

You might as well make your own theme. There is one final option, if you don’t have an in-house developer who can build and maintain a theme your only option is to ask a theme developer to add a feature to a theme. Which we get a lot of, and usually they’re very specific to that instance and wouldn’t be a good general inclusion for a them. But the reason that people ask is because of what’s specifically outlined above- there’s no other way to do it.

## Rubber Meets the Road

Okay there’s a bit of a background, now let’s look at some of the things specific to Elegance.

### Course Resource Tiles

As we’ve stated, one of the core responsibilities of a theme is to control the look and feel. The “Tiled Resources” was a cool look & feel feature but it wasn’t a complete feature- it took the big resource output and reformatted it as a box instead of a rectangle, and then “floated” it so they stacked next to each other. We removed this from the theme because it wasn’t _fully_ functional- and the functionality that it was trying to create already has a definition: “Course Format”. Remember how we said a theme can’t create a new activity? Well we shouldn’t try to have it _pretend_ like it has added other plugin types- we should actually create them. Very quickly, off the top of my head, here’s a list of the problems with the Tiled Resources as it existed in the theme that would need to be fixed for it to be fully functional:

*   Does it work across multiple course formats (including third party?)
*   How are labels output inside of the “box”?
*   How are folders w/ expanded content displayed in the “box”?
*   How does a resource with the “Description” shown on the page look?
*   How does the list of conditional access rules look on the page?
*   Does “drag and drop” reordering of resources work?
*   How do indented (move right/left) resources look?
*   How do boxes look on a mobile phone or tablet? Desktop?

All of these things fall into the definition of a course format- which a theme could then tweak the look and feel of, but ADDING all of this stuff to a theme is like cramming two plugins into one. On top of that you have a little bit of “vendor lock in”. We all know that teachers shouldn’t tailor their display to their theme and/or device – but they do. And this facilitates that. As an admin you’d never be able to remove or change Elegance as a theme option because suddenly _poof_ Tiled Resources is gone. That’s not good.

### My Course Tile Block

Let me just start by saying that the function that added this part to the theme was called something like “theme\_elegance\_my\_course\_tiles\_fake\_block”. That should be enough right there. A theme is a theme, a block is a block. A fake block in a theme is NOT a block. And here’s the problem(s) with it:

*   No block settings (global)
*   No block config (per-block)
*   Users can’t hide, move, or dock the block

All of those things are required by a block type plugin, but a theme modifying doesn’t have to follow the block rules to the detriment of the user. Not to mention, again, that if you switch themes you lose your block- unlike all other block types.

## Conclusion

In conclusion there are three main ways that themes modify $OUTPUT of a Moodle site:

1.  Strictly changing look and feel without changing functionality
2.  Adding functionality that _can’t_ be added by other plugin types
3.  Adding functionality that _can_ by added by other plugin types

The above two examples are examples of #3. They were providing functionality that should be provided by “real” plugins. This makes testing and maintaining the theme exponentially harder because you usage cases and configuration options increase with each additional fake plugin you add to your theme.

Now, to be clear, we didn’t remove these features from Elegance simply because ideally they should be a standalone plugin. We removed them because they were broken. Sure, for most simple Moodle installs they mostly worked, but we have to support all Moodle installs. And the only way to ensure that it works properly is to build the functionality correctly. So, while we understand that it’s not fun to lose functionality (especially stuff you really like!) we’re now on the path to being able to do it the right way.