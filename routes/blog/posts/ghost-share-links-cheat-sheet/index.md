---
title: Ghost Share Links Cheat Sheet
published_at: 2015-03-16T12:20:12.000Z
modified_at: 
snippet: 
tags: Ghost
authors: Danny Wahl
---

In my previous post [Add Share Links to Ghost Themes](../add-share-links-to-ghost-themes/) I outlined how to create no-cost share links using the Ghost handlebars API. In this post I'll provide code snippets to some of the most popular social networks that you can simply copy and paste into your custom theme.

## Email

```handlebars
<a href="mailto:?&subject={{encode @blog.title}}%3A%20{{encode title}}&body={{encode title}}%0D%0A{{url absolute="true"}}%0D%0A%0D%0A{{excerpt words="45"}}%2E%2E%2E">
    Email
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-email-with-ghost-1.png)

## twitter

```handlebars
<a href="https://twitter.com/home?status={{url absolute="true"}}%20{{tags prefix="%23" separator="%20%23" autolink="false"}}">
    Twitter
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-twitter-with-ghost.png)

## Facebook

```handlebars
<a href="https://www.facebook.com/sharer/sharer.php?u={{url absolute="true"}}">
    Facebook
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-facebook-with-ghost-1.png)

## Google+

```handlebars
<a href="https://plus.google.com/share?url={{url absolute="true"}}">
    Google+
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-google-plus-with-ghost.png)

## LinkedIn

```handlebars
<a href="https://www.linkedin.com/shareArticle?mini=true&url={{url absolute="true"}}&title={{encode title}}&summary={{excerpt words="45"}}&source={{@blog.title}}">
    LinkedIn
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-linkedin-with-ghost.png)

## Pinterest

```handlebars
<a href="https://pinterest.com/pin/create/button/?{{url absolute="true"}}{{#if image}}&media={{@blog.url}}{{image}}{{/if}}&description={{excerpt words="20"}}">
    Pinterest
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-pinterest-with-ghost-1.png)

## tumblr

```handlebars
<a href="http://www.tumblr.com/share/link?url={{url absolute="true"}}&name={{encode title}}&description={{excerpt words="45"}}">
    Tumblr
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-tumblr-with-ghost.png)

## reddit

```handlebars
<a href="http://www.reddit.com/submit/?url={{url absolute="true"}}&title={{encode title}}">
    reddit
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-reddit-with-ghost.png)

## Xing

```handlebars
<a href="https://www.xing-share.com/app/user?op=share;sc_p=xing-share;url={{url absolute="true"}}">
    Xing
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-xing-with-ghost.png)

## VK

```handlebars
<a href="https://vk.com/share.php?url={{url absolute="true"}}&title={{encode title}}&description={{excerpt words="45"}}{{#if image}}&image={{@blog.url}}{{image}}{{/if}}&noparse=true">
    VK
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-VK-with-ghost.png)

## buffer

```handlebars
<a href="https://bufferapp.com/add/?url={{url absolute="true"}}&text={{excerpt words="20"}}">
    Buffer
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-buffer-with-ghost.png)

## StumbleUpon

```handlebars
<a href="https://www.stumbleupon.com/submit?url={{url absolute="true"}}%2F&title={{encode title}}">
    StumbleUpon
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-stumbleupon-with-ghost-2.png)

## 新浪微博 (Sina Weibo)

```handlebars
<a href="http://service.weibo.com/share/share.php?url={{url absolute="true"}}&title={{encode title}}%0D%0A{{excerpt words="20"}}%20{{tags prefix="%23" separator="%23 %23" suffix="%23" autolink="false"}}{{#if image}}&pic={{@blog.url}}{{image}}{{/if}}">
    新浪微博
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-sinaweibo-with-ghost.png)

## Baidu空间

```handlebars
<a href="http://hi.baidu.com/pub/show/share?url={{url absolute="true"}}&title={{encode title}}">
    Baidu空间
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-baidu-with-ghost.png)

## 人人网 (Renren)

```handlebars
<a href="http://share.renren.com/share/buttonshare?link={{url absolute="true"}}&title={{encode title}}">
    人人网
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-renren-with-ghost.png)

## 腾讯微博 (QQ Tencent Weibo)

```handlebars
<a href="http://v.t.qq.com/share/share.php?title={{encode title}}%3A%20{{excerpt words="20"}}%20{{tags prefix="%23" separator="%23 %23" suffix="%23" autolink="false"}}&url={{url absolute="true"}}">
    腾讯微博
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-qq-tencent-weibo-with-ghost.png)

## QQ空间

```handlebars
<a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?title={{encode title}}&url={{url absolute="true"}}&summary={{excerpt words="20"}}">
    QQ空间
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-qq-zone-with-ghost.png)

## 腾讯朋友网 (Pengyou)

```handlebars
<a href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?to=pengyou&title={{encode title}}&url={{url absolute="true"}}&summary={{excerpt words="20"}}">
    腾讯朋友网
</a>
```

![](/blog/ghost-share-links-cheat-sheet/share-to-pengyou-with-ghost.png)

And there you have it. Share links that you can copy and paste into your theme. Now if you're wondering what they look like in the wild, well here they are- maybe try clicking one and share this post yourself.