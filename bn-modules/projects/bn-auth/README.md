# bn-auth

Boatnet Authorization library.

Communicates with auth endpoint (see observer/dev-auth-proxy for development) and handles offline cached authentication.

## Build and Link

```
cd <path>/bn-modules
npm install
ng build bn-auth
cd ../your-project/
npm link ../bn-modules/dist/bn-auth
```

## Locked file error
If you see (this example is for bn-auth)
```
BUILD ERROR
EPERM: operation not permitted, unlink 'C:\git\boatnet\bn-modules\dist\bn-auth\lib'
```
  * this is something OS/ antivirus related it seems, but usually this works:
```
npm unlink dist/bn-auth
```

* After this, you can simply rebuild `ng build bn-auth` without having to re-link.
* Alternative linking instructions in bn-modules/README.md

### Important
* Next, fix webpack WARNING: `Critical dependency: the request of a dependency is an expression`

  * in your application's `angular.json` add preserveSymlinks: true to your build options:
```
...
"architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "preserveSymlinks": true,
            ...

```            
  * Otherwise, you will hit this bug: https://github.com/angular/angular/issues/25813
`inject() must be called from an injection context`

## Procedure for adding bn-auth/ login screen to your boatnet project

* Use the dev-auth-proxy unless you are going live. You will need a proxy.json file and `--proxy-config` argument for `ng serve` (these instructions are also in observer/bn-modules/README.md)
  1. Create proxy.json, see obs-electron for example
  2. In package.json, "start": "ng serve --proxy-config ./proxy.json",
* Link bn-auth from your project
```
cd bn-modules
npm install
ng build bn-auth
cd ../your-project
npm link ../../bn-modules/dist/bn-auth
```
* Add auth guards to your router and login screen component - see obs-electron for example usage.
* Modify the following:
  * Add bn-auth dependencies to your project:
```
npm install {cryptojs,jsonwebtoken,pem-jwk}
```
* Modify `src/app/app.module.ts`
```
...
// Assuming you have this dbConfig file
const dbConfig = require('./_services/dbConfig.json');
...
import { BnAuthModule, AuthService, AuthServiceConfig } from 'bn-auth';
...
 imports: [
    BnAuthModule, 
...

 providers: [
  ...
    AuthService,
    {
      provide: AuthServiceConfig,
      useValue: { authUrl: (<any>dbConfig).authUrl }
    },
```
