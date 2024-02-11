---
title: Playing with userContent.css
published_at: 2011-11-04T21:11:56.000Z
modified_at: 
snippet: 
tags: 
authors: Danny Wahl
---

Here in China the fact that some websites just are never available (e.g. facebook, youtube, twitter, google+, hulu, [etc…](http://en.wikipedia.org/wiki/List_of_websites_blocked_in_the_People%27s_Republic_of_China)) and some sites get blocked intermittently depending on what you’re [searching for](http://en.wikipedia.org/wiki/List_of_words_censored_by_search_engines_in_the_People%27s_Republic_of_China) is a constant source of frustration for me. My typical day looks like this:

1.  Need to look something up
2.  type google.com
3.  connection reset
4.  type bing.com and enter search criteria
5.  open results in new page
6.  results pages have connection reset
7.  type yahoo.com and enter search
8.  I never find what I’m looking for with yahoo
9.  give up and try again later

So one day I decided that I needed to give myself a little pick-me-up as I was contemplating throwing my laptop across the room. So off I went to figure out how to edit the connection reset page in Firefox. Turns out that it all comes down to userContent.css, so let’s dive in. The first thing I did was find an image I wanted to plaster all over that boring info box, save it and then call it.

On OS X userContent.css can be found in your user library (specifically `~/Library/Application Support/Firefox/Profiles/[RANDOMSTRING].default/chrome/` where \[RANDOMSTRING\] is a… you guessed it, random string of characters). The first thing to do is copy `userContent-example.css` to `userContent.css`. The second step is to start hacking away. I found some threads over at the Mozilla developer forums that said that it doesn’t support local images, but guess what? It does! Anyways here’s what I added to mine:

Vendor prefixes in _my_ CSS? Well I guess this is just for Firefox so I’ll let it slide this time. And here’s what it looks like:

![userContent-before](/blog/playing-with-usercontent-css/userContent-before.png)

![userContent-after](/blog/playing-with-usercontent-css/userContent-after.png)

Now I know what you’re thinking: How the heck did you come up with `@-moz-document url-prefix(about:neterror?e=netReset)` so that you could do that hilarious thing you did? Well I didn’t. I found it somewhere else, and if I could remember where, I’d link to it, but I’m going to guess it was at [Mozilla](http://www-archive.mozilla.org/unix/customizing.html#userContent) because that page is purple in my Google search results for “[UserContent.css](http://www.google.com/#hl=en&sugexp=kjrmc&cp=10&gs_id=1p&xhr=t&q=userContent.css&pf=p&sclient=psy-ab&safe=off&source=hp&pbx=1&oq=userConten&aq=0&aqi=g4&aql=f&gs_sm=&gs_upl=&bav=on.2,or.r_gc.r_pw.,cf.osb&fp=25f1a21493d5da43&biw=1226&bih=677)” but to spare you the trouble of having to try to figure out the other error codes (should you want to mess with them too) here’s the rest:

```css
@-moz-document url-prefix(about:neterror?e=generic) { }
@-moz-document url-prefix(about:neterror?e=dnsNotFound) { }
@-moz-document url-prefix(about:neterror?e=fileNotFound) { }
@-moz-document url-prefix(about:neterror?e=malformedURI) { }
@-moz-document url-prefix(about:neterror?e=protocolNotFound) { }
@-moz-document url-prefix(about:neterror?e=connectionFailure) { }
@-moz-document url-prefix(about:neterror?e=netTimeout) { }
@-moz-document url-prefix(about:neterror?e=redirectLoop) { }
@-moz-document url-prefix(about:neterror?e=unknownSocketType) { }
@-moz-document url-prefix(about:neterror?e=netReset) { }
@-moz-document url-prefix(about:neterror?e=netOffline) { }
@-moz-document url-prefix(about:neterror?e=netInterrupt) { }
@-moz-document url-prefix(about:neterror?e=deniedPortAccess) { }
@-moz-document url-prefix(about:neterror?e=proxyResolveFailure) { }
@-moz-document url-prefix(about:neterror?e=proxyConnectFailure) { }
```