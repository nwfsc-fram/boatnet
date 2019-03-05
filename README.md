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

**Directory**: apps/obs-electron

A tablet application used by observers to log information about fish caught on board. Observers can record stats such as weight, count, species type, and much more. The data collected is used to estimate how many fish can be sustainably caught.

### Observer Mobile App

**Directory**: observer/obs-web

A mobile app for our observer program where captains can log their trips and then see whether they are selected for observer coverage or not.

### Survey

**Directory**: survey/surv-cutter

## How to build and run

1. Install Node.js - download [here](https://nodejs.org/en/)
2. (OPTIONAL) Install Visual Studio Code - download [here](https://code.visualstudio.com/) (We use and recommend this IDE for development)
3. (OPTIONAL) Install node-gyp by launching visual studio code as administrator and running the following from a terminal (Ref: https://www.npmjs.com/package/node-gyp):

- Windows: `yarn global add windows-build-tools`
- Mac: Ensure read/write access to /usr/local/lib/node_modules/npm/node_modules then run `yarn global add node-gyp`

4. Clone the repository: `git clone git@github.com:nwfsc-fram/boatnet.git`
5. Run `yarn install` from that directory. 
6. (OPTIONAL) In windows, you should run this from a Visual Studio command prompt. This will install packages specified in packages.json. (re-run when other devs add packages to packages.json)
7. Navigate to the project you need, e.g. `cd apps/dev-auth-proxy` and `npm run start` [TODO expand upon tihs when yarn workspaces are configured]

## Further Development Setup

- Generate keys as described in the link on this page and add them to your GitHub account under settings->SSH and GPG keys

  - https://github.com/settings/keys

- If you are using Sourcetree, you need to import this key in PuttyGen (as described in their docs) and save the private key in .ppk format. Then, open Pageant from systray and Add Key using the file.
- Use ssh for git clone, otherwise you'll be prompted for HTTPS authentication upon `git push`

```
git clone git@github.com:nwfsc-fram/boatnet.git
```

    #### Precommit hooks

- Install the [git-secrets plugin](https://github.com/awslabs/git-secrets) on your PC to prevent accidental commit of secure tokens to Git.

  - Windows

            $ git clone https://github.com/awslabs/git-secrets

            # With administrator assistance:
            Create dir C:\Program Files\Git\usr\local\bin
            Copy git-secrets/git-secrets script to C:\Program Files\Git\usr\local\bin\git-secrets

            Create dir C:\Program Files\Git\usr\local\share\man\man1
            Copy git-secrets/git-secrets.1 help file to C:\Program Files\Git\usr\local\share\man\man1\git-secrets.1

            # For Visual Studio Code Integration
            Copy git-secrets/git-secrets script to C:\Program Files\Git\cmd\git-secrets

  - MacOS & Linux

            $ git clone https://github.com/awslabs/git-secrets
            $ cd git-secrets

            # then run:  brew install git-secrets  (on Linux run: make install)

- Activate plugin (repeat this activation step, whenever you git clone a new working copy)

        $ git secrets --install --force   #install hooks, in this working copy
        $ git secrets --register-aws      #add additional AWS credential protection for this working copy

## Contributing Guidelines

1. Create your feature branch (`git checkout -b feature/fooBar`) and develop your changes.
2. Verify your formatting is correct using Prettify: (`npm run format`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
   Specific detailed instructions can be found [here](./CONTRIBUTING.md)

# Working with Yarn Workspaces
# [ Work in Progress ]


## Directory Descriptions
* `apps` Applications
* `libs` Libraries
* `tools` Tools

## Creating a new app, tool, or library
For Vue.js apps or libraries:
```
cd apps
vue create app-name
# or,
cd libs
vue create library-name

cd whatever-name
# ? vue add @o3o/packages
```
* Be sure to manually select features to specify TypeScript.

For plain ol' node.js apps/ tools etc:
```
mkdir [apps,libs,tools]/my-thing && cd [apps,libs,tools]/my-thing
yarn init -y
```

* Add cross-env and other dependencies to your new `package.json`:
```
{
  "name": "workspace-a",
  "version": "1.0.0",

  "dependencies": {
    "cross-env": "^5.2.0",
    "bn-auth": "1.0.0"
  }
}
```

* TODO these
https://medium.com/justfrontendthings/how-to-create-and-publish-your-own-vuejs-component-library-on-npm-using-vue-cli-28e60943eed3

https://medium.com/naresh-bhatia/sharing-ui-components-with-lerna-and-yarn-workspaces-be1ebca06efe

https://github.com/nareshbhatia/lerna-workspaces-concepts
