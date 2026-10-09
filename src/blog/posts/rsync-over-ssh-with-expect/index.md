---
title: rsync over SSH with expect
published_at: 2011-03-21T12:32:54.000Z
modified_at: 
snippet: 
tags: 
authors: Danny Wahl
---

lately I decided that a good plan of action would be to take the web server files in my virtual machine: Apache config, Postgres config and databases, Moodle root and moodle data and back them up to the host server via [rsync](http://samba.anu.edu.au/rsync/documentation.html) over [SSH](http://www.openssh.com/).  Once they’re on the host machine, in this case a Mac Mini Server, the target folder can be backed up via Time Machine.

So if an end user accidentally deletes a critical file from their Moodle course, and somehow can’t restore it from their course backups (which happen nightly and are kept for 12 months) then I can browse Time Machine, restore it and then rsync it back!  It all sounds good until you start getting into SSH sessions which is a PAIN to say the least.

The first problem I encountered was that rsync really needs to be run by an account that has read/write access to all the files that you want to backup, but you shouldn’t use root – depending on how secure you want to be… So what user has access to apache config (apache) postgres (postgres) web root (www-data) and moodle data (admin user) other than root?  The short answer is nobody, the long answer is create a user and drop them in the respective groups.  I went with the short answer because I’m fairly comfortable security wise using root to rsync from the VM to the host.  If somebody has access to the host server they have my whole VM anyways.

The second problem was that [ssh-agent](http://bashcurescancer.com/setting_up_ssh_keys_for_access_without_password.html) is only a temporary shell, so after you’ve set up your authentication you need to start the shell and invoke [ssh-add](http://www.usc.edu/its/ssh/key.html), enter your passphrase and then start your backup script.  No problem if you want to leave a root shell open 24/7 which I don’t.  Also a problem if say, your session times out, then you need to re-add your key to the temp-session and start over.  This can be a big problem if you’re using a shell script to stop services at night to complete the backup.  If rsync hangs at the passphrase prompt you’re offline until you notice it – and you don’t have a backup!

Enter [expect](http://oreilly.com/catalog/expect/chapter/ch03.html).  A program used for automating/interacting with programs which is really a powerful tool.  By writing a small expect script and calling that instead you can easily automate your backup via rsync, without needing a permanent root shell and without needing to mess with ssh-agent.  First let’s look at a simple backup script for rsyncing your apache config files to a remote server:

```bash
#rsync.sh
#Stop Apache
/etc/init.d/apache2 stop

#Backup Apache
rsync --progress -avze ssh --numeric-ids --delete /etc/apache2 username@yourserver.domain.com:/path/to/backup/etc

#Start Apache
/etc/init.d/apache2 start
```

That’s not too difficult, now let’s add expect into the mix to automate the process

```bash
#backup.exp
if {[llength $argv] == 0} {
  puts "Usage: expect backup.exp passphrase"
  exit 1
}

spawn sh rsync.sh
set passphrase [lindex $argv 0]
expect "Enter passphrase for key '/path/to/key/id_type':"
send "$passphrase\r"
expect eof
```

ta-da!  That’s pretty easy to follow right?  You type expect backup.exp passphrase, where backup.exp is whatever you save the script as, and passphrase is your SSH passphrase and then the magic happens.  Of course this is very basic, and doesn’t handle errors or exceptions – something which you’ll definitely want to do – in case expect hangs you’ll want to kill rsync and start Apache eventually. Now just add the expect file to your cron jobs for fully automated backups.