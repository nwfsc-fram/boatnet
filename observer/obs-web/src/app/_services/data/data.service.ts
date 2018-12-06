import { Injectable } from '@angular/core';

import PouchDB from 'pouchdb'
import PouchdbFind from 'pouchdb-find'
import * as CryptoPouch from 'crypto-pouch'

const dbConfig = require('../dbConfig.json')
import { Subject, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../auth/authentication.service';

@Injectable()

export class DataService {
  private local_db: any;
  private remote_db: any;
  private sync: any;
  private syncOpts = {
    // TODO: Configure options.pull/ options.push when we split up DB
    // https://pouchdb.com/api.html#sync
    live: true,
    retry: true
  };

  private isInstantiated: boolean;

  docChangeListener: Subject<any> = new Subject();

  initialSyncComplete: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private authService: AuthenticationService,
    private http: HttpClient
  ) {
    PouchDB.plugin(PouchdbFind);
    PouchDB.plugin(CryptoPouch);
    this.local_db = new PouchDB('boatnet-dev');
    // TODO: Utilize encryption key acquired on initial login.
    // We only want to do this once--so be wary of enabling this.
    // this.local_db.crypto('ObserverX_v1');
    // all done, docs should be transparently encrypted/decrypted

    // this.local_db.removeCrypto();  // will no longer encrypt/decrypt
    // TODO Tested removing encryption, and it seems to imply that we need to
    // clear the DB and re-sync (bulk insert errors)

    this.populateOfflineData(); // Load static data (for no DB connection in phase 1)    
}

  /**
   * Get Vessels via a Mango query - slow without index
   */
  getVessels() {
    // TODO View instead of Mango query
    return this.local_db.find({
      selector: {
        type: { $eq: 'vessel' }
      }
    });
  }

    /**
   * Get Vessel Names from a CouchDB view, and filter
   * @param starting_name
   */
  getVesselNames(starting_name: string) {
    // http://<endpoint>:6984/boatnet-dev/_design/optecs_trawl/_view/all_vessel_names
    if (starting_name && starting_name.length === 1) {
      const startkey = starting_name.toLowerCase();
      const endkey = startkey + 'z';
      return this.local_db.query('optecs_trawl/all_vessel_names', {
        startkey: startkey,
        endkey: endkey
      });
    }
  }

  get(id: string) {
    return this.local_db.get(id);
  }

  put(id: string, document: any) {
    document._id = id;
    return this.get(id).then(
      result => {
        document._rev = result._rev;
        return this.local_db.put(document);
      },
      error => {
        if (error.status === 404) {
          console.log('Got 404. Creating new doc.');
          return this.local_db.put(document);
        } else {
          return new Promise((resolve, reject) => {
            reject(error);
          });
        }
      }
    );
  }

  
  connectDatabase(username: string, password: string) {
    // Ignoring username, password for now
    console.log(
      `WARN: ignored u/p for ${username}, using local login for DB auth.`
    );
    const ro_username = (<any>dbConfig).readonly_data_username;
    const ro_pw = (<any>dbConfig).readonly_data_password;
    const pouchOpts = {
      // TODO JWT
      skip_setup: true,
      // ajax: {
      // headers: {
      //   Authorization: 'Basic ' + window.btoa(ro_username + ':' + ro_pw)
      // }
      // },
      auth: {
        username: ro_username,
        password: ro_pw
      },
      storage: 'persistent'
    };
    if (!this.isInstantiated) {
      console.log('Set up remote DB.');
      this.remote_db = new PouchDB((<any>dbConfig).boatnet_url, pouchOpts);
      this.isInstantiated = true;
    }
    this.startSync();
  }

  private startSync() {
    // Commence Non-Live, then Live Sync
    this.sync = this.local_db
      .sync(this.remote_db, {
        retry: true
      })
      .on('change', change => {
        console.log(`Init: docs read: ${change.change.docs_read}`);
      })
      .on('complete', complete => {
        // only fired for non-live sync
        console.log(
          `Initial sync complete from ${(<any>dbConfig).boatnet_url}`
        );
        this.initialSyncComplete.next(true);
        this.local_db
          .sync(this.remote_db, this.syncOpts)
          .on('change', change => {
            if (change.direction === 'pull') {
              console.log(
                `Pulled from remote. Total docs read: ${
                  change.change.docs_read
                }`
              );
            }
            if (change.direction === 'push') {
              console.log(
                `Pushed docs to remote. Total docs written: ${
                  change.change.docs_written
                }`
              );
            }
            this.docChangeListener.next(change);
          })
          .on('error', error => {
            console.error(JSON.stringify(error));
          });
      })
      .on('error', error => {
        console.log('Error in initial sync.');
        console.error(error);
      });
  }

  isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  disconnectDB() {
    if (this.sync) {
      this.sync.cancel();
    }
    this.authService.logout();
  }

  getAllDocs(): Promise<string> {
    return this.local_db
      .allDocs({ include_docs: true, attachments: true })
      .then(JSON.stringify);
  }
}
