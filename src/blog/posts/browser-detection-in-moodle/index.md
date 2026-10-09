---
title: Browser Detection in Moodle
published_at: 2012-03-19T16:28:10.000Z
modified_at: 
snippet: In order to polyfill, you have to know what's missing.
tags: Moodle
authors: Danny Wahl
---

Once again I’ve been working away at adding new features to Zebra for Moodle 2. One of my big pushes, by request (though it’s been on my plate) is getting some sort of better support for Internet Explorer 7 and 8. Which is actually pretty tough since they don’t support `@media` queries at all.

One option was to re-work the media query order from mobile-first to desktop-first, but that’s not fun. So I decided to use [respond.js](https://github.com/scottjehl/Respond "Respond.js github repository"). According to the author respond.js is:

> A fast & lightweight polyfill for min/max-width CSS3 Media Queries (for IE 6-8, and more). The goal of this script is to provide a fast and lightweight (3kb minified / 1kb gzipped) script to enable responsive web designs in browsers that don’t support CSS3 Media Queries – in particular, Internet Explorer 8 and under.

Which was exactly what I wanted. I love not re-inventing the wheel. At first I just threw it in the javascripts\_footer() array and called it a day (it worked!). But then I got to thinking, why should I make good users with modern browsers suffer having to load this javascript just to not run it? So I decided to sniff out the browser. At first I tried using IE conditionals (e.g. `<!--[if lt IE 9]>blah blah blah…<![endif]-->`) but it turns out those do not play nice with php at all and a switch just got too big too fast.

Then I was reminded that Moodle already does browser detection and that the value is stored in the body classes. Turns out that Moodle actually stores two values: IE and IE# where # is the version (7, 8, etc…). With that knowledge it was fairly simple to serve respond.js to only those users. All I had to do was add the code to my page layout(s). In this example the variable `$userespond` is simply a value stored from the theme settings page – so an administrator can turn it off entirely.

```php
// general.php
if ($userespond == 1) {
    $usingie = strpos($PAGE->bodyclasses, 'ie ie');
    $usingie9 = strpos($PAGE->bodyclasses, 'ie9');
    if (($usingie !== false) && ($usingie9 === false)) {
        $PAGE->requires->js('/theme/zebra/javascript/respond.js');
    }
}
```

That was pretty easy. So then I decided to do the same thing to load [Chrome Frame](http://code.google.com/chrome/chromeframe/ "Google Chrome Fram") as another option. In this example there are two variables. The first is `$usecf` which does the same thing as `$userespond` above, and the second is a max version of IE to target. So if you set it to “7” users on IE8 won’t see a prompt to install. The default is 6 by the way, and this is about as much “compatibility” as I plan to add for this theme with IE6.

```php
// general.php
<?php if ($usecf == 1) {
    $ieversion = strpos($PAGE->bodyclasses, $cfmaxversion);
    if ($ieversion !== false) {
        $PAGE->requires->js(new moodle_url('http://ajax.googleapis.com/ajax/libs/chrome-frame/1/CFInstall.min.js')); ?>
        <script>
            //<![CDATA[
                window.attachEvent('onload',function(){CFInstall.check({mode:'overlay'})})
            //]]>
        </script>
    <?php }
}
```

Then I remembered that for a while now I’ve had a javascript included in the footer that only fixes a viewport re-flow error on iOS, and I figured I should target that the same way. Unfortunately Moodle doesn’t store that information as easily, but it’s pretty straight forward information to get, since there are only three devices that use iOS.

```php
// general.php
if (preg_match('/iPhone|iPod|iPad/i', $_SERVER['HTTP_USER_AGENT'])) {
    $PAGE->requires->js('/theme/zebra/javascript/iOS-viewport-fix.js');
}
```

There, now I feel a lot better for all the Firefox (or Opera?) users out there. Instead of downloading and evaluating three javascripts that would do nothing on your browser, you get nothing! Now, I am fully aware that browser detection is not a great practice, for starters any one can change their user-agent and none of this would work. But, all 3 of these scripts are attempts at preventing degradation so if they don’t run the worst that happens is the user’s browser is as broken as it would have been if I hadn’t included the scripts at all.