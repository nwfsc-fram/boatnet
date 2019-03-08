# Install and Configure Quasar 1.0.0 (Beta) with our Lerna Workspace + Typescript

https://v1.quasar-framework.org/

* Note we are using 1.0.0. Older versions are not particularly Typescript friendly.
* There are some issues that appear to be specific to our lerna monorepo configuration.

## Initial Installation (Vue CLI Integration)
* Example for an app already generated via `vue create`:
```
cd apps/example
vue add quasar@beta
vue invoke quasar
? Allow Quasar to replace App.vue, About.vue, Home.vue and (if available) router.js? Yes
? Treeshake Quasar? (you'll need to import the components, directives and plugins that you use yourself) Yes
? Use RTL support? No
? Choose Quasar Icon Set Material
? Quasar language pack - one from https://github.com/quasarframework/quasar/tree/dev/quasar/lang en-us
? Select features: Roboto font, Material
```

## Compilation Fixes
* `failed to locate @import file ` error:
  * Comment out imports with tilde format in `src/styles/**.styl`
  * Add import of `quasar.min.css` in main.ts
* Copied `postcss.config.js` to root `boatnet/` directory
  * https://github.com/quasarframework/vue-cli-plugin-quasar/issues/3
* For the error `Cannot find module 'quasar'`:
  * https://github.com/quasarframework/vue-cli-plugin-quasar/issues/4
  * Need to declare quasar type. In `shims-vue.d.ts`:
```
declare module 'quasar'
```

## Linting Warning Fixes
* Added to `tslint.json`:
```
    "trailing-comma": false
```
* Used `vetur` VSC plugin for autoformat. [TODO: tweaks performed to Vetur]