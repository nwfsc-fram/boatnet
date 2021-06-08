#!/usr/bin/env bash 

SCRIPT_HOME="$(realpath $(dirname $0))"
BFG_JAR="$SCRIPT_HOME/bfg.jar"
configFile=$HOME/.ssh/MigrationConfig

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

if [ $(git lfs --help >& /dev/null;echo $?) -ne 0 ];then
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

echo "GitLab to GitHub Migraton:"
echo "$GL_HOST:$GL_ORG/$repo => to $GH_HOST/$GH_ORG"
WrkingDir=$(realpath $PWD)
time_stamp=$(date +'%Y%m%d%H%m%s')

gl_connect_log="${WrkingDir}/${repo}.gl_connect.${time_stamp}.log"
touch $gl_connect_log
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
target_repo_log="${WrkingDir}/${repo}.target_repo.${time_stamp}.log"
touch $target_repo_log
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
rm -r -f $repo

gh repo create -y  -t ${GH_TEAM} --public ${GH_ORG}/$repo >> $target_repo_log  2>&1
#Sometimes hg repo create returns bac value even after successful creation
#So check with gh repo view
gh repo view ${GH_ORG}/$repo >> $target_repo_log 2>&1
if [ $? -ne 0 ];then
	echo "      Aborting '$repo' migration: Could not create '${GH_HOST}:${GH_ORG}/$repo'"
	if [ -r $target_repo_log ];then
		cat $target_repo_log |fold -w 80| sed 's+^+      +'
	fi
	exit -1
fi
rm -f $target_repo_log

# Clean up for cloning
echo "   - Creating local clone of '${GL_HOST}:${GL_ORG}/$repo'"
clone_log="${WrkingDir}/${repo}.clone.${time_stamp}.log"
touch $clone_log
rm -f -r $repo
git clone ${GL_GIT_USER}@${GL_HOST}:${GL_ORG}/$repo ${repo} >> $clone_log 2>&1
#git clone --mirror ${GL_GIT_USER}@${GL_HOST}:${GL_ORG}/$repo ${repo} >> $clone_log 2>&1
if [ $? -ne 0 ];then
	echo "      Aborting local clone of '${GL_GIT_USER}@${GL_HOST}:${GL_ORG}/$repo'"
	if [ -r $clone_log ];then
		cat $clone_log |fold -w 80 | sed 's+^+      +'
	fi
	exit -1
fi
rm -f  $clone_log

#check if we need lfs
cd "${repo}"
lfs_log="${WrkingDir}/${repo}.lsf.${time_stamp}.log"
touch $lfs_log

#lfs_array=($(git lfs migrate info --above 99Mb 2>/dev/null |sed 's+\s.*++'))
echo "   - LFS check and preprocessing using BFG on branch by branch"	
git lfs install >> lfs_log 2>&1
lsfBranches=0
lsfFiles=0
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
	
	lfs_array="$(find . -type f -size +99M 2> /dev/null|grep -v '\.git/'|sed 's+^./++')"
	# Only do this if we find large files
	if [ "$lfs_array" != "" ];then
		lsfBranches=$(( $lsfBranches + 1))
		
		#Set up .gitattributes
		for file in $lfs_array;do
			lsfFiles=$(($? + $lsfFiles))
			git lfs track $file >>$lfs_log 2>&1
			if [ $? -ne 0 ];then
				echo ""
				echo "       Aborting LFS migration on $repo' branch '$branch': "
				echo "       unable to track '$file'."
				if [ -r $lfs_log ];then
					cat $lfs_log |fold -w 80| sed 's+^+      +'
				fi
				exit -1
			fi
		done

		git add .gitattributes >& /dev/null
		git commit -am "Adding .gitattributes"  >& /dev/null

		# Do BFG git to lfs conversion
		for file in $lfs_array;do
			java -jar ${BFG_JAR} --convert-to-git-lfs $(basename $file) \
				 --no-blob-protection $PWD >>$lfs_log 2>&1
			if [ $? -ne 0 ];then
				echo ""
				echo "       Aborting LFS migration on $repo' branch '$branch': "
				echo "       java -jar ${BFG_JAR} failed"
				if [ -r $lfs_log ];then
					cat $lfs_log |fold -w 80| sed 's+^+      +'
				fi
				exit -1
			fi
		done
		git reflog expire --expire=now --all >>$lfs_log 2>&1 && \
			git gc --prune=now --aggressive  >> $lfs_log 2>&1
		if [ $? -ne 0 ];then
			echo "       Aborting LFS migration on $repo' branch '$branch': "
			echog"       git clean/garbage collection failed."
			if [ -r $lfs_log ];then
				cat $lfs_log |fold -w 80| sed 's+^+      +'
			fi
			exit -1
		fi
	fi
