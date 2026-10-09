---
title: Start Your Ghost Server on Login
published_at: 2015-02-03T00:39:00.000Z
modified_at: 
snippet: 
tags: Ghost
authors: Danny Wahl
---

If you follow the
[Ghost documentation](http://support.ghost.org/installing-ghost-mac/) to install
and start Ghost then you probably just open terminal, `cd` to your install
directory and type `npm start`, this leaves you with a terminal window always
opened. There's a few simple steps you can take to get node, and therefore
Ghost, running on log in on OS X.

The first is to install the NPM package
[forever](https://www.npmjs.com/package/forever-mac):

```bash
npm install forever -g
```

Next you should copy this `.plist` and save it to
`~/Library/LaunchAgents/node.forever.ghost.plist`.

```markup
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>KeepAlive</key>
	<dict>
		<key>SuccessfulExit</key>
		<false/>
	</dict>
	<key>Label</key>
	<string>node.forever.ghost</string>
	<key>ProgramArguments</key>
	<array>
		<string>/usr/local/bin/node</string>
		<string>/usr/local/bin/forever</string>
		<string>start</string>
		<string>[PATH TO GHOST]/ghost/index.js</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
</dict>
</plist>
```

replacing `[PATH TO GHOST]` with the path to your Ghost installation. Finally
load the launchAgent:

```bash
launchctl load ~/Library/LaunchAgents/node.forever.ghost.plist
```

Now you can head to your ghost URL (default `http://localhost:2368`) and start
blogging- node forever will start ghost every time you log in to your Mac.
