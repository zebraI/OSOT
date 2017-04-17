@echo off 
SET folder_name=backup_db
SET file_name=test

SET user=osot_save
SET password=WHeyLKtx5A36Q3Lu

SET db_name=activesites

for /F "usebackq tokens=1,2 delims==" %%i in (`wmic os get LocalDateTime /VALUE 2^>NUL`) do if '.%%i.'=='.LocalDateTime.' set ldt=%%j
set date_time=%ldt:~0,4%-%ldt:~4,2%-%ldt:~6,2% %ldt:~8,2%-%ldt:~10,2%-%ldt:~12,6%

c:\wamp64\bin\mysql\mysql5.7.14\bin\mysqldump --user=%user% --password=%password% --result-file="%folder_name%\%file_name%-%date_time%.sql" %db_name% --add-drop-table 
echo Done!
pause
exit