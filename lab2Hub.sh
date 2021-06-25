#!/usr/bin/env bash 

SCRIPT_HOME="$(realpath $(dirname $0))"
BFG_JAR="$SCRIPT_HOME/bfg.jar"
METADATA_SYNC_HOME="$SCRIPT_HOME/node-gitlab-2-github"
METADATA_SYNC_SETTING_TEMPLATE="$SCRIPT_HOME/meta_sync_setting_template.ts"
configFile=$HOME/.ssh/MigrationConfig
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
elif [ "$(stat -c '%a' $configFile)" != "600" ];then
	echo "Aborting: Bad permissions on '$configFile' ($(stat -c '%a' $configFile))"
	echo "          Set permissions to '600'"
	exit -1
else
	. $configFile
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



echo "Migration: $GL_HOST:$GL_ORG/${REPO} => $GH_ENT_HOST/$GH_ENT_ORG"
wrkingDir=$(realpath $PWD)
time_stamp=$(date +'%Y%m%d%H%m%s')

gl_connect_log="${wrkingDir}/${REPO}.gl_connect.${time_stamp}.log"
GL_REPO_ID=$(curl -s -k --header "Authorization: Bearer ${GL_TOKEN}" "https://nwcgit.nwfsc.noaa.gov/api/v4/groups/${GL_ORG}?per_page=1000"|jq '.projects[]|select(.path_with_namespace == "'$GL_ORG/$REPO'").id') 2>>$gl_connect_log

#git ls-remote ${GL_GIT_USER}@${GL_HOST}:${GL_ORG}/${REPO} >> $gl_connect_log 2>&1
if [ "$GL_REPO_ID" = "" ];then
	echo "      Aborting: Unable to access '${GL_HOST}:${GL_ORG}/${REPO}'"
	if [ -r $gl_connect_log ];then
		cat $gl_connect_log |fold -w 80| sed 's+^+      +'
	fi
	exit -1
fi
echo "   - Confirmed git access '${GL_HOST}:${GL_ORG}/${REPO}'"
rm -f $gl_connect_log

#Verify GitHub Access login
echo ${GH_ENT_TOKEN}|gh auth login -h ${GH_ENT_HOST} --with-token 2>/dev/null
if [ $? -ne 0 ];then
	echo "      Aborting: Unable to access '${GH_ENT_HOST}' with git or GitHub CLI (gh)"
	exit -1
fi
echo "   - Confirmed Git and GitHub CLI (gh) access to '${GH_ENT_HOST}'"

#Create or overright remote repo
target_repo_log="${wrkingDir}/${REPO}.target_repo.${time_stamp}.log"

gh repo view ${GH_ENT_ORG}/${REPO} >> $target_repo_log 2>&1
if [ $? -eq 0 ];then
	echo "   - Deleting existing repo ${GH_ENT_GIT_USER}@${GH_ENT_HOST}:${GH_ENT_ORG}/${REPO}"
	out=$(mktemp)
	curl -s -X DELETE \
		 -H "Accept: application/vnd.github.v3+json" \
		 -H "Authorization: token ${GH_ENT_TOKEN}" \
		 https://${GH_ENT_HOST}/api/v3/repos/${GH_ENT_ORG}/${REPO} --output $out  >> $target_repo_log 2>&1
	if [ $(cat $out|wc -l) -ne 0 ];then
		echo "      Aborting: Failed to delete ${GH_ENT_GIT_USER}@${GH_ENT_HOST}:${GH_ENT_ORG}/${REPO}"
		if [ -r $out ];then
			cat $out |fold -w 80 | sed 's+^+      +'
		fi
		exit -1
	fi
	rm -f $out

fi

echo "   - Creating repository '${GH_ENT_HOST}:${GH_ENT_ORG}/${REPO}'"
# Clean up for cloning
rm -r -f ${REPO}

#NB Sometimes hg repo create returns bac value even after successful creation
#So check with gh repo view

gh repo create -y  -t ${GH_ENT_TEAM} --public ${GH_ENT_ORG}/${REPO} >> $target_repo_log 2>&1
gh repo view ${GH_ENT_ORG}/${REPO}  >> $target_repo_log 2>&1
if [ $? -ne 0 ];then
	echo "      Aborting '${REPO}' migration: Could not create '${GH_ENT_HOST}:${GH_ENT_ORG}/${REPO}'"
	if [ -r $target_repo_log ];then
		cat $target_repo_log |fold -w 80| sed 's+^+      +'
	fi
	exit -1
fi
rm -f $target_repo_log


echo "   - Creating local clone of '${GL_HOST}:${GL_ORG}/${REPO}'"
clone_log="${wrkingDir}/${REPO}.clone.${time_stamp}.log"

rm -f -r ${REPO}  # cleanup

mkdir ${REPO}
cd ${REPO}

git clone ${GL_GIT_USER}@${GL_HOST}:${GL_ORG}/${REPO} .	>>$clone_log 2>&1
if [ $? -ne 0 ];then
	echo "      Aborting local clone of '${GL_GIT_USER}@${GL_HOST}:${GL_ORG}/${REPO}'"
	if [ -r $clone_log ];then
		cat $clone_log |fold -w 80 | sed 's+^+      +'
	fi
	exit -1
fi

#Make sure we have all branches

( git branch -r | awk -F'origin/' '!/HEAD|master/{print $2 " " $1"origin/"$2}' | xargs -L 1 git branch -f --track && \
	  git fetch --all --prune --tags && git pull --all) 	>>$clone_log 2>&1

if [ $? -ne 0 ];then
	echo "      Aborting: Could not recover all branches of '${GL_GIT_USER}@${GL_HOST}:${GL_ORG}/${REPO}'"
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

echo "   - Pushing to ${GH_ENT_HOST}:${GH_ENT_ORG}/${REPO}"
push_log="${wrkingDir}/${REPO}.push.${time_stamp}.log"
git remote add github "${GH_ENT_GIT_USER}@${GH_ENT_HOST}:${GH_ENT_ORG}/${REPO}" 

git config lfs.https://${GH_ENT_HOST}/${GH_ENT_ORG}/${REPO}.git/info/lfs.locksverify true

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
echo "   - Synching metadata (issues, pull requests, etc)"
meta_log="${wrkingDir}/${REPO}.meta.${time_stamp}.log"
cd "$METADATA_SYNC_HOME"
npm install >> $meta_log 2>&1
cat "$METADATA_SYNC_SETTING_TEMPLATE" \
	| sed 's+{{GL_HOST}}+'$GL_HOST'+'\
	| sed 's+{{GH_HOST}}+'$GH_ENT_HOST'+'\
	| sed 's+{{GL_TOKEN}}+'$GL_TOKEN'+'\
	| sed 's+{{GH_TOKEN}}+'$GH_ENT_TOKEN'+'\
	| sed 's+{{GL_REPO_ID}}+'$GL_REPO_ID'+'\
	| sed 's+{{GL_ORG}}+'$GL_ORG'+'\
	| sed 's+{{GH_ORG}}+'$GH_ENT_ORG'+'\
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
cd $wrkingDir
rm -f $gl_connect_log
rm -f $target_repo_log
rm -f $clone_log
rm -f $lfs_log
rm -f $push_log
rm -f -r ${REPO}
rm -f -r ${REPO}.bfg-report
echo "Migration completed."
exit 0

