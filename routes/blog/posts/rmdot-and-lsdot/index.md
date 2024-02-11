---
title: rmdot and lsdot
published_at: 2011-10-28T08:26:32.000Z
modified_at: 
snippet: 
tags: 
authors: Danny Wahl
---

Remotely accessing a non-Macintosh machine from a Macintosh can really be a pain because OS X creates a hidden meta file for every file and sometimes these files are actually larger than the file itself. If you have a slow internet connection like me it can make simple things like uploading some files via FTP extremely frustrating. Of course OS X does have the hidden “[do not create .DS\_Store files on network folders](http://support.apple.com/kb/HT1629)” – helpful, but those aren’t what I’m talking about. I’m talking about the `._` files.

What finally pushed me to figure out a way to deal with these files was adding a folder of new flags to a WordPress instance for qTranslate to use. qTranslate looks at all the files in a folder and dynamically builds it’s select list with those file names. After FTPing the flag folder to the server qTranslate was listing 500+ flags instead of 250 and that’s because the meta files got copied too. So en-US.png also included `._en-US.png` and if you know your naming conventions all the `._` files showed up first.

Enter lsdot and rmdot, a couple of short shell commands to blow away those files. These scripts will work not just on OS X but on Linux too, so if you have ssh access I really recommend running the commands on the remote server after you copy files, just because I’m not really sure when OS X recreates the meta files.

```bash
#lsdot
if [ -z "$1" ]
then
  echo "usage: lsdot /path/"
  exit
fi
dot_path=$1
find $dot_path -name "._*" -exec ls {} \;
```

```bash
#rmdot
if [ -z "$1" ]
then
  echo "usage: rmdot /path/"
  exit
fi
dot_path=$1
find $dot_path -name "._*" -exec rm {} \;
```

As you can see it’s just a simple wrapper for a find command with an `-exec` switch but if you save these in your /usr/bin/ folder (on OS X at least) it’s pretty handy to just call from terminal. With lsdot I really recommend piping it because you’re going to get a LOT of results.