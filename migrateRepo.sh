#!/usr/bin/env bash 

SCRIPT_HOME="$(realpath $(dirname $0))"
if [ ! -z $_DEBUG ];then
	set -xv
fi
BFG_JAR="$SCRIPT_HOME/bfg.jar"
METADATA_SYNC_HOME="$SCRIPT_HOME/node-gitlab-2-github"
METADATA_SYNC_SETTING_TEMPLATE="$SCRIPT_HOME/meta_sync_setting_template.ts"
if [ -z $GIT_MIGRATION_CONF ];then
	configFile=$HOME/.ssh/MigrationConfig
else
	configFile="$GIT_MIGRATUON_CONF"
fi

size_cutoff=49 # max size in MB before we need to lfs.

if [ "$#" -ne 1 ];then
	echo "Usage: $(basename $0) [repository_name]"
	echo "       Copies repository from a public GitHib to and Enterprise GitHub."
	echo "       Specification of servers, tokens, user names, and git namespaces"
	echo "       is found in '$configFile' which must have permissions of '600'."
	exit
else
	REPO="$1"
fi

if [ ! -f $configFile ];then
	echo "Aborting: Cannot find config file '$configFile'"
	exit -1
elif [ ! -r $configFile ];then
	echo "Aborting: Cannot read config file '$configFile'"
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

ENVs=( "SRC_ORG" "SRC_HOST" "SRC_TOKEN" "SRC_GIT_USER" "SRC_TYPE" \
				 "TARG_ORG" "TARG_HOST" "TARG_TOKEN" "TARG_GIT_USER" "TARG_TYPE")
for env in ${ENVs[@]};do

	if [ -z $(eval echo \${${env}})  ];then
		echo "Configuration parameter \$$env is missing from $configFile"
		exit -1
	fi
done
SRC_TYPE=$(echo $SRC_TYPE|tr [a-z] [A-Z] )
TARG_TYPE=$(echo $SRC_TYPE|tr [a-z] [A-Z] )
if [ $SRC_TYPE != "GITLAB" -a $SRC_TYPE != "GITHUB" ];then
	echo "Invalide SRC_TYPE ($SRC_TYPE) in '$configFile'"
	echo "SCR_TYPE must be 'GITLAB' or 'GITHUB'."
	exit -1
fi
if [ "$TARG_TYPE" != "GITLAB" ];then
	echo "Invalide TARG_TYPE ($TARG_TYPE) in '$configFile'"
	echo "SCR_TYPE must be 'GITHUB'."
	exit -1
fi
if [ "$SRC_TYPE" = "GITHUB" ];then
	echo "Invalide SRC_TYPE GITHUB is currently not implemented."
	exit -1
fi


if [ $(hash gh >& /dev/null;echo $?) -ne 0 ];then
	echo "Aborting:  The Git Hub CLI 'gh' must be installed in the scripts path."
	echo "For installation instructions see: "
	echo "https://computingforgeeks.com/how-to-install-github-cli-on-linux-and-windows"
	exit -1
fi

if [ $(git lfs --help --man >& /dev/null;echo $?) -ne 0 ];then
	echo "Aborting:  Git Large File Storage LFS is not installed."
	echo "For installation instructions see: https://git-lfs.github.com/"
	exit -1
fi

if [ $(java -h >& /dev/null;echo $?) -ne 0 ];then
	echo "Aborting:  The executable 'java' is not in PATH."
	echo "For installation instructions see: "
	echo "https://java.com/en/download/help/download_options.html"
	exit -1
fi

if [ $(hash jq >& /dev/null;echo $?) -ne 0 ];then
	echo "Aborting:  The command-line JSON processor 'jq' must be installed in"
	echo "this scripts path. For installation instructions see: "
	echo "https://stedolan.github.io/jq/"
	exit -1
fi


if [ ! -f $BFG_JAR ];then
	echo "Aborting:  BFG Repo-Cleaner jar file $BFG_JAR not found."
	echo "Use wget to get latest version from: "
	echo "https://repo1.maven.org/maven2/com/madgag/bfg/"
	exit -1
fi

if [ ! -f $BFG_JAR ];then
	echo "Aborting:  BFG Repo-Cleaner jar file $BFG_JAR not found."
	echo "Use wget to get latest version from: "
	echo "https://repo1.maven.org/maven2/com/madgag/bfg/"
	exit -1
fi



echo "Migration: $SRC_HOST:$SRC_ORG/${REPO} => $TARG_HOST/$TARG_ORG"
wrkingDir=$(realpath $PWD)
time_stamp=$(date +'%Y%m%d%H%m%s')

src_connect_log="${wrkingDir}/${REPO}.src_connect.${time_stamp}.log"

SRC_REPO_ID=""
if [ "$SRC_TYPE" = "GITLAB" ];then
	SRC_REPO_ID=$(curl -s -k --header "Authorization: Bearer ${SRC_TOKEN}" "https://${SRC_HOST}/api/v4/groups/${SRC_ORG}?per_page=1000"|jq '.projects[]|select(.path_with_namespace == "'$SRC_ORG/$REPO'").id') 2>>$src_connect_log
