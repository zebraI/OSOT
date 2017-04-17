#!/bin/bash 
#Path
folder_name=backup_db
file_name=test
#
#Credentials
user=root
password=Maxime2017
# 
host=localhost
db_name=activesites
date=$(date +"%d-%b-%Y")
#
# Set default file permissions
umask 177
#
#Dump database into SQL file
# mysqldump -u $user -p$password $db_name > backup_db/$file_name --add-drop-table
# mysqldump -u$user -pMaxime2017 activesites > backup_db/test.sql
mysqldump --user=$user --password=Maxime2017 --host=$host $db_name > backup_db/test.sql
echo "Done!"