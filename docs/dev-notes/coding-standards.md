# Boatnet Coding Standards


- Each file will contains 500 lines of code or less (see below)
- Generally, we will follow the Quasar and Vue.js coding standards.
  - For Quasar, review this article https://medium.com/quasar-framework/wip-look-at-the-source-code-please-1b905ea4906

- For code formatting, this is defined explicitly in our tslint configuration in the boatnet repository. E.g. https://github.com/nwfsc-fram/boatnet/blob/master/apps/obs-wcgop-optecs/tslint.json
- Whenever possible, remove all linter warnings from your code before merging into master. The easiest way to accomplish this is to use the automatic Format Document (Shift-Alt-F key by default) in Visual Studio Code. When you run your build, take note of any warnings and remedy them. The ```lerna run build``` or ```yarn build``` should reveal these warnings.

Example linter warning that should be fixed:
```
WARNING in C:/git/boatnet/apps/obs-wcgop-optecs/src/views/src/settings.ts
29:2 file should end with a newline
    27 |     this.setSoundEnabled(this.isSoundEnabled);
    28 |   }
  > 29 | }
       |  ^
```     

- We have chosen to ignore webpack-related warnings like asset/entrypoint size limits, and performance recommendations (for the time being.)

# Dealing with Excessively Large .Vue Files

Ideally, our .vue files should be less than 500 lines to retain manageability. 
Various techniques could be applied to make this happen:

* Refactor components into multiple components (preferred method, we'd like to keep our .Vue files "standard" when possible)
* Move typescript code out of the .Vue file, for example:
 1. For file ```obs-wcgop-optecs/src/views/Settings.ts```, copied the contents of the ```<script>``` tag into ```optecs/wcgop-optecs/src/views/src/settings.ts```
 2. In Settings.vue, refer to the new source code via a relative path (the "./" is important)
 ```
<script lang="ts" src="./src/settings.ts">
</script>
```
* Move functionality into a boatnet common library (e.g. bn-common)

