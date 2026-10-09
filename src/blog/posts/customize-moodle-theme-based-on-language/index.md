---
title: Customize Moodle Theme Based on Language
published_at: 2012-12-07T11:43:00.000Z
modified_at: 
snippet: 
tags: Moodle
authors: Danny Wahl
---

The other day I got an interesting request from a site administrator using my Zebra theme:

> I look after a lot of bi-lingual Moodle sites… one school would like an English language banner with English content and a Welsh with Welsh. At the moment there’s no way to specify different banner images for different languages. Is this something that you might/have consider(ed) for future versions of Zebra?

Truthfully, it’s not something I’ve ever considered (no offense!) because at the moment there’s not really a “true” multi-site configuration for Moodle, though it may be coming. But the more I thought about it, the more I thought 1) the request isn’t really specific to Zebra and 2) Faking multi-site might be really easy by using cohort syncing and blind-groups in different categories (but that’s beside the point).

So I thought about it, and I remembered that `$OUTPUT->htmlattributes();` contains the user’s selected language. I thought of sniffing that out and concatenating it to the `$bodyclasses` array, then I remembered that CSS2 has a [lang pseudo-class](http://www.w3.org/TR/CSS2/selector.html#lang) which says this:

> If the document language specifies how the human language of an element is determined, it is possible to write selectors in CSS that match an element based on its language.

Now, normally you’ll see this used to change the quotes that are used, or maybe the text-indent, but you can use it like any other selector. So the solution for the original request looks like this:

Upload a blank PNG to your Moodle (or anywhere) and set that as the value in the Theme setting. This step’s just a little bit hacky, but that’s because you can’t change the `src` of an `img` tag with CSS. It would be possible to use JavaScript instead and load an actual logo.

Upload all of your language specific logos where ever you’re going to reference them from. For sanity’s sake I’d store them in language specific sub folders, e.g. /logo/en/logo.png, /logo/cy/logo.png (oh yeah, cy = Cymraeg = Welsh). This future proofs if you need more language-specific files in the future.

Finally, write your CSS to swap out the `background-image` value for each language and store it in the “Extra CSS” field.

```css
html:lang(en) #page-header .logo {
    background-image: url('/logo/en/logo.png');
}

html:lang(cy) #page-header .logo {
    background-image: url('/logo/cy/logo.png');
}
```

The result will be that you see the language-specific logo behind the transparent png. Don’t forget these couple of ‘gotchas': your transparent image will need to be as large or larger than your background images and if you leave the setting field NULL then Zebra won’t output the `img` tag in the first place.