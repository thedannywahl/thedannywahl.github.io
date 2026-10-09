---
title: smbpasswd-gui
published_at: 2010-12-27T14:17:08.000Z
modified_at: 
snippet: 
tags: 
authors: Danny Wahl
---

I recently came across an application I wrote a while back in AppleScript to
slap a basic GUI on OS X terminal program smbpasswd.  This utility is basically
the BSD version of dscl found on Linux – and interfaces with Microsoft Active
Directory.  Here’s the man page as of Snow Leopard:

```bash
NAME
    smbpasswd - change a users SMB password

SYNOPSIS
    smbpasswd   [-a]   [-c ]  [-x]  [-d]  [-e]  [-D debuglevel]  [-n]  [-r ]
    [-R ] [-m] [-U username[%password]] [-h] [-s] [-w pass] [-W]  [-i]  [-L]  [user-name] [username]
    [name]

DESCRIPTION
       This tool is part of the samba(7) suite.
```

Apple has actually done a pretty good job integrating this utility into the core
of OS X (password expiry, etc…) but only for bound clients.  That’s where this
little utility comes in.  Here’s the scenario, a client has a MacBook (or other
device) with a local account that isn’t affiliated with the directory, but they
also have a directory account to use intranet resources like printing, or
network storage. OS X doesn’t provide a way for the client to manage their AD
account outside of terminal, and if something happens like an expired password,
everything just stops working, and the only way for them to get their account
working again is to log into a bound client and update their account.  Needless
to say, most users don’t like either of those options.  So this is smbpasswdgui
(or as I call it “NetPass”) , a simple AppleScript program that presents the
user with a workflow to change their password.

```applescript
(* Written by Danny Wahl *)

set domain to "YourDomain1"
display dialog "Domain (YourDomain1 or YourDomain2):" default answer domain
if the text returned of the result is "YourDomain1" then
	set controller to "dcaddress.YourDomain1.com"
else
	set controller to "dcaddress.YourDomain2.com"
end if

set username to ""
display dialog "Username:" default answer (do shell script "echo $USER")
set username to (text returned of result)

set oldpass to ""
display dialog "Old Password:" default answer oldpass with hidden answer
set oldpass to (text returned of result)

repeat
	set newpass to ""
	display dialog "New Password:" default answer newpass with hidden answer
	set newpass to (text returned of result)
	if length of newpass is greater than 7 then
		exit repeat
	else
		display dialog "Password must be at least 8 characters" buttons {"OK"} default button 1
	end if
end repeat

repeat
	set newpassv to ""
	display dialog "New Password (Verify):" default answer newpassv with hidden answer
	if the text returned of the result is newpass then
		exit repeat
	else
		display dialog "Passwords do not match, please verify again" buttons {"OK"} default button 1
	end if
end repeat

try
	do shell script "(echo " & oldpass & ";" & "echo " & newpass & ";" & "echo " & newpass & ";) | smbpasswd -s -U" & username & " -r " & controller
	display dialog "Network password has been changed" buttons {"OK"} default button 1
on error error_message
	display dialog "Error: " & error_message buttons {"OK"} default button 1 with icon stop
end try
```

Now, this probably isn’t for everyone but it’s easy to change, and I’ll walk you
through the workflow.  First it sets a default domain (YourDomain1) and prompts
the user for their domain – not every environment has multiple domains, but you
may have foo.com and bar.com – and OS X doesn’t like browsing a forest without
an explicit domain.

Next, it takes the domain that your user input (remember OS X uses
DOMAINUSERNAME format) and matches it to the fqdn for your domain controller. 
Then it asks the user for their domain username (populated with bash username)
old password and a new password (and validation) – I threw in a little bit of
password policy just for fun.  Then it takes the four variables (domain
controller fqdn, directory username, old password, and new password) and pipes
them to smbpasswd.  The beauty is that you only have to program minimal error
handles – just tell it to display whatever terminal says is the result, since
smbpasswd has full error handling built-in.
