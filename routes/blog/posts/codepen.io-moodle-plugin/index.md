---
title: CodePen.io Moodle Plugin
published_at: 2014-02-13T20:44:33.000Z
modified_at: 2015-01-18T05:36:52.000Z
snippet: 
tags: Moodle
authors: Danny Wahl
---

Syntax highlighting is hard. So is porting a syntax highlighter from platform to platform. So I thought, “Why not be lazy?” Bam. Introducing the [CodePen.io](http://codepen.io/) Moodle Text Filter – for the lazy man (or woman). This plugin converts any Pen URL into an embed of that Pen.

Here’s a brief overview of what we’re talking about. Put some text into the ol’ text editor, and if it contains a link to a Pen (i.e. /pen/) the filter will embed the Pen.

![codepentexteditor](/blog/codepen.io-moodle-plugin/1.png)

Notice that in the above image the first two lines are both a Pen URL, but look at the output:

![renderedpen](/blog/codepen.io-moodle-plugin/2.png)

Only the first one was embedded. That’s because a _link_ to a pen is escaped by the filter. The third line wasn’t converted because it isn’t a link to a Pen, it is a link to the details page. The fourth line wasn’t converted because, I don’t really have to explain it do I? What kind of terrible online course is this anyways?

For any users that have JavaScript disabled… stop it! I mean, we provide a nice fall back:

![dudejustturnonJS](/blog/codepen.io-moodle-plugin/3.png)

So that they can click the link to the Pen… and CodePen.io will tell them they need JavaScript to view it. Hooray!

Well, that’s about it. One final note, if you have the “Convert URLS to links and images” enabled on your Moodle you’ll need to prioritize the CodePen filter otherwise they’ll all be escaped and I’ll get angry comments about our plugin being broken.

![fixurfilters](/blog/codepen.io-moodle-plugin/4.png)

Also, consider getting a Pro plan at CodePen – I did, and I use it daily in my classroom. It’s awesome. We even have a “Fun = CodePen + Codecademy + Moodle;” post coming soon on using those tools to teach HTML JavaScript.

Go [grab the filter](https://moodle.org/plugins/view.php?plugin=filter_codepen) from the Moodle Plugins Directory.