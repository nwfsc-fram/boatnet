# obs-wcgop-optecs


## Running a PWA on localhost

* For bugs that only show up in production (PWA mode) you'll want to be able to build and run locally.
* I run CouchDB on a VM, but you could point to our dev server.
* First, modify `config/dbConfig.ts` to point to localhost:9000
* Next, build and run the app out of the `dist/` directory:
```
npm install -g http-server
cd obs-wcgop-optecs
yarn build
http-server -S -K ../dev-auth-server/src/keys/temp-priv-key.pem -C ../dev-auth-server/src/keys/temp-
cert.pem dist/.
```
* I recommend you use an incognito window for PWA testing, otherwise the service worker portion can get confusing.
* Also, in the dev tools in Chrome, enable the Application/ Service Workers/ Update on reload checkbox.
