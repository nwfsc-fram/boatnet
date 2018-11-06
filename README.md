# Boatnet - General Configuration Notes
Node.js Project setup

### Contents
* [Upgrading Angular](#upgrade-angular-5-to-angular-6-environment)
* [Basic Development Workflow](#basic-development-workflow)
* [Rebasing](#rebasing-from-master-into-your-branch)
* [Git configuration](#git-configuration)
  * [Git - Precommit hooks](#precommit-hooks)
* [Windows 10 configuration](#configuration-on-windows-10-node-npm-etc)

## Install Argon2 node module on Windows 10
* Requires Visual Studio 2017 C++/CLI Components installed
* From Administrator command line:
```
npm install --global --production windows-build-tools
```
* If you get an error about missing C:\Microsoft.Cpp.Default.Props, run "npm install" from a VS 2017 developer command prompt.

## TODO instructions for external internal dependencies

## Basic Development Workflow

* We are using feature branches and Gitlab/ github.com merge requests to handle workflow (instead of just committing straight to master.) This should help us all out for brief code reviews, learning, and not breaking master.
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


## Git configuration
# TODO: Update for github.com

* Generate keys as described in the link on this page:
  * https://nwcgit.nwfsc.noaa.gov/profile/keys
* If you are using Sourcetree, you need to import this key in PuttyGen (as described in their docs) and save the private key in .ppk format. Then, open Pageant from systray and Add Key using the file.
* Use ssh for git clone, otherwise you'll be prompted for HTTPS authentication upon `git push`
  * e.g. `git clone git@nwcgit.nwfsc.noaa.gov:fram-data/boatnet.git`
* Since nwcgit is using a self-signed certificate, you'll have to disable sslVerify to access it:

        $ git pull
        fatal: unable to access 'https://nwcgit.nwfsc.noaa.gov/fram-data/boatnet.git/':
         SSL certificate problem: unable to get local issuer certificate
        
        $ git config --global http.sslVerify false
        
        $ git pull
        Updating 32660ad..c05cf24
        Fast-forward
        ... working ...

    #### Precommit hooks
* Install the [git-secrets plugin](https://github.com/awslabs/git-secrets) on your PC to prevent accidental commit of secure tokens to Git.
  * Windows

            $ git clone https://github.com/awslabs/git-secrets
            
            # With administrator assistance:
            Create dir C:\Program Files\Git\usr\local\bin
            Copy git-secrets/git-secrets script to C:\Program Files\Git\usr\local\bin\git-secrets
            
            Create dir C:\Program Files\Git\usr\local\share\man\man1
            Copy git-secrets/git-secrets.1 help file to C:\Program Files\Git\usr\local\share\man\man1\git-secrets.1

  * MacOS & Linux

            $ git clone https://github.com/awslabs/git-secrets
            $ cd git-secrets
            
            # then run:  brew install git-secrets  (on Linux run: make install)

* Activate plugin (repeat this activation step, whenever you git clone a new working copy)

        $ git secrets --install --force   #install hooks, in this working copy
        $ git secrets --register-aws      #add additional AWS credential protection for this working copy
