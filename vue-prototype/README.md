# Working with Yarn Workspaces
# [ Work in Progress ]

## Directory Descriptions
* `apps` Applications
* `libs` Libraries
* `tools` Tools

## Creating a new app, tool, or library
For Vue.js apps or libraries:
```
cd apps
vue create app-name
# or,
cd libs
vue create library-name

cd whatever-name
# ? vue add @o3o/packages
```
* Be sure to manually select features to specify TypeScript.

For plain ol' node.js apps/ tools etc:
```
mkdir [apps,libs,tools]/my-thing && cd [apps,libs,tools]/my-thing
yarn init -y
```

* Add your new app/lib/tool to the workspace package.json "workspaces" array.
```
{
    ...
"workspaces": ["apps/dev-auth-server", ..., "apps/your-app"]
    ...
}
```

* Add cross-env and other dependencies to your new `package.json`:
```
{
  "name": "workspace-a",
  "version": "1.0.0",

  "dependencies": {
    "cross-env": "^5.2.0",
    "bn-auth": "1.0.0"
  }
}
```

* TODO these
https://medium.com/justfrontendthings/how-to-create-and-publish-your-own-vuejs-component-library-on-npm-using-vue-cli-28e60943eed3

https://medium.com/naresh-bhatia/sharing-ui-components-with-lerna-and-yarn-workspaces-be1ebca06efe