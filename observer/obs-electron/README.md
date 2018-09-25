# ObserverElectron
"Hybrid" web-based and electron app.

All potentially sensitive (authentication) code is in a private repository - this code may not compile completely without it.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.3.

## Install node packages
Run `npm install` which will install packages specified in packages.json. (re-run when other devs add packages to packages.json)

## Development - Web Based
* If losing the electron capabilities is OK, you can develop and serve the pages via:
`ng serve`
as if this was a normal electron app.

## Development - Electron Based

### Development - Build and Run Electron
Run `npm run electron-build-run` for an electron dev build, or `npm run electron-build-prod` for an optimized production build. Refer to `package.json` for various scripts available.

### Two terminal development
Alternatively, in one terminal, I run `npm run build-watch`, and in another, `npm run electron`. This auto-recompiles on code changes, although have to ctrl-R to refresh the electron app to see updates. [TODO: fix if not working]


## Build Electron distribution
`npm run electron-package-fast`

## Access to Electron shell
* Refer to docs at https://github.com/ThorstenHans/ngx-electron
* `ElectronService` is injected in `app.component.ts` for electron service access examples

## Running unit tests
# TODO - Passing tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests
# TODO
Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
