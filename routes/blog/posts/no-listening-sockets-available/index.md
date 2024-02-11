---
title: No Listening Sockets Available
published_at: 2011-11-03T15:37:37.000Z
modified_at: 
snippet: 
tags: 
authors: Danny Wahl
---

I’ve been trying to hunt down some sigterm and oom errors thrown by [Apache 2](http://httpd.apache.org/) lately and in the process I decided to have it log in its default location /var/log/ and on my desktop. Amid an array of other things I’d been doing at some point I created the log like this:

```bash
touch ~/Desktop/apache.error.log
chmod 777 ~/Desktop/apache.error.log
```

Then went back to work. Several hours later when I went to restart Apache it wouldn’t work, and I got this deceiving message:

```bash
no listening sockets available, shutting down
Unable to open logs
Only one usage of each socket address (protocol/network address/port) is normally permitted.
make_sock: could not bind to address 0.0.0.0:80
```

So after trying some things I decided I’d try to reboot. When the machine came back up Apache was ‘running’ meaning it was an active task, but the httpd wasn’t actually working. Oh, and there was only one thread (I’m using mpm-prefork) and it was consuming 97% of the cpu. Tried restarting Apache, same error as above. So I begrudgingly went back and undid a couple hours of tuning to try and fix Apache to no avail. Finally in one last desperate command I fixed it:

```bash
chown www-data:www-data ~/Desktop/apache.error.log
```

Immediately Apache started spinning up threads, the cpu use went down, and it started logging away. I was baffled, I had assumed since the log was completely public (777) that surely couldn’t have been the root of the ‘Unable to open logs’ error. Well, it was, doesn’t make much sense to me, but now it’s back to re-undoing my Apache tuning.