---
title: URL Shorteners and Page Load Speed
published_at: 2013-09-24T10:23:37.000Z
modified_at: 
snippet: 
tags: 
authors: Danny Wahl
---

URL shorteners are all the rage right now. They make it easy to share links in
sites like twitter without blowing your character limit. They make sharing gross
long urls easy in email (for the bulk of users that don’t know how to use an
`<a>` tag or a “link” button). And some even offer cool analytics on the back
end. They seem like an all around good idea because who wants to see this:

```
http://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=2&cad=rja&ved=0CDIQFjAB&url=%68%74%74%70%3a%2f%2f%65%6e%2e%77%69%6b%69%70%65%64%69%61%2e%6f%72%67%2f%77%69%6b%69%2f%55%52%4c%5f%73%68%6f%72%74%65%6e%69%6e%67&ei=B_VAUo23J8iErgeCh4DYCw&usg=AFQjCNEayxRGdtXyKBGD8Kk5rbG1EeU4qw&sig2=fH4cQutvz40ycjP3Z9kPaQ&bvm=bv.52434380,d.bmk
```

When you could see this:

`http://goo.gl/4mQ43y`

But we also know that there’s a good push towards minimizing page load speeds,
so I’d like to take a look at whether or not the URL shorteners are worth the
time. What I’ll outline here is an emulation of a real-world example I came
across while riding the bus home from work. The emulation will not be extremely
scientific but I’ll examining the overhead from a shortened link shared on
twitter. Now link shortening is unavoidable when sharing something on twitter
because all links are filtered through [t.co](t.co)

> Twitter uses the t.co domain as part of a service to protect users from
> harmful activity, to provide value for the developer ecosystem, and as a
> quality signal for surfacing relevant, interesting Tweets.
> [Read more](https://support.twitter.com//entries/109623)

So, on to the experiment. We’re going to take a link to
[this post](https://iyware.com/url-shorteners-page-load-speed/) that you’re
reading right now and:

1. Get the RSS feed url
2. Pass it to [goo.gl](http://goo.gl/) URL shortening service:
   [http://goo.gl/bmTwkE](http://goo.gl/bmTwkE)
3. Pass that to [ow.ly](http://ow.ly/) URL shortening service:
   [http://ow.ly/p99kM](http://ow.ly/p99kM)
4. Pass that link to our
   [tweet](https://twitter.com/thedannywahl/status/382330965151858688)

Once that’s live we’re going to start profiling in in firebug and then we can
see our results. Now I know what you’re thinking: Why share a link to the RSS
feed? It’s a dumb idea but like I said, this is an emulation of a real-world
experience. So here are the results:

![](/blog/url-shorteners-and-page-load-speed/urlshorteningresults.jpg)

A small note, I was having trouble (read: I’m lazy) documenting the profiling
info for t.co, but it was consistently coming in around 200ms. Also, the info
above is from 3 separate tests, but they were all about the same results. Now
[current studies](http://blog.testobject.com/2013/09/47-of-users-will-wait-only-3-seconds.html)
show you have about 3 seconds to load your page, and by using URL shorteners
you’re potentially risking using up to a full third of that time just
redirecting the user. “But redirects aren’t actually _my_ page loading” one
might say. Yes they are to the end user. From the time I click a link, I’m
loading _your_ page. I don’t care if the jQuery CDN is down or Google analytics
is slow to load, it’s your fault (and rightly so).

Let me paint the picture a little worse for you too. This test was done on a
40Mbit fibre connection. Not an hspa or 3g mobile connection. Sure it’s only 2
extra “get”s but remember this, it’s also 2 extra DNS lookups. The amount of
info that we’re grabbing is extremely small (20bytes) but DNS lookup times can
vary wildly.

Look at the results again, another thing to take into consideration is that it’s
possible all url shorteners are not created equal. Surely Google has a greater
infrastructure than twitter or ow.ly and the results bear that. Could it be that
I’m in a place with a longer round trip to the ow.ly servers? Most definitely
so, but as a user, I don’t care.

So, in the end, I have to suggest this: If you don’t need it, don’t use it.
Which is probably pretty good advice for the whole of web development.

On a final note I’d like to point out that
[not all internets are created equal](https://en.greatfire.org/search/blocked).
bit.ly and ow.ly are blocked in mainland China (where I am) by the
[Great Firewall](http://en.wikipedia.org/wiki/Great_Firewall_of_China). There
are many websites besides twitter where users or admins rely a lot on these
services unnecessarily. By unnecessarily I mean that there are probably
alternative methods of achieving the desired functions (analytics, malware
scanning) that they’re serving.
