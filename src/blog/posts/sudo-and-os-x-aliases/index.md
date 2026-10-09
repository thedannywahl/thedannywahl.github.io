---
title: sudo and OS X aliases
published_at: 2011-01-25T22:14:44.000Z
modified_at: 
snippet: 
tags: 
authors: Danny Wahl
---

I spend a lot of time in the shell on Ubuntu – and in Gnome one of the basic
features that I rely on is the right click “Open as Administrator” which will
prompt for administrator privileges and then open the file with the default
application. Unfortunately, this feature is missing from OS X is a severe way.

There’s not much you can do about this from the GUI – but on Ubuntu standard
editors are integrated into terminal with a simple syntax.

```bash
sudo gedit /etc/someprogram/conf.conf
```

This will prompt for sudo authentication and then initiate a new instance of
[gEdit](http://projects.gnome.org/gedit/) and the terminal thread will wait
until the file is saved before exiting. This is extremely useful, but try it on
a Mac and you’ll see this:

```bash
-bash: gedit: command not found
```

Less useful. Well here’s how to integrate gedit (or any other program really)
into your shell on OS X. The magic is all in terminal aliases.

```bash
vi ~/.profile
```

The first thing you’ll see is your $PATH variable defined, and possibly some
aliases. We’re going to be adding some more aliases. Here’s a few text editors
([Fraise](http://www.fraiseapp.com/), [gEdit](http://projects.gnome.org/gedit/),
and [Kod](http://kodapp.com/)):

```bash
# aliases
alias fraise="/Applications/Fraise.app/Contents/MacOS/Fraise"
alias gedit="/Applications/gedit.app/Contents/MacOS/gedit"
alias kod="/Applications/Kod.app/Contents/MacOS/Kod"
```

ta-da you can now launch programs from terminal. But! try adding sudo and we’re
right back to the “command not found”. The reason for that is that the first
thing that happens after you type sudo is your command is actually passed to the
super user shell – which doesn’t have your aliases in it. So you need to add one
more line alias at the end:

```bash
alias sudo='sudo '
```

And we’re done, you can now sudo and edit files through terminal on OS X just
like basically every other operating system that’s been available in this
century. Seriously Apple, when is Finder going to get some usability
improvements?
