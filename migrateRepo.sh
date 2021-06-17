#!/usr/bin/env bash 

SCRIPT_HOME="$(realpath $(dirname $0))"
BFG_JAR="$SCRIPT_HOME/bfg.jar"
configFile=$HOME/.ssh/MigrationConfig
size_cutoff=49 # max size in MB before we need to lfs.

if [ "$#" -ne 1 ];then
	echo "Usage: $(basename $0) [repository_name]"
	echo "       Migrates a repository from GitLab to GitHub."
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

if [ hash gh >& /dev/null ];then
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


if [ ! -f $BFG_JAR ];then
	echo "Aborting:  BFG Repo-Cleaner jar file $BFG_JAR not found."
	echo "Use wget to get latest version from: "
	echo "https://repo1.maven.org/maven2/com/madgag/bfg/"
	exit -1
fi



echo "Migration: $GL_HOST:$GL_ORG/$repo => $GH_HOST/$GH_ORG"
wrkingDir=$(realpath $PWD)
time_stamp=$(date +'%Y%m%d%H%m%s')

gl_connect_log="${wrkingDir}/${repo}.gl_connect.${time_stamp}.log"

git ls-remote ${GL_GIT_USER}@${GL_HOST}:${GL_ORG}/$repo >> $gl_connect_log 2>&1
if [ $? -ne 0 ];then
	echo "      Aborting: Unable to access '${GL_HOST}:${GL_ORG}/$repo' as '${GL_GIT_USER}'"
	if [ -r $gl_connect_log ];then
		cat $gl_connect_log |fold -w 80| sed 's+^+      +'
	fi
	exit -1
fi
echo "   - Confirmed git access '${GL_HOST}:${GL_ORG}/$repo'"
rm -f $gl_connect_log

#Verify GitHub Access login
echo ${GH_TOKEN}|gh auth login -h ${GH_HOST} --with-token
if [ $? -ne 0 ];then
	echo "      Aborting: Unable to access '${GH_HOST}' with git or GitHub CLI (gh)"
	exit -1
fi
echo "   - Confirmed Git and GitHub CLI (gh) access to '${GH_HOST}'"

#Create or overright remote repo
target_repo_log="${wrkingDir}/${repo}.target_repo.${time_stamp}.log"

gh repo view ${GH_ORG}/$repo >> $target_repo_log 2>&1
if [ $? -eq 0 ];then
	echo "   - Deleting existing repo ${GH_GIT_USER}@${GH_HOST}:${GH_ORG}/$repo"
	out=$(mktemp)
	curl -s -X DELETE \
		 -H "Accept: application/vnd.github.v3+json" \
		 -H "Authorization: token ${GH_TOKEN}" \
		 https://${GH_HOST}/api/v3/repos/${GH_ORG}/$repo --output $out  >> $target_repo_log 2>&1
	if [ $(cat $out|wc -l) -ne 0 ];then
		echo "      Aborting: Failed to delete ${GH_GIT_USER}@${GH_HOST}:${GH_ORG}/$repo"
		if [ -r $out ];then
			cat $out |fold -w 80 | sed 's+^+      +'
		fi
		exit -1
	fi
	rm $out

fi

echo "   - Creating repository '${GH_HOST}:${GH_ORG}/$repo'"
# Clean up for cloning
rm -r -f $repo

#NB Sometimes hg repo create returns bac value even after successful creation
#So check with gh repo view

gh repo create -y  -t ${GH_TEAM} --public ${GH_ORG}/$repo >> $target_repo_log 2>&1
gh repo view ${GH_ORG}/$repo  >> $target_repo_log 2>&1
if [ $? -ne 0 ];then
	echo "      Aborting '$repo' migration: Could not create '${GH_HOST}:${GH_ORG}/$repo'"
	if [ -r $target_repo_log ];then
		cat $target_repo_log |fold -w 80| sed 's+^+      +'
	fi
	exit -1
fi
rm -f $target_repo_log


echo "   - Creating local clone of '${GL_HOST}:${GL_ORG}/$repo'"
clone_log="${wrkingDir}/${repo}.clone.${time_stamp}.log"

rm -f -r $repo  # cleanup

mkdir $repo
cd $repo

git clone ${GL_GIT_USER}@${GL_HOST}:${GL_ORG}/$repo .	>>$clone_log 2>&1
if [ $? -ne 0 ];then
	echo "      Aborting local clone of '${GL_GIT_USER}@${GL_HOST}:${GL_ORG}/$repo'"
	if [ -r $clone_log ];then
		cat $clone_log |fold -w 80 | sed 's+^+      +'
	fi
	exit -1
fi

#Make sure we have all branches

( git branch -r | awk -F'origin/' '!/HEAD|master/{print $2 " " $1"origin/"$2}' | xargs -L 1 git branch -f --track && \
	  git fetch --all --prune --tags && git pull --all) 	>>$clone_log 2>&1

if [ $? -ne 0 ];then
	echo "      Aborting: Could not recover all branches of '${GL_GIT_USER}@${GL_HOST}:${GL_ORG}/$repo'"
	if [ -r $clone_log ];then
		cat $clone_log |fold -w 80 | sed 's+^+      +'
	fi
	exit -1
fi
rm -f  $clone_log


# Protect origin from accidents, and create a purely local repo, which helps lfs
git remote remove origin 
#check if we need lfs 
lfs_log="${wrkingDir}/${repo}.lsf.${time_stamp}.log"

git lfs install --local >> $lfs_log 2>&1
set -xv
tracked="$(git lfs migrate info --above=49Mb 2> /dev/null |sed 's+\s.*++'|tr '\n' ' ' )"

if [ "$tracked" = "" ];then
	echo "   - LFS preprocessing skipped: no large (>${size_cutoff}MB) files found."
else
	echo "   - LFS  preprocessing using BFG on large (>${size_cutoff}MB) files."
	
	for branch in $(git branch -a|sed 's+^.* ++'|sed 's+^.*/++'|sort -u);do
		git checkout $branch >>$lfs_log 2>&1
		if [ $? -ne 0 ];then
			echo ""
			echo "       Aborting LFS migration on $repo' branch '$branch': "
			echo "       LFS migration: unable to check out branch."
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
				echo "       Aborting LFS migration on $repo' branch '$branch': "
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
			echo "       Aborting LFS migration on $repo' branch '$branch': "
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
			echo "       Aborting LFS migration on $repo' branch '$branch': "
			echog"       git clean/garbage collection failed."
			if [ -r $lfs_log ];then
				cat $lfs_log |fold -w 80| sed 's+^+      +'
			fi
			exit -1
		fi
	done
fi
set +xv
rm -f $lfs_log

echo "   - Pushing to ${GH_HOST}:${GH_ORG}/$repo"
push_log="${wrkingDir}/${repo}.push.${time_stamp}.log"
git remote add gitlab "${GL_GIT_USER}@${GL_HOST}:${GL_ORG}/$repo"
git remote add github "${GH_GIT_USER}@${GH_HOST}:${GH_ORG}/$repo" 

git config lfs.https://${GH_HOST}/${GH_ORG}/${repo}.git/info/lfs.locksverify true

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
rm -f $push_log
cd $wrkingDir
rm -f $gl_connect_log
rm -f $target_repo_log
rm -f $clone_log
rm -f $lfs_log
rm -f $push_log
#rm -f -r $repo
#rm -f -r $repo.bfg-report
echo "Migration completed."
exit 0

