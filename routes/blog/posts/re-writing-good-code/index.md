---
title: Re-writing Good Code
published_at: 2011-11-05T14:39:53.000Z
modified_at: 
snippet: 
tags: 
authors: Danny Wahl
---

A few weeks back I published my
[qTranslate Missing Link](https://iywahl.com/blog/qtranslate-jquery-missing-link/ "qtranslate + jQuery Missing Link")
code, what I didn’t say in that post was that that was the 3rd revision of the
code. And I mean a real v3.0, not a “let’s call it a new version” kind of 3.0
(I’m looking at you Firefox…). What I want to do now is show you revisions 1.0
and 2.0, and how I got them, and then on to the final 3.0. And believe it or
not, there’s room (for someone else) to take it to a version 4.

First I needed to define my problem, and I needed to identify how I wanted to
develop a fix for it. Defining the problem was easy, there were already threads
at [mysitemyway.com](http://mysitemyway.com/) saying that qTranslate didn’t
translate the ‘Home’ link on their themes’ custom menus (which isn’t really
mysitemyway’s fault) and there were threads over at the
[qTranslate](http://www.qianqin.de/qtranslate/) forums saying the same thing for
lots of different themes. Now we were on the right track. What I needed to do
now is decide how to fix it. The answer became clear almost straight away:
[jQuery](http://jquery.com/), simply because that’s what WordPress uses, so I
knew it would work.

Since I’ve never used jQuery before (I think I’ve mentioned I’m not a JS guy…) I
spent most of the time with this version (1.0) reading jQuery docs, and actually
this rev. took the longest to write. Sadly, it’s the ugliest and least
pluggable. So here’s the code:

```javascript
if (jQuery("html").attr("lang") == "zh-CN") {
  jQuery("#menu-top-menu > li:first-child a").attr("href", function (i, val) {
    return val + "zh";
  });
}
```

You can see it’s a pretty static script, written specifically to take a single
selector in a single language and modify it by appending ‘`zh`‘ to the end of
the `href`. That “worked” until I needed it in multiple languages. Then I wrote
version 2.0:

```javascript
switch (jQuery("html").attr("lang")) {
  case "zh-CN":
    jQuery("#menu-top-menu > li:first-child a").attr("href", function (i, val) {
      return val + "zh/";
    });
    break;
  case "ko-KR":
    jQuery("#menu-top-menu > li:first-child a").attr("href", function (i, val) {
      return val + "ko/";
    });
    break;
}
```

Well now you can define multiple language, and we’re using a proper `switch`
instead of `elif`s but still, what if you need multiple selectors per language?
Enter version 3.0 (the one I released):

```javascript
jQuery.each(["#menu-top-menu > li:first-child a"], function (index, value) {
  jQuery(value).attr("href", function (i, val) {
    return val + jQuery("html").attr("lang").split("-")[0];
  });
});
```

Now we’re talking. This will work for any language, because we’re parsing the
actual value of the `lang` attribute and using that rather than hard coding it.
And we’re using `jQuery.each` to instantiate an array. Not bad if I do say so
myself.

So where would a version 3.1 or a version 4.0 go? Pretty simple answer really,
v3.1 would optimize the query by evaluating the `lang` attribute outside of the
loop rather than at every iteration, because it doesn’t change and it would
optimize readability by instantiating the array outside of the `jQuery.each`
function and then just call the variable. Version 4.0 would switch from using
`jQuery.each` to using a `for` loop since that’s apparently
[significantly faster](http://net.tutsplus.com/tutorials/javascript-ajax/10-ways-to-instantly-increase-your-jquery-performance/).

All of this is to say something that every programmer knows – no code is perfect
and there’s always a different (and perhaps better) way to do something. So if I
ever do get around to writing a version 4.0 of this script I might wrap it up in
a WordPress extension so that any user can plug it into any theme and define the
array themselves fixing everyone’s problems (with qTranslate…).
