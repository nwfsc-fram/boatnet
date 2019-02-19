# bn-auth

Boatnet Authorization library. This module uses ngrx to handle login tasks and application state.

## Code scaffolding

Run `ng generate component component-name --project bn-auth` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project bn-auth`.
> Note: Don't forget to add `--project bn-auth` or else it will be added to the default project in your `angular.json` file. 

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

* Use the dev-auth-proxy unless you are going live.
  * Create proxy.json, see obs-electron for example
  * In package.json, "start": "ng serve --proxy-config ./proxy.json",
* Add NgRx support to your project. Brief version, from  https://ngrx.io/guide/store/install and https://ngrx.io/guide/schematics:
```
cd your-project
npm install @ngx/schematics
... TODO
```
* Add login screen component
* Add auth guards to your router



