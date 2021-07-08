#!/usr/bin/env bash

# https://docs.github.com/en/enterprise-server@2.21/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token p get github token

wrkingDir=$PWD
configFile=$HOME/.ssh/MigrationConfig
SCRIPT_HOME="$(realpath $(dirname $0))"
BFG_JAR="$SCRIPT_HOME/bfg.jar"
MIGRATION_SCRIPT="$(realpath $(dirname $0))/lab2Hub.sh"

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

if [ ! -r $configFile ];then
	echo "Aborting: Cannot find config file '$configFile'"
	exit -1
elif [ "$(stat -c '%a' $(dirname $configFile))" != "700" ];then
	echo -n "Aborting: Bad permissions on configuration file directory "
	echo "'$(dirname configFile)' ($(stat -c '%a' $(dirname $configFile)))"
	echo "          Set permissions to '700'"
	exit -1
elif [ "$(stat -c '%a' $configFile)" != "600" ];then
	echo "Aborting: Bad permissions on '$configFile' ($(stat -c '%a' $configFile))"
	echo "          Set permissions to '600'"
	exit -1
else
	. $configFile
fi




declare -a REPOs=('auth-centraly' 'auvy' 'bar-data-pully' 'boatnet-etly' 'boatnety' 'boatnet-internaly' 'BudgetDBy' 'distance-fishedy' 'dockery' 'efh-catalog-staticy' 'field-collectiony' 'Fish-Ticket-Matchingy' 'hudy' 'hud_web2pyy' 'ifqy' 'infrastructurey' 'mod_wsgiy' 'multicorn-couchdb_fdwy' 'nodeobservery' 'ObserverDB_speciesCatchExpansionsy' 'Observer-Legacyy' 'observer-maintenancey' 'Observer-Refreshy' 'observer-sector-definitionsy' 'observerxy' 'obsprody' 'obs-sync-uploady' 'odpy' 'optecsy' 'oracle-clienty' 'permits-etly' 'PyICAMy' 'pyqt5-framdatay' 'pySurveyy' 'rapid-db-appy' 'survey_dbsy' 'trawl-analyzery' 'trawldby' 'trawl-retroy' 'warehousey' 'warehouse-internaly' 'warehouse-resty')
for repo in ${REPOs[@]};do
	echo -n "   - Migrating '$repo'"
	$MIGRATION_SCRIPT $repo >&  $wrkingDir/$repo.log
	if [ $? -ne 0 ];then
		echo "...Failed."
		if [ -r  $wrkingDir/$repo.log ];then
			echo "     Error Log '$wrkingDir/$repo.log':"
			cat  $wrkingDir/$repo.log | sed 's+^+      +'
		fi
	else
		echo "...succeeded."
		rm -f -r $repo
		rm -f -r  $wrkingDir/$repo.log
	fi
done
