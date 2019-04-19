## CouchDB Configuration Notes


### Moving data directory location (CentOS 7)

* chown steps omitted, but set to `couchdb:couchdb` when complete
* `sudo service couchdb stop`
* Modified `/opt/couchdb/etc/default.ini` to point to `/lib_couchdb` or the location desired. (Both data and view locations. Interestingly we can point the 2 in different places.)
* Copied `/opt/couchdb/data` to `/lib/couchdb`
* Renamed `/opt/couchdb/data` to `/opt/couchdb/data_DELETEME` for now. Will delete once we're sure all is OK.
* `sudo service couchdb start`
