## Further Development Setup

- Generate keys as described in the link on this page and add them to your GitHub account under settings->SSH and GPG keys

  - https://github.com/settings/keys

- If you are using Sourcetree, you need to import this key in PuttyGen (as described in their docs) and save the private key in .ppk format. Then, open Pageant from systray and Add Key using the file.
  * Git Desktop seems to work better than SourceTree if you want a UI other than Visual Studio Code.
- Use ssh for git clone, otherwise you'll be prompted for HTTPS authentication upon `git push`

```
git clone git@github.com:nwfsc-fram/boatnet.git
```

### Precommit hooks
* This will catch trailing whitespace errors before commit, which throws typescript warnings

1. Go to your `boatnet/.git/hooks` folder
2. Copy and rename `pre-commit.sample` to `pre-commit`

## Contributing Guidelines

1. Create your feature branch (`git checkout -b feature/fooBar`) and develop your changes.
2. Verify everything builds under lerna (`lerna run build`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request
   Specific detailed instructions can be found [here](./CONTRIBUTING.md)

## Using Lerna
* See even more detailed [Developer Notes](./docs/dev-notes/dev-notes.md)
* https://github.com/lerna/lerna
* You will no longer need `npm install` or `yarn install` for this workspace. Instead we'll be using:
  * `lerna bootstrap`  (Instead of `npm install`. Links local packages together and install remaining package dependencies)
  * `lerna clean` (Run AFTER bootstrap)
  * `lerna run  build` (Builds everything. Usually you only do this before merging to master, as a check.)
  * `lerna add whatever-package --scope="my-project"` (Add a single dependency to matched scope, e.g. obs-wcgop-optecs) You can also `yarn add xyz` from your project directory, to keep it in scope.

* For boatnet, we are using the Lerna and Yarn Workspaces monorepo pattern. This will minimize node_packages redundancy.
  * Note that each app/library/etc can be standalone, however, we want to use lerna/yarn to make development easy.
* [Required] Install lerna globally
```
npm install -g lerna
```
  * If this isn't an option for you (permissions or whatever,) you can use `npx lerna <command>` for the lerna commands instead.

* Lerna is already configured for boatnet, see the root `lerna.json` and `package.json` for the specifics.
* Lerna commands can be executed from any folder in the project
* Yarn doesn't use `package-lock.json` files. If you see one of these, you can delete it. It might indicate that you accidentally used npm.

* Getting started:
```
cd /c/git/boatnet/
lerna bootstrap
lerna clean
lerna run build
```

## Troubleshooting Build Issues
First, try this:
```
cd boatnet
# make sure you're on master
git pull
rm -rf node_modules
rm yarn.lock
lerna bootstrap
lerna clean
lerna run build
```

Occasionally our lerna monorepo can get into a more confused state. The following commands, performed in order, would be a good starting point to try and "reset" a corrupted environment:
```
# get latest yarn, lerna, and typescript
npm install -g yarn@latest
npm install -g lerna@latest
npm install -g typescript@latest
cd <your-path>/boatnet/
# get latest master branch (known good build)
git pull 
# clean the yarn cache - this has caused issues in the past occasionally (usually this is not required)
yarn cache clean
# axe node_modules
rm -f node_modules
# remove the yarn.lock to ensure newest packages are acquired (usually this is not required)
rm yarn.lock
# now follow the normal build procedure
lerna bootstrap
lerna clean -y
lerna run build
cd apps/your-app
yarn serve
```
* Also, note that file permission issues (e.g. `EPERM`) usually can be resolved by closing and re-opening Visual Studio Code (and stopping all node.js processes.)

### Creating and configuring dependencies for a new app, library, or tool:
* Note that @boatnet shared libraries now live in https://github.com/nwfsc-fram/boatnet-module
* Create a ticket and make a branch:
```
git pull
git checkout -b 'new-wcgop-optecs'
```
* Create your app in apps/ (or lib in libs/, tool in tools/) and add to source control:
```
cd apps/
vue create obs-wcgop-optecs
cd obs-wcgop-optecs
git add .
```
* Modify your new `package.json` to be private:
```
"private": true,
```
* Run lerna bootstrap. This adds your new project to our workspace (you only need to do this once for your new project. It searches for your new package.json.)
  * This also replaces `npm install`/ `yarn install` for our workflow! You'll be using `lerna add` from now on.
```
lerna bootstrap
```
* Build everything
```
lerna run build
```
* Add whatever dependencies using `lerna add`, but note that these dependencies are available to ALL projects, so you will usually want to use the `--scope` flag. You should include the `@types` packages as well if available.
```
lerna add crypto-js --scope='obs-wcgop-optecs'
lerna add --dev @types/crypto-js --scope='obs-wcgop-optecs'
lerna add pouchdb-browser --scope='example'
lerna add --dev @types/pouchdb-browser --scope='example'
lerna add @boatnet/bn-models   [this will install this dependency to all projects - use sparingly]
(etc)
```
* [OPTIONAL] If you use `yarn add` to add a dependency to your specific project, you will need to re-run lerna bootstrap for the build to function correctly.
```
cd apps/my-app/
yarn add some-library
lerna bootstrap
```

* Run your app:
```
cd apps/obs-wcgop-optecs
yarn serve
```

* Delete all node_modules folders with `lerna clean`.
  * This is required for library development (so your app uses the newest library changes,) after creating a new project via `vue create`.
```
lerna clean
```
  * This command is usually followed by `lerna bootstrap`
  * Note: VSC gets a `node_modules` locked file occasionally for `lerna clean`, so I simply restart VSC.

* Global package remove (careful!) Useful if you accidentally globally add a package (instead of using `--scope`)
```
lerna exec -- yarn remove my-package || lerna bootstrap
```

See the [lerna docs](https://github.com/lerna/lerna) for more functionality
