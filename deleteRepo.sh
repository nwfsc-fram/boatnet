#Verify GitHub Access login
SCRIPT_HOME="$(realpath $(dirname $0))"
BFG_JAR="$SCRIPT_HOME/bfg.jar"
configFile=$HOME/.ssh/MigrationConfig


if [ "$#" -ne 1 ];then
	echo "Usage: $(basename $0) [repository_name]"
	echo "       Delete a repository on GitHub."
	echo "       Specification of servers, tokens, user names, and git namespaces"
	echo "       is found in '$configFile' which must have permissions of '600'."
	exit
else
	repo="$1"
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

out=$(mktemp)
curl -s -X DELETE \
			   -H "Accept: application/vnd.github.v3+json" \
			   -H "Authorization: token ${GH_TOKEN}" \
			   https://${GH_HOST}/api/v3/repos/${GH_ORG}/$repo --output $out

if [ $(cat $out|wc -l) -ne 0 ];then
	echo "Error in deleting: $repo"
	echo "Log file $out reports:"
	cat $out
fi














