#Verify GitHub Access login
SCRIPT_HOME="$(realpath $(dirname $0))"
BFG_JAR="$SCRIPT_HOME/bfg.jar"
configFile=$HOME/.ssh/MigrationConfig

if [ "$#" -ne 1 ];then
	echo "Usage: $(basename $0) [repository_name]"
	echo "       Create a repository on GitHub."
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
echo ${GH_TOKEN}|gh auth login -h ${GH_HOST} --with-token
if [ $? -ne 0 ];then
	echo "      Aborting: Unable to access '${GH_HOST}' with git or GitHub CLI (gh)"
	exit -1
fi

#Create or overright remote repo
gh repo view ${GH_ORG}/$repo >& /dev/null
if [ $? -ne 0 ];then
	echo "   - Creating repo '${repo}' on '${GH_HOST}'"
	rm -r -f $repo  
	gh repo create -y  -t ${GH_TEAM} --public ${GH_ORG}/$repo 
else
	echo "   - Cannot create repo, $repo already exists"
fi
