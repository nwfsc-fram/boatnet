# Boatnet Module Libraries

* We may consider calling this something other than "bn-modules" since Modules means something specific to Angular.

* Note: `ng build bn-modules` will not automatically build the subprojects, so build the projects explicitly (e.g `ng build bn-catch`)

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
`npm install`
`ng build bn-specimens`

This will create the built project as a new folder in the dist/bn-specimens folder

### 5. Edit the public_api.ts interface file to export the correct components

open `projects\bn-specimens\src\public_api.ts`

This file should have the following code in it:

```
export * from './lib/specimens/specimens.component';
export * from './lib/bn-specimens.module';
```

### 6a [OPTION 1] Reference the library modules in your application directly via tsconfig.json

*Locate the tsconfig.json file in your application's root folder. Add the relative "path" as such (example from obs-electron)

```
"paths": {
  "bn-models": [
    "../../bn-modules/dist/bn-models"
  ]
}
```

### 6b [OPTION 2] npm link to the module
* `npm link` seems a little flaky/ breaks its links occasionally on Windows. Recommend [OPTION 1]
* Navigate to your built library folder (i.e into the dist\<library name>) and then create a global link
```
cd dist\bn-specimens
npm link
```
* Next, navigate to your application root directory and type:
```
npm link bn-specimens
```


### 7. Use the new library in your application

Example:

Open the app.module.ts file and add:

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

If ng serve is running as above, it will automatically pick up the build changes and reflect those in your currently running application.

## References  

https://medium.com/@tomsu/how-to-build-a-library-for-angular-apps-4f9b38b0ed11

From angular meetup:
https://bit.ly/angular-cli-libs

https://blog.angularindepth.com/creating-a-library-in-angular-6-87799552e7e5
