# Workspace

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) using [Nrwl Nx](https://nrwl.io/nx).

## Nrwl Extensions for Angular (Nx)

Nx is an open source toolkit for enterprise Angular applications.

Nx is designed to help you create and build enterprise grade Angular applications. It provides an opinionated approach to application project structure and patterns.

## Getting Started: Install Nx Schematics globally

`npm install -g @nrwl/schematics'

## Documentation

[Nx documentation](http://nrwl.io/nx)

## Generate your first application

Run `ng generate app myapp` to generate an application. When using Nx, you can create multiple applications and libraries in the same CLI workspace. Read more [here](http://nrwl.io/nx).

The Angular Console application https://angularconsole.com/ has a UI for running the Nx schematics and works well.

## Development server

Run `ng serve myapp` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name --project=myapp` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

The Angular Console is useful for configuring parameters here.

## Build

Run `ng build myapp` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Common Boatnet Nx Operations to try
* Auto-format your code prior to commit, to avoid linting errors etc:
```
npm run format
```
* Create a library
```
ng generate library bn-example
```
  * To use, simply import '@boatnet/bn-example' in your code. See libs/bn-auth and libs/bn-models for examples.

* Detect which apps your changes affect https://nx.dev/guides/monorepo-affected
```
npm run affected:build -- --base=master

```
* Dependency graphs for libraries and apps
```
npm run dep-graph
npm run affected:dep-graph -- --base=master
```
