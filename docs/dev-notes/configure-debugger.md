# Configuring VS Code Debugger

- Based on https://vuejs.org/v2/cookbook/debugging-in-vscode.html

## Install Chrome debugger

- I already had it installed, but check here:

https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome

## Create/ update `vue.config.js` (same level as `package.json` in your app)

- This file will already exist if you have Quasar configured.

```
cd /c/git/boatnet/apps/obs-wcgop/optecs
touch vue.config.js
```

- Add `devtool` property to `vue.config.js`

```
module.exports = {
  // (Leave other stuff here if exists),
  configureWebpack: {
    devtool: 'source-map'
  }
}
```

## Create debugger launch configuration in VS Code

- Click the Debug icon on left (bug with slash through it)

- Click the Gear icon at the top of the debug widnow (Next to No Configurations)

  - Select "Chrome" from environments

- Replace `configurations` content of the generated launch.json with the corresponding configuration:

```
"version": "0.2.0",
    "configurations": [
        {
            "type": "chrome",
            "request": "launch",
            "name": "vuejs: chrome",
            "url": "http://localhost:8080",
            "webRoot": "${workspaceFolder}/src",
            "breakOnLoad": true,
            "sourceMapPathOverrides": {
              "webpack:///./src/": "${webRoot}"
            }
        }
    ]
```

## Serve and Debug

- Serve your app

```
yarn serve
```

- Add breakpoints
  - Add a manual breakpoint by adding the `debugger` keyword. Remove it before committing code (tslint will complain about it as a reminder.)
  - In original source, I couldn't get the breakpoints to work (by clicking to the left of the line # in a source file)
  - When the webpack src view pops up (after it hits the debugger statement) then you can set breakpoints in that file.
  - Example in the constructor of src/components/MyComponent.vue:

```
<script lang="ts">
... other code ...
@Component
export default class MyComponent extends Vue {
  constructor() {
    super();
    debugger;
  }
}
</script>
```

- Launch the VSC debugger
  - With your app running, click the green arrow at the top of the debug window (with `vuejs: chrome` configuration selected)
  - This will launch a Chrome browser instance that should link back to your debugger breakpoints.
