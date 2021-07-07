#!/usr/bin/env bash

# https://docs.github.com/en/enterprise-server@2.21/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token p get github token

wrkingDir=$PWD
configFile=$HOME/.ssh/MigrationConfig
SCRIPT_HOME="$(realpath $(dirname $0))"
BFG_JAR="$SCRIPT_HOME/bfg.jar"

if [ "$#" -ne 0 ];then
	echo "Usage: $(basename $0) "
	echo "       Using '$MIGRATION_SCRIPT' and then querrying "
	echo "       a specified GitLab server for the list repositories under  "
	echo "       a specific name space, the script migrates reponsitories "
    echo "       to a specified GitHub server ."
	echo "       Specification of servers, tokens, user names, and git namespaces"
	echo "       is found in '$configFile' which must have permissions of '600'."
	exit
fi

if [ ! -f $configFile ];then
	echo "Aborting: Cannot find config file '$configFile'"
	exit -1
elif [ ! -r $configFile ];then
	echo "Aborting: Cannot read config file '$configFile'"
	exit -1
elif [ "$(stat -c '%a' $configFile)" != "600" ];then
	echo "Aborting: Bad permissions on '$configFile' ($(stat -c '%a' $configFile))"
	echo "          Set permissions to '600'"
	exit -1
else
	. $configFile
fi

if [ hash gh >& /dev/null ];then
	echo "Aborting:  The Git Hub CLI 'gh' must be installed in the scripts path."
	echo "For installation instructions see: "
	echo "https://computingforgeeks.com/how-to-install-github-cli-on-linux-and-windows"
	exit -1
fi


if [ $(hash jq >& /dev/null;echo $?) -ne 0 ];then
	echo "Aborting:  The command-line JSON processor 'jq' must be installed in"
	echo "this scripts path. For installation instructions see: "
	echo "https://stedolan.github.io/jq/"
	exit -1
fi

gl_connect_log=$(mktemp -u)
status=$(curl -s -k  -w '\nX%{http_code}X\n' https://${SRC_HOST}/api/v4/projects --output $gl_connect_log |grep -c X200X)
ret=0
if [ $status != 1 ];then
	echo
	echo "Aborting: Unable to access ${SRC_HOST} via GitLab API."
	if [ -r $gl_connect_log ];then
		cat $gl_connect_log
	fi
	exit -1
fi
rm -r $gl_connect_log
echo "   - Confirmed access '${SRC_HOST}:${SRC_ORG}/$repo' as '${SRC_GIT_USER}'"



curl -s -k --header "Authorization: Bearer ${SRC_TOKEN}" "https://${SRC_HOST}/api/v4/groups/${SRC_ORG}?per_page=1000"|jq '.projects[]|(.path_with_namespace +" (id: " + (.id|tostring)) + ")"'|sed 's+"++g'| sort -u

