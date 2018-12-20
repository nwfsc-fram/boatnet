# FramModules

* Note: build the projects first (e.g `ng build bn-catch`)

## Creating and linking to a new module

### 1. Navigate to the bn-modules directory in the terminal window

This top level project could be used to test the various modules in projects/ 

`cd bn-modules`

### 2. Generate a new library

Note how we always prepend the library name with "fram-" and also give it the fram prefix

`ng generate library bn-specimens --prefix=fram`

### 3. Create your library components
Still doing this from the bn-modules directory

`ng g c specimens --project=bn-specimens --styleext=scss`

modify the ts, scss, html for this new specimens component as needed

### 4. Build the module

`ng build bn-specimens`

This will create the built project as a new folder in the dist/bn-specimens folder

### 5. Remove extra, generated files that are not needed for the library

bn-specimens.component.spec.ts  
bn-specimens.component.ts  
bn-specimens.service.spec.ts  
bn-specimens.service.ts  

You only need to keep the bn-specimens.module.ts file

### 6. Edit the public_api.ts interface file to export the correct components

open projects\bn-specimens\src\public_api.ts

This file should have the following code in it:

```
export * from './lib/specimens/specimens.component';
export * from './lib/bn-specimens.module';
```

### 7a [OPTION 1] Reference the library modules in your application directly via tsconfig.json

*Locate the tsconfig.json file in your application's root folder. Add the relative "path" as such (example from obs-electron)

```
"paths": {
  "bn-models": [
    "../../bn-modules/dist/bn-models"
  ]
}
```

### 7b [OPTION 2] npm link to the module
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


### 8. Use the new library in your application

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

Once you have taken the above steps to create and link to a new library, then when making modifications to it and testing those out, all you need to do is the following

### 1. Run the application
For the purposes of this example, we'll run the sample application in the bn-modules directory:
```
cd bn-modules
ng serve
```

### 2. Make changes to your library and rebuild

Open a second terminal window (recommend side-by-side with the running ng serve window) and type:

`ng build bn-specimens`

Once ng serve is running, it will automatically pick up the build changes and reflect those in the currently running application

## References  

https://medium.com/@tomsu/how-to-build-a-library-for-angular-apps-4f9b38b0ed11

From angular meetup:
https://bit.ly/angular-cli-libs

https://blog.angularindepth.com/creating-a-library-in-angular-6-87799552e7e5
