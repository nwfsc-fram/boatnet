
# Importing CouchDB Data from RDBMS (files in CSV Import)
## CouchDB Import - use couchimport module + transform scripts

* Export to CSV from pgAdmin tool example:
```
select 'species' as type,* from observerx.species;
```

* Example couchimport for flat CSV stuff (self-signed cert allowed)
* This is with git bash
```
npm install -g couchimport
(or use npx couchimport in commands below)
```
* For this example, create my-example database, and set permissions appropriately
```
export NODE_TLS_REJECT_UNAUTHORIZED="0"
export COUCH_URL="https://user:pw@nwcdevfram2.nwfsc2.noaa.gov:6984"
export COUCH_DATABASE="my-example"
export COUCH_DELIMITER=","
cat tally-species.csv | couchimport --transform ./transform_species.js
```
