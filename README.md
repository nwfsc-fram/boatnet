# Boatnet

Boatnet provides a suite of tools for collecting fisheries scientific survey and observer monitoring data while aboard commercial, recreational, and NOAA vessels. These include a tablet app for observers and surveys to capture their haul-level catch information and a mobile app for captains to keep track of observer-monitored trips. 

For more details about each project, please refer to the [Wiki](https://github.com/nwfsc-fram/boatnet/wiki)

<p align="center">
  <img src="./img/FRAM_screenshot.PNG" alt="FRAM Screenshot"
       width="654" height="300">
</p>

For those only interested in running the project follow the [How to build and run](https://github.com/nwfsc-fram/boatnet#how-to-build-and-run) section and ignore the rest. The remaining sections are for development purposes only. Note: We are currently working on simplifying the process and in the future you can just download an executable and run the application.

Note that without a CouchDB, large sections of the application will not function correctly. We are working on releasing a test version of the CouchDB data.

## Projects

Please refer to the [Wiki](https://github.com/nwfsc-fram/boatnet/wiki) for project descriptions.
Boatnet contains multiple projects located in different directories.
Note that all of the projects are currently a work in progress!

### OPTECS (Observer Program Technology Enhanced Collection System)

**Directory**: apps/obs-wcgop-optecs

### Observer Mobile Apps

**Directory**: apps/obs-web

### Survey Applications

**Directory**: apps/surv-*

## How to build and run
Boatnet uses the lerna + yarn workspace monorepo pattern.

1. Install Node.js - download [here](https://nodejs.org/en/)

2. Install `yarn`
  * `npm install -g yarn`
  
     *NOAA Windows 10 Users may need to set a couple environment variables:*
     * in System Variables - ```Path``` add: ```C:\Users\\[User.Name]\AppData\Roaming\npm\```
     * in System Variables - ```NODE_PATH``` set to: ```C:\Users\\[User.Name]\AppData\Roaming\npm\```

3. (OPTIONAL) Install Visual Studio Code - download [here](https://code.visualstudio.com/) (We use and recommend this IDE for development)
<details><summary>OTHER OPTIONAL STEPS - Not recommended</summary>
<p>
  
* These are optional steps, not currently required.

* (OPTIONAL) Install node-gyp by launching visual studio code as administrator and running the following from a terminal (Ref: https://www.npmjs.com/package/node-gyp):
- Windows: `npm install -g windows-build-tools`
- Mac: Ensure read/write access to /usr/local/lib/node_modules/npm/node_modules then run `yarn global add node-gyp`

* (OPTIONAL) In windows, you should run the initial build from a Visual Studio command prompt. This will install packages specified in packages.json. (re-run when other devs add packages to packages.json)
</p>
</details>

4. Clone the repository: `git clone git@github.com:nwfsc-fram/boatnet.git`

1. Install `lerna` globally: `npm install -g lerna`

1. Run `lerna bootstrap` (runs npm install, builds single node_modules)

1. Run `lerna clean` (cleans node_modules in subfolders)

1. Run `lerna run build` (builds all apps and libraries. This is optional, but should be performed prior to pushing changes, to ensure all projects still build correctly.)

1. <b>When running the app locally, you'll need to run the dev-auth-server running in order to login. </b> Do this by following the instructions [here](https://github.com/nwfsc-fram/boatnet/blob/master/apps/dev-auth-server/README.md#setup)

1. Navigate to the project you need, e.g. `cd apps/example` and `yarn serve`

1. See more [specific `lerna` instructions and development setup here.](./docs/dev-notes/README.md)

## Troubleshooting Build Issues
Occasionally our lerna monorepo can get into a confused state. The following commands, performed in order, would be a good starting point to try and "reset" a corrupted environment:
```
# get latest yarn, lerna, and typescript
npm install -g yarn@latest
npm install -g lerna@latest
npm install -g typescript@latest
cd <your-path>/boatnet/
# get latest master branch (known good build)
git pull 
# clean the yarn cache - this has caused issues in the past occasionally (usually this is not required)
yarn cache clean
# remove the yarn.lock to ensure newest packages are acquired (usually this is not required)
rm yarn.lock
# now follow the normal build procedure
lerna bootstrap
lerna clean -y
lerna run build
cd apps/your-app
yarn serve
```
* Also, note that file permission issues (e.g. `EPERM`) usually can be resolved by closing and re-opening Visual Studio Code (and stopping all node.js processes.)