done
rm -f $lfs_log


echo "   - Pushing to ${GH_HOST}:${GH_ORG}/$repo"
push_log="${WrkingDir}/${repo}.push.${time_stamp}.log"
touch $push_log
git remote add $repo "${GH_GIT_USER}@${GH_HOST}:${GH_ORG}/$repo" >> $push_log 2>&1
git config lfs.https://${GH_HOST}/${GH_ORG}/${repo}.git/info/lfs.locksverify true

git lfs push --all $repo >> $push_log 2>&1
if [ $? -ne 0 ];then
	echo "      Aborting 'git lfs push' failed:"
	if [ -r $push_log ];then
		cat $push_log |fold -w 80 | sed 's+^+      +'
	fi
	exit -1
fi

git lfs fetch --all $repo >> $push_log 2>&1
if [ $? -ne 0 ];then
	echo "      Aborting 'git lfs fetch' failed:"
	if [ -r $push_log ];then
		cat $push_log |fold -w 80 | sed 's+^+      +'
	fi
	exit -1
fi


#git push --force --mirror $repo >> $push_log 2>&1
git push --force  $repo >> $push_log 2>&1
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
rm -f -r $repo
rm -f -r $repo.bfg-report
echo "Migration completed."
exit 0

#--#	lfs_list="$(IFS=, ; echo "${lfs_array[*]}"|sed 's+\*\.++g')"
#--   
#--	echo "   - LFS preprocessing using BFG on '$lfs_list' files."	
#--	git lfs install >> lfs_log 2>&1
#--	if [ $? -ne 0 ];then
#--		echo "      Aborting '$repo' LFS migration: git lfs install failed."
#--		if [ -r $lfs_log ];then
#--			cat $lfs_log |fold -w 80| sed 's+^+      +'
#--		fi
#--		exit -1
#--	fi
#--	
#--
#--	java -jar ${BFG_JAR} --convert-to-git-lfs "*.{$lfs_list}" --no-blob-protection $PWD >>$lfs_log 2>&1
#--	if [ $? -ne 0 ];then
#--		echo "      Aborting '$repo' LFS migration: executing  bfg.jar failed."
#--		if [ -r $lfs_log ];then
#--			cat $lfs_log |fold -w 80| sed 's+^+      +'
#--		fi
#--		exit -1
#--	fi
#--	
#--	 git reflog expire --expire=now --all && git gc --prune=now --aggressive  >> $lfs_log 2>&1
#--	if [ $? -ne 0 ];then
#--		echo "      Aborting '$repo' LFS migration: git clean/garbage collection failed."
#--		if [ -r $lfs_log ];then
#--			cat $lfs_log |fold -w 80| sed 's+^+      +'
#--		fi
#--		exit -1
#--	fi
#--fi
#--
#--
#--lfs_list=(git lfs migrate info --above 99Mb 2>/dev/null|sed 's+\s.*++'|sed 's+^\*.++'))
#--if [  ${#lfs_list[@]} -eq 0 ];then
#--	echo "   - No Large files found: Skipping LFS preprocessing using BFG"
#--else
#--	lfs_list="$(IFS=, ; echo "${lfs_list[*]}")"
#--	echo "   - LFS preprocessing using BFG on $lfs_list files."	
#--	check=0
#--	
#--	java -jar ${BFG_JAR} --convert-to-git-lfs "*.{$lfs_list}" \
#--		 --no-blob-protection $PWD >> $lfs_log 2>&1
#--	check=$?
#--	git reflog expire --expire=now --all && git gc --prune=now --aggressive >> $lfs_log 2>&1
#--	check=$(($? + $check))
#--	if [ $check -ne 0 ];then
#--		echo "      Aborting '$repo' migration: Migrating to LFS using BFG failed"
#--		if [ -r $lfs_log ];then
#--			cat $lfs_log |fold -w 80| sed 's+^+      +'
#--		fi
#--		exit -1
#--	fi
#--fi
#--
#--
