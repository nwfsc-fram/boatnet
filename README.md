# Boatnet 
Boatnet enables fishing boats to log information about their catch. The crew can log a variety of information including weight, count, and species data that is then pushed to a common database. This data is used by NOAA scientists to estimate how many fish can be sustainably caught. Boatnet curerntly supports two types of data collection methods surveys and observers. 

<p align="center">
  <img src="./img/FRAM_screenshot.png" alt="FRAM Screenshot"
       width="654" height="300">
</p>

## Development Setup
* Generate keys as described in the link on this page and add them to your GitHub account under settings->SSH and GPG keys
  * https://nwcgit.nwfsc.noaa.gov/profile/keys

* If you are using Sourcetree, you need to import this key in PuttyGen (as described in their docs) and save the private key in .ppk format. Then, open Pageant from systray and Add Key using the file.
* Use ssh for git clone, otherwise you'll be prompted for HTTPS authentication upon `git push`
```
git clone git@github.com:nwfsc-fram/boatnet.git
```
* Since nwcgit is using a self-signed certificate, you'll have to disable sslVerify to access it:

        $ git pull
        fatal: unable to access 'https://github.com/nwfsc-fram/boatnet.git':
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

## Deployment
Boatnet contains multiple projects located in different directories. In order to build and run a project you must navigate to the directory where your project resides. The different projects and a path to their directory are listed below some also list a README link to more info. 

### Observer
* observer/obs-electron - [README](./observer/obs-electron/README.md) A tablet application used by observers to log information. 
* observer/obs-web - A progressive web app used to assign people to boats. 

### Survey 
General info [README](survey/README.md)
* survey/surv-cutter -

### Deployment Steps
1) Navigate to one of the directories
2) Run `npm install` which will install packages specified in packages.json. (re-run when other devs add packages to packages.json)
3) Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Contributing Guidelines
1. Create your feature branch (`git checkout -b feature/fooBar`)
2. Commit your changes (`git commit -am 'Add some fooBar'`)
3. Push to the branch (`git push origin feature/fooBar`)
4. Create a new Pull Request
More detailed insturctions can be found [here](./CONTRIBUTING.md)

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).