else
	SCR_REPO_ID=""
fi


if [ "$SRC_REPO_ID" = "" ];then
	echo "      Aborting: Unable to access '${SRC_HOST}:${SRC_ORG}/${REPO}'"
	if [ -r $src_connect_log ];then
		cat $src_connect_log |fold -w 80| sed 's+^+      +'
	fi
	exit -1
fi
echo "   - Confirmed git access '${SRC_HOST}:${SRC_ORG}/${REPO}'"
rm -f $src_connect_log

#Verify GitHub Access login
echo ${TARG_TOKEN}|gh auth login -h ${TARG_HOST} --with-token 2>/dev/null
if [ $? -ne 0 ];then
	echo "      Aborting: Unable to access '${TARG_HOST}' with git or GitHub CLI (gh)"
	exit -1
fi
echo "   - Confirmed Git and GitHub CLI (gh) access to '${TARG_HOST}'"

#Create or overright remote repo
target_repo_log="${wrkingDir}/${REPO}.target_repo.${time_stamp}.log"

gh repo view ${TARG_ORG}/${REPO} >> $target_repo_log 2>&1
if [ $? -eq 0 ];then
	echo "   - Deleting existing repo ${TARG_GIT_USER}@${TARG_HOST}:${TARG_ORG}/${REPO}"
	out=$(mktemp)
	curl -s -X DELETE \
		 -H "Accept: application/vnd.github.v3+json" \
		 -H "Authorization: token ${TARG_TOKEN}" \
		 https://${TARG_HOST}/api/v3/repos/${TARG_ORG}/${REPO} --output $out  >> $target_repo_log 2>&1
	if [ $(cat $out|wc -l) -ne 0 ];then
		echo "      Aborting: Failed to delete ${TARG_GIT_USER}@${TARG_HOST}:${TARG_ORG}/${REPO}"
		if [ -r $out ];then
			cat $out |fold -w 80 | sed 's+^+      +'
		fi
		exit -1
	fi
	rm -f $out

fi

echo "   - Creating repository '${TARG_HOST}:${TARG_ORG}/${REPO}'"
# Clean up for cloning
rm -r -f ${REPO}

#NB Sometimes hg repo create returns bac value even after successful creation
#So check with gh repo view

gh repo create -y  -t ${TARG_TEAM} --public ${TARG_ORG}/${REPO} >> $target_repo_log 2>&1
gh repo view ${TARG_ORG}/${REPO}  >> $target_repo_log 2>&1
if [ $? -ne 0 ];then
	echo "      Aborting '${REPO}' migration: Could not create '${TARG_HOST}:${TARG_ORG}/${REPO}'"
	if [ -r $target_repo_log ];then
		cat $target_repo_log |fold -w 80| sed 's+^+      +'
	fi
	exit -1
fi
rm -f $target_repo_log


echo "   - Creating local clone of '${SRC_HOST}:${SRC_ORG}/${REPO}'"
clone_log="${wrkingDir}/${REPO}.clone.${time_stamp}.log"

rm -f -r ${REPO}  # cleanup

mkdir ${REPO}
cd ${REPO}

git clone ${SRC_GIT_USER}@${SRC_HOST}:${SRC_ORG}/${REPO} .	>>$clone_log 2>&1
if [ $? -ne 0 ];then
	echo "      Aborting local clone of '${SRC_GIT_USER}@${SRC_HOST}:${SRC_ORG}/${REPO}'"
	if [ -r $clone_log ];then
		cat $clone_log |fold -w 80 | sed 's+^+      +'
	fi
	exit -1
fi

#Make sure we have all branches

( git branch -r | awk -F'origin/' '!/HEAD|master/{print $2 " " $1"origin/"$2}' | xargs -L 1 git branch -f --track && \
	  git fetch --all --prune --tags && git pull --all) 	>>$clone_log 2>&1

if [ $? -ne 0 ];then
	echo "      Aborting: Could not recover all branches of '${SRC_GIT_USER}@${SRC_HOST}:${SRC_ORG}/${REPO}'"
	if [ -r $clone_log ];then
		cat $clone_log |fold -w 80 | sed 's+^+      +'
	fi
	exit -1
fi
rm -f  $clone_log


lfs_log="${wrkingDir}/${REPO}.lsf.${time_stamp}.log"
git lfs install --local >> $lfs_log 2>&1
tracked="$(git lfs migrate info --everything --above=${size_cutoff}Mb 2> /dev/null |sed 's+\s.*++'|tr '\n' ' ' )"

if [ "$tracked" = "" ];then
	echo "   - LFS preprocessing skipped: no large (>${size_cutoff}MB) files found."
