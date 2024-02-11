---
title: "QTranslate: Using jQuery to Fix Missing Links"
published_at: 2011-10-22T19:51:28.000Z
modified_at: 
snippet: 
tags: Wordpress
authors: Danny Wahl
---

If you look at the [qtranslate forums](http://www.qianqin.de/qtranslate/) and
various theme forums there’s a variety of people saying this link or that link
doesn’t translate. The answer is usually to go edit the theme or plugin to call
qtranslate, but there’s one that’s never been answered, and that is the built-in
WordPress Menu.

Fortunately that’s something that we can solve with only a few lines of jQuery.
Why jQuery? Well because that’s what the menu is built on, so you have to be
using it already! Anyways, here’s the amazingly short code:

```javascript
jQuery.each(['CSS SELECTORS, COMMA SEPARATED'], function(index, value) {
    jQuery(value).attr(‘href’, function(i, val) {
        return val + jQuery(‘html’).attr(‘lang’).split(‘-’)[0]
    });
});
```

Ta-da. Simply what this code does is read the lang value from the HTML tag and
append the first two characters to the href value of the selectors in the array.
So en-US becomes en/ zh-CN becomes zh/ etc… I must say, that having never used
jQuery before it was strikingly easy! Especially compared to other JS libraries
like oh say [YUI](https://moodle.org/mod/forum/discuss.php?d=188627).
