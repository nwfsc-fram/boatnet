# FramModules

* Note: build the projects first (e.g `ng build fram-catch`)

## Creating and linking to a new module

### 1. Navigate to the fram-modules directory in the terminal window

This top level project could be used to test the various modules in projects/ 

`cd fram-modules`

### 2. Generate a new library

Note how we always prepend the library name with "fram-" and also give it the fram prefix

`ng generate library fram-specimens --prefix=fram`

### 3. Create your library components
Still doing this from the fram-modules directory

`ng g c specimens --project=fram-specimens --styleext=scss`

modify the ts, scss, html for this new specimens component as needed

### 4. Build the module

`ng build fram-specimens`

This will create the built project as a new folder in the dist/fram-specimens folder

### 5. Remove extra, generated files that are not needed for the library

fram-specimens.component.spec.ts  
fram-specimens.component.ts  
fram-specimens.service.spec.ts  
fram-specimens.service.ts  

You only need to keep the fram-specimens.module.ts file

### 6. Edit the public_api.ts interface file to export the correct components

open projects\fram-specimens\src\public_api.ts

This file should have the following code in it:

```
export * from './lib/specimens/specimens.component';
export * from './lib/fram-specimens.module';
```

### 7. Globally link to the module

Navigate to your built library folder (i.e into the dist\<library name>) and then create a global link

```
cd dist\fram-specimens
npm link
```

### 7.1 Link to the new module in your local application

Navigate to your application root directory and type:

`npm link fram-specimens`

### 8. Use the new library in your application

Open the app.module.ts file and add:

```
// At the top of the file
import { SpecimensComponent } from 'fram-specimens';

// In the declarations section, add the new component
  declarations: [
    // other components...
    SpecimensComponent
  ],
```

## Working with an already linked module

Once you have taken the above steps to create and link to a new library, then when making modifications to it and testing those out, all you need to do is the following

### 1. Run the application
For the purposes of this example, we'll run the sample application in the fram-modules directory:
```
cd fram-modules
ng serve
```

### 2. Make changes to your library and rebuild

Open a second terminal window (recommend side-by-side with the running ng serve window) and type:

`ng build fram-specimens`

Once ng serve is running, it will automatically pick up the build changes and reflect those in the currently running application

## References  

https://medium.com/@tomsu/how-to-build-a-library-for-angular-apps-4f9b38b0ed11

From angular meetup:
https://bit.ly/angular-cli-libs

https://blog.angularindepth.com/creating-a-library-in-angular-6-87799552e7e5
