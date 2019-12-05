# Creating a Boatnet Shared Component
## [This doc is somewhat obsolete.]
## See boatnet-module project for current @boatnet module development

- For a minimal (typescript only, no Vue) example, see 'bn-util'

- Create new component lib:

```
cd libs
vue create bn-mylib
```

- Select manual options, Typescript support, CSS parser as dart-sass
- Add `@boatnet` prefix in `package.json`:

```
"name": "@boatnet/bn-auth",
```

- Remove `src/App.vue`, and `assets` folder
- Create component, e.g. `src/components/BoatnetLogin.ts`
  - For shared library components, use BoatnetXxxx.ts naming format
  - Remove HelloWorld.vue or use it as a starting point
- Edit `main.ts` (use the code in `bn-auth/main.ts` as an example)
  - This removes the App creation and adds exports for your new components.
- Edit `package.json` "build" script to point to your new `main.ts`:

```
"build": "vue-cli-service build ./src/main.ts",
```

- Edit `package.json` to point "main" to `main.ts` for export of shared components:
```
...
"main": "./src/main.ts",
```

- Update lerna workspace

```
lerna bootstrap
```

- Build your library

```
cd libs/bn-mylib
yarn build
```

or

```
(from anywhere)
lerna run build
```

## Using Your Library (requires it to be built first!)

Import, declare, enjoy in your .Vue components:

```
<template>
  <div>
    <boatnet-login/>
  </div>
</template>
...
import BoatnetLogin from '@boatnet/bn-common';
...
Vue.component(BoatnetLogin);
...

```
## Useful Links

* Refactoring from .js to .ts in Vue: https://johnpapa.net/vue-typescript/
* Experimental Decorators Warning:
  * Preferences -> settings, User settings.json, added
"javascript.implicitProjectConfig.experimentalDecorators": true
  * Restarted VSCode

## Making a generic code-only library

* See `bn-util`