else
	echo "   - LFS  preprocessing using BFG on large (>${size_cutoff}MB) files."
	
	for branch in $(git branch -a|sed 's+^.* ++'|sed 's+^.*/++'|sort -u);do
		git checkout $branch >>$lfs_log 2>&1
		if [ $? -ne 0 ];then
			echo ""
			echo "       Aborting LFS migration on ${REPO}' branch '$branch': "
			echo "       LFS migration: unable to check out branch '$branch'."
			if [ -r $lfs_log ];then
				cat $lfs_log |fold -w 80| sed 's+^+      +'
			fi
			exit -1
		fi

		#Set up tracking and .gitattribute
		(git lfs track $tracked && \
			 git add .gitattributes && \
			 git commit -am "Adding .gitattributes" ) >> $lfs_log 2>&1
		if [ $? -ne 0 ];then
				echo ""
				echo "       Aborting LFS migration on ${REPO}' branch '$branch': "
				echo "       Unable to set up lfs tracking'."
				if [ -r $lfs_log ];then
					cat $lfs_log |fold -w 80| sed 's+^+      +'
				fi
				exit -1
		fi
	

		bfg_list="*.{$(echo "${tracked}"|sed 's+\*.++g'|sed 's+ +,+g')}"
		# Do BFG git to lfs conversion
		java -jar ${BFG_JAR} \
			 --convert-to-git-lfs $bfg_list --no-blob-protection $PWD >>$lfs_log 2>&1
		if [ $? -ne 0 ];then
			echo ""
			echo "       Aborting LFS migration on ${REPO}' branch '$branch': "
			echo "       java -jar ${BFG_JAR} failed"
			if [ -r $lfs_log ];then
				cat $lfs_log |fold -w 80| sed 's+^+      +'
			fi
			exit -1
		fi
		#Garbage collect
	(git reflog expire --expire=now --all  && \
		 git gc --prune=now --aggressive)  >> $lfs_log 2>&1
		if [ $? -ne 0 ];then
			echo "       Aborting LFS migration on ${REPO}' branch '$branch': "
			echog"       git clean/garbage collection failed."
			if [ -r $lfs_log ];then
				cat $lfs_log |fold -w 80| sed 's+^+      +'
			fi
			exit -1
		fi
	done
fi
rm -f $lfs_log

echo "   - Pushing to ${TARG_HOST}:${TARG_ORG}/${REPO}"
push_log="${wrkingDir}/${REPO}.push.${time_stamp}.log"
git remote add github "${TARG_GIT_USER}@${TARG_HOST}:${TARG_ORG}/${REPO}" 

git config lfs.https://${TARG_HOST}/${TARG_ORG}/${REPO}.git/info/lfs.locksverify true

git lfs push --all github >> $push_log 2>&1
if [ $? -ne 0 ];then
	echo "      Aborting 'git lfs push' failed:"
	if [ -r $push_log ];then
		cat $push_log |fold -w 80 | sed 's+^+      +'
	fi
	exit -1
fi

#Make sure all references work.
git lfs fetch --all github >> $push_log 2>&1
if [ $? -ne 0 ];then
	echo "      Aborting 'git lfs fetch' failed:"
	if [ -r $push_log ];then
		cat $push_log |fold -w 80 | sed 's+^+      +'
	fi
	exit -1
fi

#git push --force --mirror github >> $push_log 2>&1
git push --mirror --force  github >> $push_log 2>&1

if [ $? -ne 0 ];then
	echo "      Aborting 'git push --force --mirror' failed:"
	if [ -r $push_log ];then
		cat $push_log |fold -w 80 | sed 's+^+      +'
	fi
	exit -1
fi
set -xv

echo "   - Synching metadata (issues, pull requests, etc)"
if [ "$SRC_TYPE" = "GITLAB" ];then
	meta_log="${wrkingDir}/${REPO}.meta.${time_stamp}.log"
	cd "$METADATA_SYNC_HOME"
	npm install >> $meta_log 2>&1
	cat "$METADATA_SYNC_SETTING_TEMPLATE" \
		| sed 's+{{SRC_HOST}}+'$SRC_HOST'+'\
		| sed 's+{{TARG_HOST}}+'$TARG_HOST'+'\
		| sed 's+{{SRC_TOKEN}}+'$SRC_TOKEN'+'\
		| sed 's+{{TARG_TOKEN}}+'$TARG_TOKEN'+'\
		| sed 's+{{SRC_REPO_ID}}+'$SRC_REPO_ID'+'\
		| sed 's+{{SRC_ORG}}+'$SRC_ORG'+'\
		| sed 's+{{TARG_ORG}}+'$TARG_ORG'+'\
		| sed 's+{{REPO}}+'$REPO'+' >settings.ts
	
	npm run start >> $meta_log 2>&1
	
	if [ $? -ne 0 ];then
		if [ -r $meta_log ];then
			cat $meta_log |fold -w 80 | sed 's+^+      +'
		fi
		exit -1
	fi
	rm -f settings.ts
	rm -f $meta_log
	rm -f $push_log
else
	echo "    Skipping: Meta copy is not implemented fro GHITHUB."
fi

cd $wrkingDir
rm -f $src_connect_log
rm -f $target_repo_log
rm -f $clone_log
rm -f $lfs_log
rm -f $push_log
rm -f -r ${REPO}
rm -f -r ${REPO}.bfg-report
echo "Migration completed."
exit 0

