---
title: Rolling Database Backups
published_at: 2011-04-29T13:14:35.000Z
modified_at: 
snippet: 
tags: 
authors: Danny Wahl
---

A few weeks back I decided to try to frustrate myself beyond belief by trying to write a bash script that would (among other things) dump a database every hour.  That idea quickly evolved to keeping the older backups, which turned into setting a cap on the maximum amount of old backups to keep, which then added needing to know which backup was which.  If you’re confused reading this, welcome to my world trying to write it.

I was eventually able to write it (for PostgreSQL) and then port it to MySQL – acutally fairly easily – and in the process find out about some [more limitations of MySQL](http://bugs.mysql.com/bug.php?id=17627).  So for anyone looking to do something similar to what I wanted, here’s the scripts, followed by some notes.  I’m planning on doing a writeup of my entire script sometime – as the DB backup is just a small (albeit the most complex) part of it.

## PostgreSQL

```bash
#!/bin/bash
dbcount=24
dbnames=( "database1" "database2" "database3" )
dbusers=( "dbuser1" "dbuser2" "dbuser3" )
domains=( "domain1" "domain2" "domain3" )
domain_path="/var/www/"
backup_path="/backup/"
short_date=`date +"%y%m%d-%H"`
# Dumping Databases
for (( i = 0 ; i <= `expr ${#domains[@]} \- 1`; i++ ))
do
  cd $domain_path${domains[$i]}$backup_path
  for (( c = `expr $dbcount \- 1` ; c >=0; c-- ))
  do
    n=`expr $c \+ 1`
    while test "${#n}" -lt 2
    do
      n="0$n"
    done
    d=$c
    while test "${#d}" -lt 2
    do
      d="0$d"
    done
    file=`ls | grep -E ".($d).(tar)$"`
    if [[ $file =~ $date_regex ]]
    then
      if [ -f "$file" ]
      then
        mv $file ${dbnames[$i]}.${BASH_REMATCH[0]}.$n.tar
      fi
    fi
  done
  pg_dump -U ${dbusers[$i]} -Ft ${dbnames[$i]} > ${dbnames[$i]}.$short_date.00.tar
  old_file=`ls | grep -E ".($dbcount).(tar)$"`
  if [[ $old_file =~ $date_regex ]]
  then
    if [ -f "$old_file" ]
    then
      rm $old_file
    fi
  fi
done
```

You’ll notice by looking at this script that there aren’t any passwords involved, and that’s because it relies on reading the passwords from [.pgpass](http://wiki.postgresql.org/wiki/Pgpass).  You’ll also notice if you try to run the script that it complains you need root.  The reason for that is that I use root’s .pgpass file to store the passwords rather than the normal user just for a layer of security – as somebody that gets access to my standard account can’t just go grab my DB passwords and walk away – it is clear text after all.  You could drop the root check and move the pgpass file to ~ if you’re feeling lucky.

## MySQL

```bash
#!/bin/bash
dbcount=24
dbnames=( "database1" "database2" "database3" )
domains=( "domain1" "domain2" "domain3" )
domain_path="/var/www/"
backup_path="/backup/"
short_date=`date +"%y%m%d-%H"`
date_regex="[0-9]{6}\-[0-9]{2}"
# Dumping Databases
for (( i = 0 ; i <= `expr ${#domains[@]} \- 1`; i++ ))
do
  cd $domain_path${domains[$i]}$backup_path
  for (( c = `expr $dbcount \- 1` ; c >=0; c-- ))
  do
    n=`expr $c \+ 1`
    while test "${#n}" -lt 2
    do
      n="0$n"
    done
    d=$c
    while test "${#d}" -lt 2
    do
      d="0$d"
    done
    file=`ls | grep -E ".($d).(sql)$"`
    if [[ $file =~ $date_regex ]]
    then
      if [ -f "$file" ]
      then
        mv $file ${dbnames[$i]}.${BASH_REMATCH[0]}.$n.sql
      fi
    fi
  done
  mysqldump -B ${dbnames[$i]} > ${dbnames[$i]}.$short_date.00.sql
  old_file=`ls | grep -E ".($dbcount).(sql)$"`
  if [[ $old_file =~ $date_regex ]]
  then
    if [ -f "$old_file" ]
    then
      rm $old_file
    fi
  fi
done
```

This script is very very similar to the Postgres one – and that’s because it was ported from the Postgres script.  The main difference is that the database owner array is gone, and that’s because my.cnf only supports one account – so you need a credential set that has access to all of your databases you want to dump, e.g. Root.

## Notes

Well those are the scripts, and they should look pretty straight-forward, it loops through your databases that are associated with a domain, and dumps them to a folder you specify for that domain.  E.g. domain\_1\_db would be dumped to /path/to/domain\_1/path/to/backup, or example\_db would be backed up to /var/www/example/backup if that was where it was really stored. Your databases are also named with the regex you define for `$short_date` which by default is `YYMMDD-HH.##.ext` the `##` is `00-$dbcount` (default is 23) 00 is the newest dump and 23 is the oldest. Anything older than that gets deleted.