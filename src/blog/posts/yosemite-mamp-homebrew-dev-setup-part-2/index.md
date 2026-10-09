---
title: Yosemite MAMP homebrew dev setup part 2
published_at: 2014-10-28T19:39:48.000Z
modified_at: 
snippet: 
tags: 
authors: Danny Wahl
---

In my previous post
[OS X 10.10 Yosemite, Apache, MySQL, PHP 5.6, (MAMP) Homebrew Dev Setup](/blog/osx-yosemite-mamp-homebrew-development-setup/ "OS X 10.10 Yosemite, Apache, MySQL, PHP 5.6, (MAMP) Homebrew Dev Setup")
I covered a lot. Like a lot a lot, but by the end of the post all we had really
accomplished was installing the basic building blocks of a development server,
namely: Apache, MySQL, and PHP. In this post we’ll take those components and
turn them into a sweet development workflow.

## Updating Brew

Everyone loves running `brew update && brew upgrade` just to see what’s been
updated. It’s a seriously
[busy repo](https://github.com/Homebrew/homebrew/commits/master/Library/Formula),
but it’s easy to forget to do and then your versions languish. Fortunately for
us [Mark Kalmes](http://mkalmes.net/) wrote a LaunchAgent plist for us called,
aptly,
[brewupdate](http://mkalmes.net/2012/01/02/brewupdate-a-launchd-agent-for-automatic-homebrew-formulae-updates.html).
We’re going to grab the latest version and install it.

```bash
curl https://raw.githubusercontent.com/mkalmes/brewupdate/develop/net.mkalmes.brewupdate.plist > ~/Library/LaunchAgents/net.mkalmes.brewupdate.plist
launchctl load ~/Library/LaunchAgents/net.mkalmes.brewupdate.plist
```

The first line downloads the latest version straight from github to the
user-space LaunchAgents folder. The second line loads it. You can edit the file
and change when it updates, the default is 11 AM (local time zone). I changed
mine to 8 AM because I like to start the day with a fresh brew (ha ha.)

Just don’t forget to run `brew upgrade` yourself occasionally. You could make
another LaunchAgent by changing the parameter from `update` to `upgrade`, but I
really don’t like unattended upgrades as much as updates.

## Apache 2: DocumentRoot

That’s a clever title, you see we’re _running_ Apache HTTPD 2, and at the same
time this is part 2 of the Apache section… Anyways, at the end of Part 1 Apache
was running on port 80 like a champ. The DocumentRoot is set to something
ridiculous like `/usr/local/var/www/htdocs` which is pretty freaking
inconvenient.

First we need to create our /Sites folder and we’ll still keep our web documents
inside of that folder.

```bash
mkdir ~/Sites ~/Sites/htdocs
```

Then edit your `/usr/local/etc/apache2/2.4/httpd.conf` file and change the
DocumentRoot directive, as well as accompanying Directory declaration to match
your new htdocs location:

```apacheconf
DocumentRoot "/Users/USERNAME/Sites/htdocs"
<directory>
</directory>
```

Obviously replace `USERNAME` with your username’s folder name. Then inside of
that directory declaration we’re going to change some of the default Apache
values to be more permissive:

```apacheconf
Options All MultiViews
AllowOverride All
```

This is given with the usual caveat that OF COURSE you would never default
everything like this on a production server- but on a development server there’s
generally not much security implication (unless you’re playing with live data!).
My full DocumentRoot section looks like this:

```apacheconf
DocumentRoot "/Users/dannywahl/Sites/htdocs"
<directory>
  #
  # Possible values for the Options directive are "None", "All", 
  # or any combination of: 
  # Indexes Includes FollowSymLinks SymLinksifOwnerMatch ExecCGI MultiViews 
  # 
  # Note that "MultiViews" must be named *explicitly* --- "Options All" 
  # doesn't give it to you. # # The Options directive is both complicated and important. Please see 
  # http://httpd.apache.org/docs/2.4/mod/core.html#options 
  # for more information. 
  Options All MultiViews 
  # 
  # AllowOverride controls what directives may be placed in .htaccess files. 
  # It can be "All", "None", or any combination of the keywords: 
  # AllowOverride FileInfo AuthConfig Limit 
  AllowOverride All 
  # 
  # Controls who can get stuff from this server. 
  # Require all granted
</directory>
```

Now, restart your httpd daemon:

```bash
sudo httpd -k restart
```

If you didn’t use `--with-privileged-ports` when you installed Apache then you
don’t need root. Now when you visit [http://localhost](http://localhost/) you
should just get a blank directory listing instead of the default “It Works!”
page. Let’s put a test page there. First let’s create a sub-directory in our
/Sites folder called `phpinfo.localhost` (more on the `.` later).

```bash
mkdir ~/Sites/phpinfo.localhost
```

Now let’s create a page that calls the `phpinfo();` function and place it in
that folder. if you don’t know about
[phpinfo()](http://cn2.php.net/manual/en/function.phpinfo.php) it’s a simple
function that outputs a page that shows you information about your PHP
configuration.

```bash
printf ‘<?php phpinfo(); ??>‘ >> ~/Sites/htdocs/phpinfo.localhost/index.php
```

Now you should be able to visit `http://localhost/phpinfo.localhost/` and see
the overview of your PHP configuration. That’s it for now for Apache, let’s move
on to MySQL.

## MySQL

In the first post we simply installed MySQL and set a root password. It’s good
to have a password because some authentication APIs require one, but we’re not
necessarily using it for security (otherwise we wouldn’t be using root), so
we’re going to save our authentication in a my.cnf
[options file](http://dev.mysql.com/doc/refman/5.1/en/option-files.html).
Homebrew provides us with a sample file, but it’s not symlinked by default so
we’re going to copy it to an available configuration folder and since MySQL is
running in user-space, we will override the configuration at the user-space
level:

```sql
cp -v $(brew –prefix mysql)/support-files/my-default.cnf ~/.my.cnf
```

Now we have our config override, let’s have it auto-save our credentials.

```bash
cat > ~/.my.cnf 
[client] 
user=root 
password=PASS 
[mysql] 
user=root 
password=PASS 
[mysqldump] 
user=root 
password=PASS 
[mysqldiff] 
user=root 
password=PASS 
EOF
```

Replace “PASS” with your root MySQL password. If you have special characters in
your password, which you shouldn’t, add double quotes around the password. Now
you can connect to mysql without having to manually authenticate.

```sql
mysql -u root
```

## phpmyadmin

Finally we’re going to install everyone’s favorite database manager,
[phpmyadmin](http://www.phpmyadmin.net/home_page/index.php). Again, we’ll be
using homebrew to install it.

```bash
brew install phpmyadmin
```

After a successful installation you will get a caveat about adding a directory
alias to your httpd configuration to enable phpmyadmin, but we’re not going to
do that we’re going to [symlink](http://en.wikipedia.org/wiki/Symbolic_link) it
to to our ~/Sites directory.

```bash
ln -s /usr/local/share/phpmyadmin ~/Sites/htdocs/phpmyadmin.localhost
```

This will create a symbolic link in your webroot called phpmyadmin.localhost
that takes you to /usr/local/share/phpmyadmin (which itself is a symlink to the
Cellar). The benefit here is you don’t need to restart Apache, and again we’ll
go over it later but the .localhost is important.

Now that phpmyadmin is installed, we need to configure it. First we’ll import
the phpmyadmin linked tabled
[configuration storage](http://docs.phpmyadmin.net/en/latest/setup.html#linked-tables)
via commandline:

```sql
mysql -u root -e 'CREATE DATABASE IF NOT EXISTS `phpmyadmin`;'
mysql -u root phpmyadmin
```

Once the tables are imported open your phpmyadmin config file located at
`/usr/local/etc/phpmyadmin.config.inc.php` and you're going to do a few things:

1. [generate a blowfish secret](http://www.question-defense.com/tools/phpmyadmin-blowfish-secret-generator)
2. Set your `controluser` and `controlpass` (I use root again)
3. Uncomment the storage database and tables section

In the end your blowfish and servers configuration sections should look
something like this:

```php
$cfg['blowfish_secret'] = 'y=PUY@-GleE+~%OiGQVz#)N4I)@Q%Ug_Jr[DxF';
/* YOU MUST FILL IN THIS FOR COOKIE AUTH! */
/* * Servers configuration */
$i = 0;
/* * First server */
$i++;
/* Authentication type */
$cfg['Servers'][$i]['auth_type'] = 'cookie';
/* Server parameters */
$cfg['Servers'][$i]['host'] = '127.0.0.1';
$cfg['Servers'][$i]['connect_type'] = 'tcp';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['AllowNoPassword'] = false;
/* * phpMyAdmin configuration storage settings. */
/* User used to manipulate with storage */
// $cfg['Servers'][$i]['controlhost'] = '';
// $cfg['Servers'][$i]['controlport'] = '';
$cfg['Servers'][$i]['controluser'] = 'root';
$cfg['Servers'][$i]['controlpass'] = 'root';
/* Storage database and tables */
$cfg['Servers'][$i]['pmadb'] = 'phpmyadmin';
$cfg['Servers'][$i]['bookmarktable'] = 'pma__bookmark';
$cfg['Servers'][$i]['relation'] = 'pma__relation';
$cfg['Servers'][$i]['table_info'] = 'pma__table_info';
$cfg['Servers'][$i]['table_coords'] = 'pma__table_coords';
$cfg['Servers'][$i]['pdf_pages'] = 'pma__pdf_pages';
$cfg['Servers'][$i]['column_info'] = 'pma__column_info';
$cfg['Servers'][$i]['history'] = 'pma__history';
$cfg['Servers'][$i]['table_uiprefs'] = 'pma__table_uiprefs';
$cfg['Servers'][$i]['tracking'] = 'pma__tracking';
$cfg['Servers'][$i]['designer_coords'] = 'pma__designer_coords'; 
$cfg['Servers'][$i]['userconfig'] = 'pma__userconfig';
$cfg['Servers'][$i]['recent'] = 'pma__recent';
$cfg['Servers'][$i]['favorite'] = 'pma__favorite';
$cfg['Servers'][$i]['users'] = 'pma__users';
$cfg['Servers'][$i]['usergroups'] = 'pma__usergroups';
$cfg['Servers'][$i]['navigationhiding'] = 'pma__navigationhiding';
$cfg['Servers'][$i]['savedsearches'] = 'pma__savedsearches';
/* Contrib / Swekey authentication */
// $cfg['Servers'][$i]['auth_swekey_config'] = '/etc/swekey-pma.conf';
/* * End of servers configuration */
```

You might notice that I changed my host to "127.0.0.1" from "localhost". By
default /etc/hosts should resolve localhost to 127.0.0.1 so it shouldn't trigger
a DNS lookup, but by changing it to an IP address you'll never have that happen
because there are ways to inadvertently send lookups to your machine DNS for
localhost. Again, this is not necessary. After saving your phpmyadmin
configuration you should be able to visit the page at
`http://localhost/phpmyadmin.localhost`

## dnsmasq

[Dnsmasq](http://www.thekelleys.org.uk/dnsmasq/doc.html) is a lightweight
DNS/DHCP server which can be installed and serve DNS for addresses that aren't
in the [global namespace](http://en.wikipedia.org/wiki/Global_Namespace). We'll
be installing dnsmasq via homebrew and configuring it, along with Apache to
serve sites on
[reserved TLDs](http://en.wikipedia.org/wiki/Top-level_domain#Reserved_domains).

```bash
brew install dnsmasq
```

Once dnsmasq is installed we need to copy a configuration profile, edit it, and
then load the daemon. First we'll copy a provided configuration:

```bash
cp /usr/local/opt/dnsmasq/dnsmasq.conf.example /usr/local/etc/dnsmasq.conf
printf '\naddress=/localhost/127.0.0.1' >> /usr/local/etc/dnsmasq.conf
sudo cp -fv /usr/local/opt/dnsmasq/*.plist /Library/LaunchDaemons
sudo launchctl load /Library/LaunchDaemons/homebrew.mxcl.dnsmasq.plist
```

Effectively we are telling dnsmasq to resolve all .localhost domains to
127.0.0.1 and setting it to run the daemon at the machine level (with Apache).
So you can now try to ping any .localhost domain and it will resolve to
127.0.0.1:

```bash
ping -c 1 thisdoesntexist.localhost
PING thisdoesntexist.localhost (127.0.0.1): 56 data bytes 
64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.029 ms

--- thisdoesntexist.localhost ping statistics ---
1 packets transmitted, 1 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 0.029/0.029/0.029/0.000 ms
```

Obviously trying to visit
[http://thisdoesntexit.localhost](http://thisdoesntexit.localhost/) won't work
because Apache isn't configured to handle requests to that address, yet. There
are two different ways to configure this, the first is to create a vhost entry
for every domain you want to use, the second is to enable
[mod\_vhost\_alias](http://httpd.apache.org/docs/2.2/mod/mod_vhost_alias.html)\-
which is what we'll do now.

## mod\_vhost\_alias

Mod\_vhost\_alias is an Apache module that let's you do pattern matching from a
request URL to a directory structure, there are lots of cool examples at the
documentation site- but the one we want is pretty straight forward. Open your
httpd.conf file (in /usr/local/etc/apache2/2.4/) and uncomment the
mod\_vhost\_alias module

```apacheconf
LoadModule vhost_alias_module libexec/mod_vhost_alias.so
```

then in terminal we'll configure vhost\_alias\_module:

```bash
printf '\nUseCanonicalName Off\nVirtualDocumentRoot /Users/USERNAME/Sites/htdocs/%%0' >> /usr/local/etc/apache2/2.4/httpd.conf
```

And finally restart the httpd daemon:

```bash
sudo httpd -k restart
```

The end result is that now every folder that ends in .localhost in your
~/Sites/htdocs/ folder is accessible as a
[FQDN](http://en.wikipedia.org/wiki/Fully_qualified_domain_name). Go back to
your browser and now you can visit
[http://phpinfo.localhost](http://phpinfo.localhost/) and
[http://phpmyadmin.localhost](http://phpmyadmin.localhost/) If you create
another folder inside of htdocs that ends in .localhost it will be available in
your dev environment as a standalone domain. Here's a couple of examples of how
that could be useful:

Say you want a standalone domain of wordpress:

```bash
git clone git@github.com:WordPress/WordPress.git ~/Sites/htdocs/wordpress.localhost
```

What about multiple branches of drupal on standalone domains? Let's make
`http://drupal6.localhost` and `http://drupal7.localhost`

```bash
git clone git@github.com:drupal/drupal.git --branch 6.x --single-branch ~/Sites/htdocs/drupal6.localhost
git clone git@github.com:drupal/drupal.git --branch 7.x --single-branch ~/Sites/htdocs/drupal7.localhost
```

As another example, how about a single domain with multiple moodle instances in
sub-directories like `http://moodle.localhost/26` and
`http://moodle.localhost/27`

```bash
mkdir ~/Sites/htdocs/moodle
git clone git@github.com:moodle/moodle.git --branch MOODLE_26_STABLE --single-branch ~/Sites/htdocs/moodle/26 
git clone git@github.com:moodle/moodle.git --branch MOODLE_27_STABLE --single-branch ~/Sites/htdocs/moodle/27
```

## Wrapping Up

So there you go! Mac OS X with brewed versions of important stuff like openssl
and git, Apache 2.4, MySQL, and PHP 5.6 and a killer setup using
mod\_vhost\_alias and dnsmasq to provision .localhost domains on the fly. Of
course there are a million ways to dev from here, but this is a pretty solid
foundation.

If you need help with educational technology in your institution, from strategic
planning, to implementation, to technical support contact us and we can help get
you on the path to success.
