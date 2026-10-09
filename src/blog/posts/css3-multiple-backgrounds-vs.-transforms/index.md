---
title: "CSS3: Multiple Backgrounds vs. Transforms"
published_at: 2012-07-13T14:48:23.000Z
modified_at: 
snippet: CSS3 introduces transforms.  Save on code and bandwidth.
tags: CSS
authors: Danny Wahl
---

We all know how multiple backgrounds work, and they’re really neat. Recently I started thinking about being able to use a single image and transforms to simulate some of the multiple background effects. Specifically the one where you want to put the same image in all 4 corners of a div, but facing a different direction (check out Mary’s example [here](http://moodle.org/mod/forum/discuss.php?d=206918 "Some CSS3 fun stuff to try out...") for Moodle).

The “problem” with multiple backgrounds like that is that you’re serving multiple images (which makes sense right…). But you’re not really serving multiple images, you’re serving one image that you’ve manipulated in some photo software to be oriented differently, what if you could take that one image and make it orient however you like? You can with transforms. Unfortunately multiple backgrounds don’t support transforms, only the container itself – because that would make things too easy! So we’re going to use the standard “wrapper” trick with pseudo-elements, and let’s face it, you probably still have wrappers in your code you don’t need anyways, so let’s put them to use.

```css
#content,
#content-wrapper {
    width: 400px;
    min-height: 200px;
    display: block;
    margin: 0 auto;
    overflow: hidden;
    position: relative;
}

#content::before { /* Top Left: no transform */
    content: "";
    z-index: -1;
    position: absolute;
    width: 80px;
    height: 80px;
    background: url(bg.png) 0 0 no-repeat;
    top: 0;
    left: 0;
}

#content::after { /* Top Right: flip horizontally */
    content: "";
    z-index: -1;
    position: absolute;
    width: 80px;
    height: 80px;
    background: url(bg.png) 0 0 no-repeat;
    transform: scaleX(-1);
    top: 0;
    right: 0;
}

#content-wrapper::before { /* Bottom Left: flip vertical */
    content: "";
    z-index: -1;
    position: absolute;
    width: 80px;
    height: 80px;
    background: url(bg.png) 0 0 no-repeat;
    transform: scaleY(-1);
    bottom: 0;
    left: 0;
}

#content-wrapper::after { /* Bottom Right: flip horizontal + vertical */
    content: "";
    z-index: -1;
    position: absolute;
    width: 80px;
    height: 80px;
    background: url(bg.png) 0 0 no-repeat;
    transform: scaleX(-1) scaleY(-1);
    bottom: 0;
    right: 0;
}
```

So there you go. The `::before` elements have the left images, the `::after` elements have the right images, and we use transform to flip them. Simple as that. And make a note that the current spec. supports pseudo-pseudo elements (e.g. `#id::before::before`) but no browsers currently implement it. Once they do you can drop the wrapper and use those, though it’s not definitively better, especially from a DOM perspective.