---
title: Don't use .dev for Development
published_at: 2015-01-27T02:39:52.000Z
modified_at: 
snippet: 
tags: 
authors: Danny Wahl
---

A while back I wrote about setting up [DNSMasq](http://www.thekelleys.org.uk/dnsmasq/doc.html) for your local development using the `.localhost` [TLD](http://en.wikipedia.org/wiki/Top-level_domain). Unfortunately during my research I came across a lot of people advocating setup using the hypothetical `.dev` domain under the guise of "DevOps". I hate to say it but this is a bad idea, so consider this post a public service announcement.

## Generic TLDs

In the beginning there was `.com` and it was good. In 1984 the IETF released [RFC-920](http://tools.ietf.org/html/rfc920) which specified a list of generic top level domains including:

*   `.gov`
*   `.edu`
*   `.com`
*   `.mil`
*   `.org`
*   `.net` (added later)

in addition to country code TLDs. We're probably all familiar with these as they have been the primary domains since then, and upto even a few years ago it would have been safe to mess around with other top-level domains on your local DNS or intranet. But the issue now is that the IANA has started registering [more and more](https://www.iana.org/domains/root/db) TLDs.

Do you remember how pissed you were (or your sysadmin was) when your intranet was set to the same domain as your company website and no one could reach the website because your AD server was serving an IIS error page? I do. Everyone that's advocating using `.dev` is potentially doing the same thing.

## New hotness: .whatever

According to [gTLD.com](http://www.gtld.com/):

> The release of more than 1,000 new gTLDs (generic Top Level Domains) is the biggest shake-up since the internet began.

> Dot place, dot trend, dot industry, dot meme – dot allsorts. They’re up for grabs.

You read that right, we went from a list of 6 TLDs to over 1,000 \[vegeta-its-over-1000.gif\]! Why?

> One of ICANN's key commitments is to promote competition in the domain name market

[Money](http://newgtlds.icann.org/en/applicants/customer-service/faqs/faqs-en), duh.

## Don't Do What Donny Dev Does

Ok, that's all well and good but what about `.dev`? Turns out it's [already available](https://www.iana.org/domains/root/db/dev.html) as a TLD. Oops. Oh, look, it's administered by Google too- so you know it's super serious. Now, I want you go to back to a DNSmasq article where the author advocates routing all `.dev` traffic to `127.0.0.1` and replace `.dev` with `.com` and then tell me how smart of an idea it is. Awesome DevOps d00d!

## Reserved Top Level Domain Names

Now that I've dumped all over DNS hacking it's only fair that I suggest an alternative. The answer is simple: [RFC-2606](http://tools.ietf.org/html/rfc2606). You see after the IETF released the list of Generic TLDs they released a list of Reserved TLDs. Reserved meaning that they will never be valid TLDs in a global DNS sense. This is similar to how `192.xxx.xxx.xxx` and `10.xxx.xxx.xxx` are reserved IP ranges.

The list of Reserved TLDs contains 4 different domains specifically for "Testing & Documentation Examples":

*   `.test`
*   `.example`
*   `.invalid`
*   `.localhost`

A subsection of the document also declares reserved second-level addresses:

*   `example.com`
*   `example.net`
*   `example.org`

so feel free to continue to use `nobody@example.com` for instructions for users.

## Using Reserved TLDs

RFC-2606 goes on to describe recommended usage cases for the four reserved TLDs but they're pretty vague, saying things like:

> ".invalid" is intended for use in online construction of domain names that are sure to be invalid and which it is obvious at a glance are invalid.

In order to clarify when and how these Reserved TLDs should be used another specification was released, [RFC-6761](http://tools.ietf.org/html/rfc6761): Special-Use Domain Names. This document clarifies how a Reserved TLD should be used and how it should be handled by DNS servers. This document specifies seven categories of use:

1.  users
2.  applications
3.  APIs & libraries
4.  DNS cache servers
5.  Authoratative DNS servers
6.  DNS server operators
7.  DNS registries/registrars

Probably as a developer you only care about the first 4, and maybe number 5, essentially, how does your local network handle these domains? Go read the specification and the outline for each Reserved TLD.

## Recommended Setup

Now I'll outline my recommendation to you for using the Reserved TLDs. There's a bit of wiggle room in here, by design of the RFCs.

### .localhost TLD

I recommend (as does RFC-6761) that you use `.localhost` to only look at your local loopback address: `127.0.0.1`. The specification explicitly states that APIs and libraries _should_ point at the loopback address already, so if you were to try to point it anywhere else you might end up with unexpected results. In addition everyone knows that `localhost === 127.0.0.1` so from a people perspective, this just makes sense.

### .invalid TLD

This is just my personal recommendation, but it is acceptable according to the specification. Your local DNS cache server should be configured to point `.invalid` domains back to development machines. This should NOT be configured on a client machine. If you're using static IPs or DHCP reservations (better, IMO) then you can easily set this up.

The reason for this is that you can serve the same site (hopefully) from `.localhost` or `.invalid`. If you have a cool new feature that you want to show someone or want someone to play with then they can view it- but they know that it requires your dev machine to be up and running. This is great for face-to-face development. Here's an example:

I spend a while working on `dannywahlmbp.localhost/widget` and I want some feedback. I send a coworker a link to `dannywahlmbp.invalid/widget` and we can sit down and check it out together. If I shut my laptop- it's gone. This isn't necessarily obvious in the naming but it can be documented.

### .test & .example TLDs

You could decide to use either of these interchangably but I recommend using `.test` first. My recommendation is that `.test` is where you move code to be tested- this is the first step toward production. So my code base would be moved off of my development machine and onto a server that's accessible by all machines on our local network 24/7. Maybe you start running code coverage here- maybe it's even an upstream repository. Of course you'll need to configure your local DNS server.

The final step is to use `.example`. My recommendation is that you use this for code that's nearly ready to go live. You could also use this to tie together multiple locations and even use an internet-facing IP address, knowing that it's not going to be resolved by global DNS servers.

After that you're ready to go live with trusty ol' `.com`. Hacking on domains and DNS can be fun and a lot of people have built some really cool tools- but it's important that you use them appropriately too. Once `.dev` domains start becoming prevalent I imagine that there will be a few people kicking themselves for mapping it to their local machine, but hey, that's part of learning!