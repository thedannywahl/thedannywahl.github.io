---
title: The Plugin Statistic that Matters
published_at: 2016-04-23T16:38:32.000Z
modified_at: 2016-04-23T16:38:32.000Z
snippet: Wordpress marketplace provides lots of tracking metrics, but what's important?
tags: Wordpress, Revops
authors: Danny Wahl
---

<article role="main" class="post tag-wordpress">
<div class="text">
<div class="kg-card-markdown"><p>I've written only one <a href="http://wordpress.org/">WordPress</a> plugin that was generic enough to be released in the plugins repository.  That plugin is called &quot;<a href="https://wordpress.org/plugins/my-posts/">My Posts</a>&quot; and it trivially solves a problem that was rather significant in one of my projects.  I say it trivially solves it because the entire plugin is comprised of only 11 lines of code (and funnily enough 10 lines of documentation, 9 lines of versioning, and 11 lines of license information).  Anyways, I've <a href="../my-posts-wordpress-plugin/">written about this plugin</a> previously, today I want to talk about statistics.</p>

<h2 id="whatmakesapluginpopular">What Makes a Plugin &quot;popular&quot;?</h2>
<p>I'm sure that every developer has a different metric for what success is when they release something.  For some it's the fact that the project is complete, for others it's hearing that it's useful, for others it's download statistics, and for others still perhaps it's doors that are opened as a result.</p>
<p>These are all great things, and I wouldn't necessarily advocate one over the other.  However, marketplaces tend to favor one particular statistic over all others: total downloads.  While other statistics are often leveraged (user ratings, active installs, etc...) this one is generally given priority treatment.  If you need evidence of this look no further than <a href="http://themeforest.net/page/top_sellers">Themeforest</a>, the <a href="https://moodle.org/plugins/stats.php">Moodle plugins directory</a> <em>(click &quot;log in as Guest&quot; if prompted for authentication)</em>, or the <a href="https://wordpress.org/plugins/browse/popular/">WordPress Plugins</a> page.  In fact, even if a market doesn't have a &quot;top downloads&quot; list you can bet that the total downloads for a product will be listed somewhere.</p>
<p>In fact, Google Play seems to be about one of the only markets that doesn't just rely on a download count, but instead takes a <a href="http://getappcase.com/blog/app-stores/how-does-google-play-rank-mobile-apps">holistic approach</a> for ranking a &quot;top&quot; app.  I realize, of course, that this isn't feasible (or practical)  for all applications.  Various markets try to offset this by a variety of methods including things like &quot;top downloads by [day|week|month]&quot; to give some insight into trends or a &quot;featured&quot; selection - essentially showcasing a product that is really good at what it advertises but isn't necessarily downloaded a lot.  Of course the end-goal of a &quot;featured&quot; list is to get that product downloaded a lot so that it appears in the &quot;top&quot; list.</p>
<h2 id="introducingactivepercentage">Introducing &quot;Active Percentage&quot;</h2>
<p>Now, I'm not going to advocate that total downloads is a <em>bad</em> metric in itself, but I'm going to suggest one that I think is a <em>better</em> metric for both developers and markets.  That metric is &quot;active percentage&quot;.  Now, there are lies, damn lies, and statistics, so take this with a grain of salt.  Here's the formula I'm advocating:</p>
<pre><code>AP == Active Installs / Total Downloads
</code></pre>
<p>This essentially tells you &quot;of the people that know of or tried your product, how many are actively using it&quot;.  Now this isn't possible for a number of projects, but it <em>is</em> possible for some including WordPress and Moodle.</p>
<h2 id="activepercentageexamples">Active Percentage Examples</h2>
<p>Let's take a look at a few examples, starting with my &quot;My Posts&quot; plugin:  as of writing the plugin has 317 downloads, which is not a lot (in my opinion) and it has 60+ Active Installs.</p>
<h3 id="myposts"><a href="https://wordpress.org/plugins/my-posts/stats/">My Posts</a></h3>
<pre><code>AP == Active Installs / Total Downloads
AP == 60 / 317
AP == 18.93%
</code></pre>
<p>18.9% of people who download my plugin actively use it.  Now, again, to me that's not a very high percentage.  That's a greater than 80% abandonment rate.  But, and this is big, we have no idea how that stacks up in the marketplace.  Maybe 18 is pretty high, maybe it's abysmally low.  Let's take a look at some of the other popular plugins in the WordPress plugins directory.  Now, there's one flaw here and that is that the plugins directory only reports up to 1 million+ active installs, so anything with over a million active installs (say 2 million or 10 million) is unreported so we are limited to looking at popular plugins with less than a million active installs.  We're also going to ignore the <code>+</code> which could significantly throw of some statistics (999,999 is reported as 900,000+ deviating by practically 10%).</p>
<h3 id="pagebuilderbysiteorigin"><a href="https://wordpress.org/plugins/siteorigin-panels/stats/">Page Builder by SiteOrigin</a></h3>
<pre><code>AP == 900,000 / 3,963,901
AP == 22.70%
</code></pre>
<h3 id="disablecomments"><a href="https://wordpress.org/plugins/disable-comments/stats/">Disable Comments</a></h3>
<pre><code>AP == 800,000 / 2,559,729
AP == 31.25%
</code></pre>
<h3 id="wpmultibytepatch"><a href="https://wordpress.org/plugins/wp-multibyte-patch/stats/">WP Multibyte Patch</a></h3>
<pre><code>AP == 800,000 / 2,184,427
AP == 36.62%
</code></pre>

### [Black Studio TinyMCE Widget](https://wordpress.com/plugins/black-studio-tinymce-widget/stats)

