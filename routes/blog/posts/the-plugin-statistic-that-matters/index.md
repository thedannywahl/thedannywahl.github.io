---
title: The Plugin Statistic that Matters
published_at: 2016-04-23T16:38:32.000Z
modified_at: 2016-04-23T16:38:32.000Z
snippet: Wordpress marketplace provides lots of tracking metrics, but what's important?
tags: Wordpress, Revops
authors: Danny Wahl
---

I've written only one [WordPress](http://wordpress.org/) plugin that was generic
enough to be released in the plugins repository. That plugin is called
"[My Posts](https://wordpress.org/plugins/my-posts/)" and it trivially solves a
problem that was rather significant in one of my projects. I say it trivially
solves it because the entire plugin is comprised of only 11 lines of code (and
funnily enough 10 lines of documentation, 9 lines of versioning, and 11 lines of
license information). Anyways, I've
[written about this plugin](/blog/my-posts-wordpress-plugin/) previously, today
I want to talk about statistics.

## What Makes a Plugin "popular"?

I'm sure that every developer has a different metric for what success is when
they release something. For some it's the fact that the project is complete, for
others it's hearing that it's useful, for others it's download statistics, and
for others still perhaps it's doors that are opened as a result.

These are all great things, and I wouldn't necessarily advocate one over the
other. However, marketplaces tend to favor one particular statistic over all
others: total downloads. While other statistics are often leveraged (user
ratings, active installs, etc...) this one is generally given priority
treatment. If you need evidence of this look no further than
[Themeforest](http://themeforest.net/page/top_sellers), the
[Moodle plugins directory](https://moodle.org/plugins/stats.php) _(click "log in
as Guest" if prompted for authentication)_, or the
[WordPress Plugins](https://wordpress.org/plugins/browse/popular/) page. In
fact, even if a market doesn't have a "top downloads" list you can bet that the
total downloads for a product will be listed somewhere.

In fact, Google Play seems to be about one of the only markets that doesn't just
rely on a download count, but instead takes a
[holistic approach](http://getappcase.com/blog/app-stores/how-does-google-play-rank-mobile-apps)
for ranking a "top" app. I realize, of course, that this isn't feasible (or
practical) for all applications. Various markets try to offset this by a variety
of methods including things like "top downloads by \[day|week|month\]" to give
some insight into trends or a "featured" selection - essentially showcasing a
product that is really good at what it advertises but isn't necessarily
downloaded a lot. Of course the end-goal of a "featured" list is to get that
product downloaded a lot so that it appears in the "top" list.

## Introducing "Active Percentage"

Now, I'm not going to advocate that total downloads is a _bad_ metric in itself,
but I'm going to suggest one that I think is a _better_ metric for both
developers and markets. That metric is "active percentage". Now, there are lies,
damn lies, and statistics, so take this with a grain of salt. Here's the formula
I'm advocating:

```
AP == Active Installs / Total Downloads
```

This essentially tells you "of the people that know of or tried your product,
how many are actively using it". Now this isn't possible for a number of
projects, but it _is_ possible for some including WordPress and Moodle.

## Active Percentage Examples

Let's take a look at a few examples, starting with my "My Posts" plugin: as of
writing the plugin has 317 downloads, which is not a lot (in my opinion) and it
has 60+ Active Installs.

### [My Posts](https://wordpress.org/plugins/my-posts/stats/)

```
AP == Active Installs / Total Downloads
AP == 60 / 317
AP == 18.93%
```

18.9% of people who download my plugin actively use it. Now, again, to me that's
not a very high percentage. That's a greater than 80% abandonment rate. But, and
this is big, we have no idea how that stacks up in the marketplace. Maybe 18 is
pretty high, maybe it's abysmally low. Let's take a look at some of the other
popular plugins in the WordPress plugins directory. Now, there's one flaw here
and that is that the plugins directory only reports up to 1 million+ active
installs, so anything with over a million active installs (say 2 million or 10
million) is unreported so we are limited to looking at popular plugins with less
than a million active installs. We're also going to ignore the `+` which could
significantly throw of some statistics (999,999 is reported as 900,000+
deviating by practically 10%).

### [Page Builder by SiteOrigin](https://wordpress.org/plugins/siteorigin-panels/stats/)

```
AP == 900,000 / 3,963,901
AP == 22.70%
```

### [Disable Comments](https://wordpress.org/plugins/disable-comments/stats/)

```
AP == 800,000 / 2,559,729
AP == 31.25%
```

### [WP Multibyte Patch](https://wordpress.org/plugins/wp-multibyte-patch/stats/)

```
AP == 800,000 / 2,184,427
AP == 36.62%
```

### [Black Studio TinyMCE Widget](https://wordpress.org/plugins/black-studio-tinymce-widget/stats/)

```
AP == 800,000 / 2,949,696
AP == 27.12%
```

### [Google Analytics Dashboard for WP](https://wordpress.org/plugins/google-analytics-dashboard-for-wp/stats/)

```
AP == 800,000 / 5,133,130
AP == 15.59%
```

Those are the top 5 listed popular plugins with less than a million active
installs, now let's look at the bottom 5.

### [Check Email](https://wordpress.org/plugins/check-email/stats/)

```
AP == 10,000 / 58,813
AP == 17.00%
```

### [New User Approve](https://wordpress.org/plugins/new-user-approve/)

```
AP == 10,000 / 155,479
AP == 06.43%
```

### [WordPress ReCaptcha Integration](https://wordpress.org/plugins/wp-recaptcha-integration/stats/)

```
AP == 10,000 / 59,765
AP == 16.73%
```

### [WP Social Sharing](https://wordpress.org/plugins/wp-social-sharing/)

```
AP == 10,000 / 73,171
AP == 13.67%
```

### [Latest Tweets Widget](https://wordpress.org/plugins/latest-tweets-widget/stats/)

```
AP == 10,000 / 92,484
AP == 10.81%
```

Now let's get an average for top WordPress plugins: `19.79%` is the average of
those 10 plugins. I think it's reasonable to say that if your WP plugins has an
Active Percentage of 20% then you're in-line with the top plugins. Now, there's
not necessarily a correlation between these two, but let's grab 10 random
plugins and evaluate those. We're going to grab the first plugin from the
approximate top 10 results of the
"[popular tags](https://wordpress.org/plugins/tags/)" word cloud that aren't
listed above. We're going to rely on the generation of the word cloud and my
inability to distinguish font-size to provide us some randomness. The tag being
popular doesn't indicate that the plugin itself will be, it just means that
there are a lot of plugins in that category.

### [Widget Wrangler](https://wordpress.org/plugins/widget-wrangler/stats/)

```
AP == 1,000 / 33,807
AP == 02.96%
```

### [WordPress Shortcodes](https://wordpress.org/plugins/synved-shortcodes/stats/)

```
AP == 10,000 / 248,318
AP == 04.03%
```

### [E-MAILiT Free Sharing Buttons](https://wordpress.org/plugins/e-mailit/stats/)

```
AP == 9,000 / 281,095
AP == 03.20%
```

### [WPSSO](https://wordpress.org/plugins/wpsso/stats/)

```
AP == 10,000 / 1,472,313
AP == 00.68%
```

### [MailPress](https://wordpress.org/plugins/mailpress/stats/)

```
AP == 9,000 / 310,781
AP == 02.90%
```

### [Customize Woocommerce Shop](https://wordpress.org/plugins/customize-woocommerce-shop/stats/)

```
AP == 60 / 368
AP == 16.30%
```

### [Social Media Feather](https://wordpress.org/plugins/social-media-feather/stats/)

```
AP == 100,000 / 1,057,726
AP == 09.45%
```

### [Simple Google News DE](https://wordpress.org/plugins/simple-google-news-de/stats/)

```
AP == 500 / 2,009
AP == 24.89%
```

### [Slider SEO](https://wordpress.org/plugins/slider-seo/stats/)

```
AP == 10 / 131
AP == 07.63%
```

### [WP Accessibility Helper (WAH)](https://wordpress.org/plugins/wp-accessibility-helper/stats/)

```
AP == 10 / 77
AP == 12.99%
```

Now the average of these 10 random plugins: `8.50%` which is significantly lower
than the top downloaded plugins. There are a number of things that can cause
this (like bias toward top plugins) but I think it's safe to say that if your
plugin is performing around 8% AP then you're a run-of-the-mill plugin.

## Conclusion

So what can we do with this? Obviously I'm not advocating abandoning total
downloads in favor of this- especially if your revenue comes from downloads!
What I'm suggesting is that this metric can be added to your toolbox to help
give you an overview of how your plugin is performing. Total downloads per day
is great, but add in a second graph of AP-per-day and you can get a view of if
your total market is growing or shrinking. See if you're trending toward 20% or
toward 8%.

Abandonment is a key metric for a lot of recurring revenue markets like SaaS,
subscriptions, or even ad-based generation. Abandonment might affect your bottom
line in download-based revenue as well. Think of it this way: which plugin that
does "X" is someone likely to recommend? The one they're _using_, not the one
they _used_.
