# Boatnet

Boatnet provides a suite of tools for collecting fisheries scientific survey and observer monitoring data while aboard commercial, recreational, and NOAA vessels. These include a tablet app for observers and surveys to capture their haul-level catch information and a mobile app for captains to keep track of observer-monitored trips. You can find more details about each project in this [section](https://github.com/nwfsc-fram/boatnet#projects)

<p align="center">
  <img src="./img/FRAM_screenshot.PNG" alt="FRAM Screenshot"
       width="654" height="300">
</p>

For those only interested in running the project follow the [How to build and run](https://github.com/nwfsc-fram/boatnet#how-to-build-and-run) section and ignore the rest. The remaining sections are for development purposes only. Note: We are currently working on simplifying the process and in the future you can just download an executable and run the application.

## Projects

Boatnet contains multiple projects located in different directories. The different projects are listed below.

### OPTECS (Observer Program Technology Enhanced Collection System)

**Directory**: apps/obs-wcgop-optecs

A tablet application used by observers to log information about fish caught on board. Observers can record stats such as weight, count, species type, and much more. The data collected is used to estimate how many fish can be sustainably caught.

### Observer Mobile App

**Directory**: apps/obs-web

A mobile app for our observer program where captains can log their trips and then see whether they are selected for observer coverage or not.

### Survey

**Directory**: apps/surv-*

Survey applications

## How to build and run
Boatnet uses the lerna + yarn workspace monorepo pattern.

1. Install Node.js - download [here](https://nodejs.org/en/)

2. Install `yarn`
  * `npm install -g yarn`

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

1. Run `lerna run build` (builds all apps and libraries.)

1. Navigate to the project you need, e.g. `cd apps/example` and `yarn serve`

1. See more [specific `lerna` instructions and development setup here.](./docs/dev-notes/README.md)
