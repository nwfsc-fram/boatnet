# Boatnet 
Boatnet provides a suite of tools for collecting fisheries scientific survey and observer monitoring data while aboard commercial, recreational, and NOAA vessels. These include a tablet app for observers and surveys to capture their haul-level catch information and a mobile app for captains to keep track of observer-monitored trips. You can find more details about each project in this [section](https://github.com/nwfsc-fram/boatnet#projects)

<p align="center">
  <img src="./img/FRAM_screenshot.PNG" alt="FRAM Screenshot"
       width="654" height="300">
</p>

For those only interested in running the project follow the [How to build and run](https://github.com/nwfsc-fram/boatnet#how-to-build-and-run) section and ignore the rest. The remaining sections are for development purposes only. Note: We are currently working on simplifying the process and in the future you can just download an executable and run the application.

## Projects 
Boatnet contains multiple projects located in different directories. The different projects are listed below. 

### Observer Tablet
__Directory__: observer/obs-electron 

A tablet application used by observers to log information about fish caught on board. Observers can record stats such as weight, count, species type, and much more. The data collected is used to estimate how many fish can be sustainably caught. 

### Observer Mobile App
__Directory__: observer/obs-web

A mobile app for our observer program where captains can log their trips and then see whether they are selected for observer coverage or not. 

### Survey 
__Directory__: survey/surv-cutter

## How to build and run
1) Install Node.js - download [here](https://nodejs.org/en/)
2) Clone the repository - git clone git@github.com:nwfsc-fram/boatnet.git
3) Navigate to the directory of the project you wish to run
4) Run `npm install` from that directory. This will install packages specified in packages.json. (re-run when other devs add packages to packages.json)
5) Run `ng serve` then navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Development Setup
* Generate keys as described in the link on this page and add them to your GitHub account under settings->SSH and GPG keys
  * https://github.com/settings/keys

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

            # For Visual Studio Code Integration
            Copy git-secrets/git-secrets script to C:\Program Files\Git\cmd\git-secrets

  * MacOS & Linux

            $ git clone https://github.com/awslabs/git-secrets
            $ cd git-secrets
            
            # then run:  brew install git-secrets  (on Linux run: make install)

* Activate plugin (repeat this activation step, whenever you git clone a new working copy)

        $ git secrets --install --force   #install hooks, in this working copy
        $ git secrets --register-aws      #add additional AWS credential protection for this working copy

## Contributing Guidelines
1. Create your feature branch (`git checkout -b feature/fooBar`)
2. Commit your changes (`git commit -am 'Add some fooBar'`)
3. Push to the branch (`git push origin feature/fooBar`)
4. Create a new Pull Request
More detailed insturctions can be found [here](./CONTRIBUTING.md)

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
