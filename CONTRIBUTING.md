- We use feature branches and Gitlab/ github.com merge requests to handle workflow (instead of just committing straight to master.) This should help us all out for brief code reviews, learning, and not breaking master.
- Example for a ticket, FIELD-123: Add xyz Component  [You can do all of this in Visual Studio Code, but here's the cmd line version]
  - `git checkout master && git pull` newest master
  - `git checkout -b FIELD-123_Add_xyz_component` Create new branch and check it out
  - `git push --set-upstream origin FIELD-123_Add_xyz_component` track your new branch upstream, so git push works. (Or add this when you do your push)
  - Make code changes/ additions, `git add <files changed/ added>`, `git commit -m 'Observer FIELD-123: Add xyz Component'`
  - Make sure your code passes lint checks and everything else builds correctly: `lerna run build`
  - `git push`
  - Go to Gitlab, login, create Merge Request on your branch, and create a Code Review request to coworker for review/approval, if you feel it's useful
  - Clicks "Merge Branch" and branch should be merged, and the option to Delete Branch (usually you do want to do this.) If there are merge issues, follow github/gitlab instructions.

## Rebasing from master into your branch

- To update to newest code, or before you submit your branch for a merge request,
- `commit` or `git stash` your changes, then

`git checkout master`

`git pull`

`git checkout your-branch`

- You can either merge:
`git merge master`
  - This is the only option if you've already push your changes to github.

- Or, rebase, which will fast-forward your changes as if they were made on top of the current code. This reduces the number of your commits:
`git rebase master`

- Follow prompts if there are merge conflicts. Visual studio code has a good UI which will help you perform merge conflict resolution.
If you don't want to merge/ don't care about your version of a file:
  `git checkout --theirs whatever_file.ts`
  - which will wipe out your changes
    `git checkout --ours whatever_file.ts`
  - which will wipe out their changes
- For each manually merged file:
  `git add merged_by_me_file.xyz`
  `git rebase --continue`
  
- Then if you stashed your changes,
  `git stash pop`

## After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes from the main (upstream) repository:

- Delete the remote branch on GitHub either through the GitHub web UI or locally
  `git push origin --delete my-branch`
- Check out the master branch:
  `git checkout master`
- Update your master with the latest upstream version:
  `git pull`
- Delete the local branch:
  `git branch -D my-fix-branch`  
- Stop tracking the remote branch:
  `git branch -d -r origin/my-fix-branch`

