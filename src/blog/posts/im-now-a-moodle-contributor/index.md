---
title: I'm now a Moodle Contributor!
published_at: 2013-01-19T09:54:06.000Z
modified_at: 
snippet: 
tags: Moodle
authors: Danny Wahl
---

I’ve [reported](https://tracker.moodle.org/issues/?jql=reporter%20in%20%28dwahl%29) a lot of bugs (some bogus, some good) for Moodle and [participated](https://tracker.moodle.org/issues/?jql=Participants%20in%20%28dwahl%29) in several more over the last few years, but up until now that’s been the limit of my efforts.

Well that’s all changed now! Introducing [MDL-23504](https://tracker.moodle.org/browse/MDL-23504): “Transparency and RGB support to colour picker” and [MDL-36991](https://tracker.moodle.org/browse/MDL-36991): “Conditional activity restrictions should be displayed as a list”.

The first was an older reported bug that I discovered when integrating the colourpicker setting into Zebra. Not only did I add `transparent` support but a few others like: `currentColor`, `inherit`, `rgb()`, `rgba()`, `hsl()`, and `hsla()`. The second was an enhancement request that I filed and with guidance from Moodle HQ was able to successfully implement.

So what did I learn? A lot about Moodle APIs and functions to start, but I also learned a lot about the development cycle, the need for coding style, and gained a new found appreciation for the real Moodle devs.

I’d also like to specifically thank the following people (in no particular order) for their help in closing these bugs: [Mauno Korpelainen](https://moodle.org/user/view.php?id=9523&course=5), [Mary Evans](https://moodle.org/user/view.php?id=713800&course=5), [Dan Poltawski](http://www.linkedin.com/in/danpoltawski), [Rossiani Wijaya](http://www.linkedin.com/pub/rossiani-wijaya/6/865/b29), [Michael de Raadt](https://moodle.org/user/profile.php?id=381842), [Nicolas Connault](http://www.linkedin.com/pub/nicolas-connault/7/32a/837), [Sam Marshall](https://moodle.org/user/view.php?id=93817&course=5), [David Mudrák](https://moodle.org/user/view.php?id=1601&course=5), [Mark Nelson](https://moodle.org/user/profile.php?id=1057750), [Rajesh Taneja](https://moodle.org/user/view.php?id=1328988&course=5), [Sam Hemelryk](https://moodle.org/user/profile.php?id=865279). How’s that for community?!