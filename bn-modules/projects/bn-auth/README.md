# bn-auth

Boatnet Authorization library.

Communicates with auth endpoint (see observer/dev-auth-proxy for development) and handles offline cached authentication.

## Build and Link

```
ng build bn-auth
cd ../your-project/
npm link ../bn-modules/dist/bn-auth
```

* After this, you can simply rebuild `ng build bn-auth` without having to re-link.
* Alternative linking instructions in bn-modules/README.md
### Make sure to add the preserveSymLinks: true to your project's angular.json
* Otherwise, you will hit this bug: https://github.com/angular/angular/issues/25813
`inject() must be called from an injection context`

## Procedure for adding bn-auth/ login screen to your boatnet project
[ In Progress ]

* Use the dev-auth-proxy unless you are going live. You will need a proxy.json file and `--proxy-config` argument for `ng serve` 
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



