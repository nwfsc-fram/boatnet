# ObserverElectron
"Hybrid" web-based and electron app.

All potentially sensitive (authentication) code is in a private repository - this code may not compile completely without it.

## Install node packages
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