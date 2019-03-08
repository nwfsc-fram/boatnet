# Install and Configure Quasar 1.0.0 (Beta) with our Lerna Workspace + Typescript
Note we are using 1.0.0. Older versions are not particularly Typescript friendly.

https://v1.quasar-framework.org/

## Initial Installation (Vue CLI Integration)
```
cd apps/obs-wcgop-optecs
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
* Copied `postcss.config.js` to root `boatnet/` directory
  * https://github.com/quasarframework/vue-cli-plugin-quasar/issues/3
* Commented out various quasar.styl imports, added import of `quasar.min.css` in main.ts
* For the error `Cannot find module 'quasar'`:
  * https://github.com/quasarframework/vue-cli-plugin-quasar/issues/4
  * Need to declare quasar types. In `shims-vue.d.ts`:
```
declare module 'quasar'
declare module 'quasar-framework/*'
```

## Linting Warning Fixes
* Handled one by one. VS Code plugin doesn't autoformat `.vue` files, so might see if there's a plugin that works for that.