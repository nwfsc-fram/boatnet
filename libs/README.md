# Creating a Boatnet Shared Component

* For a minimal example, see 'bn-util'

* Create new component lib:
```
cd libs
vue create bn-mylib
```
  * Select manual options, Typescript support, CSS parser as dart-sass
* Add `@boatnet` prefix in `package.json`:
```
"name": "@boatnet/bn-auth",
```
* Remove `App.vue`
* Remove `App.vue`
* Create `components/index.ts` (use `bn-auth/components/index.ts` as an example)
* Create component, e.g. `components/BoatnetLogin.ts`
  * For shared library components, use BoatnetXxxx.ts naming format
  * Remove HelloWorld.vue or use it as a starting point
* Update `package.json` build to point to your new `index.ts`
```
"build": "vue-cli-service build ./src/components/index.ts",
```
* Point "main" in `package.json` to `index.ts` for export of shared components
```
...
"main": "./components/index.ts",
```

* Update lerna workspace
```
lerna bootstrap
```

* Build your library
```
cd libs/bn-mylib
yarn build
```
or
```
lerna run build
```

## Using Your Library (requires it to be built first!)
Import, declare, enjoy in your .Vue components:
```...
import BoatnetLogin from '@boatnet/bn-auth';
...
Vue.component(BoatnetLogin);
...
```
* [ TODO other steps to use in template]
