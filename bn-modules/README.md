# Boatnet Module Libraries

* We may consider calling this something other than "bn-modules" since Modules means something specific to Angular.

* Note: `ng build bn-modules` will not automatically build the subprojects. Each directory under `projects/` is a standalone library, so you need to build the projects explicitly (e.g `ng build bn-catch`)

## Creating and linking to a new bn-modules library

### 1. Navigate to the bn-modules directory in the terminal window

This top level project could be used to test the various modules in projects/ 

`cd bn-modules`

### 2. Generate a new library

For these examples, we will create a 'specimens' library

Note how we always prepend the library name with "bn-" and also give it the bn- prefix

`ng generate library bn-specimens --prefix=bn`

### 3. Create additional library component(s), libraries, etc.
Specify your project with the `--project=` flag.

Still doing this from the bn-modules directory:

`ng generate component specimens --project=bn-specimens --styleext=scss`

Modify the ts, scss, html for this new specimens component as needed

* Optional
  * Remove the default `src/lib/bn-specimens.component.*` and `src/lib/bn-specimens.service.*` files and remove references in the bn-specimens.module.ts file, if you don't want a default component or service. 
  * Remove exports to the component and service in `src/public_api.ts`


### 4. Build the project
`ng build bn-specimens`

This will create the built project as a new folder in the dist/bn-specimens folder

### 5. Edit the public_api.ts interface file to export the correct components

open `projects\bn-specimens\src\public_api.ts`

Add your component to this file. Example:

```
export * from './lib/specimens/specimens.component';
export * from './lib/bn-specimens.module';
```

### 61 [OPTION 1] npm link to the module
* Navigate to your built library folder (i.e into the dist\<library name>) and then create a global link
```
cd dist\bn-specimens
npm link
```
* Next, navigate to your application root directory and type:
```
npm link bn-specimens
```

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

### 6b [OPTION 2] Reference the library modules in your application directly via tsconfig.json
* NOTE: this option throws a webpack warning that may not be a good idea to ignore. I'm using OPTION 1 for now.

* For your application where you want to use your new component, locate the `tsconfig.json` file in your application's root folder. Add the relative "path" as such (example from obs-electron) for each library you want to use:

```
"paths": {
  "bn-models": [
    "../../bn-modules/dist/bn-models"
  ],
  "bn-specimens": [
    "../../bn-modules/dist/bn-specimens"
  ]
}
```
* TODO for Option 2: workaround for resulting webpack WARNING: `Critical dependency: the request of a dependency is an expression`

### Verify peerDependencies versions
If you see the error:
`Cannot redeclare block-scoped variable 'ngDevMode'.`

This is an indication of a @angular/core version mismatch.
Your package.json for the library doesn't match the root bn-modules package.json:
```
"peerDependencies": {
    "@angular/common": "^7.2.0",
    "@angular/core": "^7.2.0"
  }
```

To fix, change the versions in your peerDependencies to match the ones in the bn-modules package.json, as well as your application versions. One way to accomplish this is with `ng update`. E.g. `ng update @angular/core` should handle dependencies automatically.

### 7. Use the new library in your application

Example:

Open the `src/app/app.module.ts` file and add the component:

```
// At the top of the file
import { SpecimensComponent } from 'bn-specimens';

// In the declarations section, add the new component
  declarations: [
    // other components...
    SpecimensComponent
  ],
```

## Working with an already linked module

Once you have taken the above steps to create and link to a new library, then when making modifications to it and testing those out:

### 1. Run your application

```
cd your-app-that-uses-bn-modules
ng serve
```

### 2. Make changes to your library and rebuild

Open a second terminal window (recommend side-by-side with the running ng serve window) and type:

`ng build bn-specimens`

Depending on how you linked your module, 
* tsconfig.json method: `ng serve` should pick up changes automatically
* npm link method: You will have to restart `ng serve` in your application window (module not found errors will occur.)

## References  

https://medium.com/@tomsu/how-to-build-a-library-for-angular-apps-4f9b38b0ed11

From angular meetup:
https://bit.ly/angular-cli-libs

https://blog.angularindepth.com/creating-a-library-in-angular-6-87799552e7e5