<pre><code>AP == 800,000 / 2,949,696
AP == 27.12%
</code></pre>
<h3 id="googleanalyticsdashboardforwp"><a href="https://wordpress.org/plugins/google-analytics-dashboard-for-wp/stats/">Google Analytics Dashboard for WP</a></h3>
<pre><code>AP == 800,000 / 5,133,130
AP == 15.59%
</code></pre>
<p>Those are the top 5 listed popular plugins with less than a million active installs, now let's look at the bottom 5.</p>
<h3 id="checkemail"><a href="https://wordpress.org/plugins/check-email/stats/">Check Email</a></h3>
<pre><code>AP == 10,000 / 58,813
AP == 17.00%
</code></pre>
<h3 id="newuserapprove"><a href="https://wordpress.org/plugins/new-user-approve/">New User Approve</a></h3>
<pre><code>AP == 10,000 / 155,479
AP == 06.43%
</code></pre>
<h3 id="wordpressrecaptchaintegration"><a href="https://wordpress.org/plugins/wp-recaptcha-integration/stats/">WordPress ReCaptcha Integration</a></h3>
<pre><code>AP == 10,000 / 59,765
AP == 16.73%
</code></pre>
<h3 id="wpsocialsharing"><a href="https://wordpress.org/plugins/wp-social-sharing/">WP Social Sharing</a></h3>
<pre><code>AP == 10,000 / 73,171
AP == 13.67%
</code></pre>
<h3 id="latesttweetswidget"><a href="https://wordpress.org/plugins/latest-tweets-widget/stats/">Latest Tweets Widget</a></h3>
<pre><code>AP == 10,000 / 92,484
AP == 10.81%
</code></pre>
<p>Now let's get an average for top WordPress plugins: <code>19.79%</code> is the average of those 10 plugins.  I think it's reasonable to say that if your WP plugins has an Active Percentage of 20% then you're in-line with the top plugins.  Now, there's not necessarily a correlation between these two, but let's grab 10 random plugins and evaluate those.  We're going to grab the first plugin from the approximate top 10 results of the &quot;<a href="https://wordpress.org/plugins/tags/">popular tags</a>&quot; word cloud that aren't listed above.  We're going to rely on the generation of the word cloud and my inability to distinguish font-size to provide us some randomness.  The tag being popular doesn't indicate that the plugin itself will be, it just means that there are a lot of plugins in that category.</p>
<h3 id="widgetwrangler"><a href="https://wordpress.org/plugins/widget-wrangler/stats/">Widget Wrangler</a></h3>
<pre><code>AP == 1,000 / 33,807
AP == 02.96%
</code></pre>
<h3 id="wordpressshortcodes"><a href="https://wordpress.org/plugins/synved-shortcodes/stats/">WordPress Shortcodes</a></h3>
<pre><code>AP == 10,000 / 248,318
AP == 04.03%
</code></pre>
<h3 id="emailitfreesharingbuttons"><a href="https://wordpress.org/plugins/e-mailit/stats/">E-MAILiT Free Sharing Buttons</a></h3>
<pre><code>AP == 9,000 / 281,095
AP == 03.20%
</code></pre>
<h3 id="wpsso"><a href="https://wordpress.org/plugins/wpsso/stats/">WPSSO</a></h3>
<pre><code>AP == 10,000 / 1,472,313
AP == 00.68%
</code></pre>
<h3 id="mailpress"><a href="https://wordpress.org/plugins/mailpress/stats/">MailPress</a></h3>
<pre><code>AP == 9,000 / 310,781
AP == 02.90%
</code></pre>
<h3 id="customizewoocommerceshop"><a href="https://wordpress.org/plugins/customize-woocommerce-shop/stats/">Customize Woocommerce Shop</a></h3>
<pre><code>AP == 60 / 368
AP == 16.30%
</code></pre>
<h3 id="socialmediafeather"><a href="https://wordpress.org/plugins/social-media-feather/stats/">Social Media Feather</a></h3>
<pre><code>AP == 100,000 / 1,057,726
AP == 09.45%
</code></pre>
<h3 id="simplegooglenewsde"><a href="https://wordpress.org/plugins/simple-google-news-de/stats/">Simple Google News DE</a></h3>
<pre><code>AP == 500 / 2,009
AP == 24.89%
</code></pre>
<h3 id="sliderseo"><a href="https://wordpress.org/plugins/slider-seo/stats/">Slider SEO</a></h3>
<pre><code>AP == 10 / 131
AP == 07.63%
</code></pre>
<h3 id="wpaccessibilityhelperwah"><a href="https://wordpress.org/plugins/wp-accessibility-helper/stats/">WP Accessibility Helper (WAH)</a></h3>
<pre><code>AP == 10 / 77
AP == 12.99%
</code></pre>
<p>Now the average of these 10 random plugins: <code>8.50%</code> which is significantly lower than the top downloaded plugins.  There are a number of things that can cause this (like bias toward top plugins) but I think it's safe to say that if your plugin is performing around 8% AP then you're a run-of-the-mill plugin.</p>
<h2 id="conclusion">Conclusion</h2>
<p>So what can we do with this?  Obviously I'm not advocating abandoning total downloads in favor of this- especially if your revenue comes from downloads!  What I'm suggesting is that this metric can be added to your toolbox to help give you an overview of how your plugin is performing.  Total downloads per day is great, but add in a second graph of AP-per-day and you can get a view of if your total market is growing or shrinking.  See if you're trending toward 20% or toward 8%.</p>
<p>Abandonment is a key metric for a lot of recurring revenue markets like SaaS, subscriptions, or even ad-based generation.  Abandonment might affect your bottom line in download-based revenue as well.  Think of it this way: which plugin that does &quot;X&quot; is someone likely to recommend?  The one they're <em>using</em>, not the one they <em>used</em>.</p>
</div>
</div>
</article>
