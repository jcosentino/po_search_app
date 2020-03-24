tasklist  find i node.exe && taskkill im node.exe F  echo process node.exe not running.

net use P fileserverDOCSITePO persistentyes
P

if not exist  %userprofile%DesktopPO_Search_Application.bat xcopy PO_Search_Application.bat %userprofile%Desktop C R

IF EXIST CProgram Files (x86) (
	IF EXIST CProgram Filesnodejs (
		cd PO_CodePO_Search_App
		node app.js
	) ELSE (
		msiexec i node-v10.15.2-x64.msi
		exit
	)
) ELSE (
	IF EXIST CProgram Filesnodejs (
		cd PO_CodePO_Search_App
		node app.js
	) ELSE (
		msiexec i node-v10.15.2-x86.msi
		exit
	)
)

