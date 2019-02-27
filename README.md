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
2. Install Visual Studio Code - download [here](https://code.visualstudio.com/) (We use and recommend this IDE for development)
3. Install node-gyp by launching visual studio code as administrator and running the following from a terminal (Ref: https://www.npmjs.com/package/node-gyp):

- Windows: `npm install --global --production windows-build-tools`
- Mac: Ensure read/write access to /usr/local/lib/node_modules/npm/node_modules then run `npm install -g node-gyp`

4. Clone the repository: `git clone git@github.com:nwfsc-fram/boatnet.git`
5. Navigate to the `workspace` directory. This is a nrwl nx workspace.
6. Run `npm install` from that directory. In windows, you should run this from a Visual Studio command prompt. This will install packages specified in packages.json. (re-run when other devs add packages to packages.json)
   (optional) Run `npm run postinstall` which patches a bug in `electron` if you are building `obs-electron`.
7. Run `ng serve <app name>` and open a browser at `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

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

## Using nwrl Nx Workspace (@nrwl/schematics)

This project uses the Nx workspace tool from nrwl to make use of the "monorepo" development environment.

All boatnet apps, libs, and tools are moved to the 'workspace' directory.

- Overview: https://nx.dev/getting-started/what-is-nx
- Install Nx schematics globally `npm install -g @nrwl/schematics'
- For boatnet specific use of the nx tools, see [this README.](./workspace/README.md)

## Contributing Guidelines

1. Create your feature branch (`git checkout -b feature/fooBar`) and develop your changes.
2. Verify your formatting is correct using Prettify: (`npm run format`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
   Specific detailed instructions can be found [here](./CONTRIBUTING.md)

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
