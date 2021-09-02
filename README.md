# Boatnet

Boatnet provides a suite of tools for collecting fisheries scientific survey and observer monitoring data while aboard commercial, recreational, and NOAA vessels. These include a tablet app for observers and surveys to capture their haul-level catch information and a mobile app for captains to keep track of observer-monitored trips. 

For more details about each project, please refer to the [Wiki](https://github.com/nwfsc-fram/boatnet/wiki)

<p align="center">
  <img src="./img/FRAM_screenshot.PNG" alt="FRAM Screenshot: Tally App">
</p>

For those only interested in running the project follow the [How to build and run](https://github.com/nwfsc-fram/boatnet#how-to-build-and-run) section and ignore the rest. The remaining sections are for development purposes only. Note: We are currently working on simplifying the process and in the future you can just download an executable and run the application.

Note that without a CouchDB, large sections of the application will not function correctly. We are working on releasing a test version of the CouchDB data.

## Projects

Please refer to the [Wiki](https://github.com/nwfsc-fram/boatnet/wiki) for project descriptions.
Also, see miscellaneous supporting [Docs](https://github.com/nwfsc-fram/boatnet/tree/master/docs).

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

1. Clone the repository: `git clone git@github.com:nwfsc-fram/boatnet.git`

1. Install `lerna` globally: `npm install -g lerna`

1. Run `lerna bootstrap` (runs npm install, builds single node_modules)

1. Run `lerna clean` (cleans node_modules in subfolders)

1. Run `lerna run build` (builds all apps and libraries. This is optional, but should be performed prior to pushing changes, to ensure all projects still build correctly.)

1. <b>When running the app locally, you'll need to run the dev-auth-server running in order to login. </b> Do this by following the instructions [here](https://github.com/nwfsc-fram/boatnet/blob/master/apps/dev-auth-server/README.md#setup)

1. Navigate to the project you need, e.g. `cd apps/example` and `yarn serve`

1. See more [specific `lerna` instructions, troubleshooting, and development setup here.](./docs/dev-notes/README.md)

## Additional Comments
