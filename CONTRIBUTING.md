* We use feature branches and Gitlab/ github.com merge requests to handle workflow (instead of just committing straight to master.) This should help us all out for brief code reviews, learning, and not breaking master.
* Example for a ticket, FIELD-123: Add xyz Component
  * `git checkout master && git pull` newest master 
  * `git checkout -b FIELD-123_Add_xyz_component` Create new branch and check it out
  * `git push --set-upstream origin FIELD-123_Add_xyz_component` track your new branch upstream, so git push works. (Or add this when you do your push)
  * Make code changes/ additions, `git add <files changed/ added>`, `git commit -m 'Observer FIELD-123: Add xyz Component'`
  * `git push`
  * Go to Gitlab, login, create Merge Request on your branch, assign to coworker for review
  * Check "Remove source branch when merged"
  * Review, reviewer then clicks "Merge" and branch should be merged and closed. If there are merge issues, follow gitlab instructions.
* https://docs.gitlab.com/ee/gitlab-basics/add-merge-request.html

## Rebasing from master into your branch
* To update to newest code, or before you submit your branch for a merge request, 
* commit or git stash your changes, then

`git checkout master`

`git pull`

`git checkout your-branch`

`git rebase master`

* Follow prompts if there are merge conflicts. If you don't want to merge/ don't care about your version of a file:
`git checkout --theirs whatever_file.ts`  
  * which will wipe out your changes
`git checkout --ours whatever_file.ts`  
  * which will wipe out their changes
* For each manually merged file:
`git add merged_by_me_file.xyz`
`git rebase --continue`
* Then if you stashed your changes,
`git stash pop`
