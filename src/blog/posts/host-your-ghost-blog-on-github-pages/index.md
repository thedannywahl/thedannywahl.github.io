---
title: Host Your Ghost Blog on Github Pages
published_at: 2015-02-04T05:41:23.000Z
modified_at: 
snippet: 
tags: Ghost, Github
authors: Danny Wahl
---

I've written a little bit about this before but this site is currently created using a local copy of [Ghost](https://tryghost.org/) and then converted to a static HTML site and deployed to GitHub pages. This post will overview how I do that.

First I'd like to say that I am aware of, and initially used, the tool [Buster](https://github.com/axitkhurana/buster) (get it, Ghost Buster), it's a fine little utility that basically functions as a fancy `wget` wrapper, but it has some [issues](https://github.com/axitkhurana/buster/issues/). Issues that were preventing this site from being fully functional. In the author's defense- some of it may have actually been caused by [homebrew](http://brew.sh/)'s wget. So I decided to investigate an alternative toolset.

## Initialize Your Git Repository

I'll go over how to deploy to a user (or organization) page on [Github Pages](https://help.github.com/articles/user-organization-and-project-pages/). If you need to do it for a project, just replace the user steps with the steps necessary for your repo, but generally it's just using the `gh-pages` branch instead of `master`.

*   `./hts-cache/`
*   `./hts-log.txt`
*   `./localhost_2368/`

with `./localhost_2368/` containing your static site. So you'll need to initialize your git repository there. I have mine in `~/Sites/htdocs/iyware.com/localhost_2368/`

```bash
mkdir ~/Sites/htdocs/iyware.com/localhost_2368/
cd ~/Sites/htdocs/iyware.com/localhost_2368/
git init
git checkout -b master
git remote add origin git@github.com:[USER NAME]/[USER NAME].github.io.git
```

A few notes here:

1.  Replace `[USER NAME]` with your user name, or organization name.
2.  Replace `-b master` with `-b gh-pages` if this is a project page.
3.  You don't have to use the SSH repository path, you can use HTTPS but you'll be prompted to authenticate every time you update your site. If you don't have [SSH configured](https://help.github.com/articles/generating-ssh-keys/), I strongly suggest you do it.
4.  If you have things in your repository you might want to `git fetch` and `git merge` them- but you probably don't. Even if you blow them away locally, they'll still be in your commit history.

Initializing your Git repository is obviously a one time task.

## Generate Your Initial Static Site

```bash
httrack http://localhost:2368/ -O /PATH/TO/OUTPUT/FOLDER/ -c128 -I0 -#p "+sitemap*"
```

Let's break this command down a little bit. The first parameter is the path to the site you want to crawl, e.g. your ghost blog. The second parameter `-O` is the path to the output folder. You'll obviously need to replace `/PATH/TO/OUTPUT/FOLDER/` with your actual path (NOT the `localhost_2368` folder but it's parent. Mine is `/Users/dannywahl/Sites/htdocs/iyware.com/`. `-c128` means that we scrape with a rate of 128 simulatneous connections. `-I0` tells httrack not to make a custom file for the output and `-#p` is detailed output (verbose).

The `"+sitemap*"` tells httrack to explicitly to grab any links to a sitemap. Ghost automatically generates a sitemap, but it uses `@blog.url` to populate them so httrack will not scrape them by default- so we need add this command. This might be dangerous if your blog content contains a lot of links to other sites' sitemaps. You might consider changing it to your Ghost blog url, e.g. `"+https://iyware.com/sitemap*"` to only grab your site's sitemap.

If it all goes right you'll see the progress of your site scrape in the terminal output like this:

mirroring http://localhost:2368/ +/sitemap\* with the wizard help.. ...

Now you should have a fully viewable static site in `/localhost_2368/` that is ready to deploy to GitHub Pages.

## Deploy to GitHub Pages

In terminal navigate back to the `/localhost_2368/` directory and commit at push your changes to GitHub:

```bash
git add .
git commit -m "Blog updated"
git push -u origin master
```

Now you should be able to visit your GitHub page and see the static version of your site.

### Update Your Static Site

The next time you update your Ghost blog and you need to update your static site navigate to the folder containing `/localhost_2368/` and run this command:

```bash
httrack -iC2
```

This command updates your site and reuses your cache, you don't need to do a full re-scrape. It will delete items that are remotely deleted, update changed assets, and it will add new files. Then push to GitHub again.

### Wrap it in a Shell Script

After the initial static site is created and the git repository is created it's quite a simple and repetitive task to update and deploy, so you can stick it all in a simple shell script like this:

```bash
# working path
cd /Users/dannywahl/Sites/htdocs/iyware.com/

# update
httrack -iC2

# replace favicon
mv favicon.ico localhost_2368/favicon.ico

# deploy
cd /Users/dannywahl/Sites/htdocs/iyware.com/localhost_2368/

current_time=$(date -u +"%Y-%m-%d %T")
git add .
git commit -m "Blog update at $current_time"
git push -u origin master
echo "Deployed to github"
```

I have that saved as a utility called `bustit` so now I can simply type `bustit` in terminal to deploy my updated blog.

It's not nearly as robust as `buster` but it very easily could be- it's the same wrapper for a site downloader and a git interface, I just didn't make it modular or extensible, maybe I will in the future.

## Extras

If you're not happy with the look of your sitemaps it's because `sitemap.xsl` is missing- you'll need to visit `http://localhost:2368/sitemap.xsl` and save that to the static site root (next to `sitemap.xml`). I can't figure out how to get httrack (or buster) to download this- but you only need to do that the first time. This file is not necessary.

If you're used to using `buster` it automatically adds a `README` file to your site. You'll need to create that manually if you want it. Same for `CNAME` and `robots.txt`.

Well that's all there is to it. Create an initial static copy, update that copy when you update Ghost, and push to github. Maybe in the future I'll rewrite this as a robust application because I think it would be cool to integrate it with AppleScript Folder Actions so that whenever the Ghost sqlite database is updated this triggers, but for now this works just fine.