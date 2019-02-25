import { Injectable } from '@angular/core';

import PouchDB from 'pouchdb';
import DatabaseConfiguration from 'pouchdb';
import PouchdbFind from 'pouchdb-find';
import * as CryptoPouch from 'crypto-pouch';
import * as moment from 'moment';

// Note: copy dbConfig.SAMPLE.json to dbConfig.json (prevent inadvertent commits to src control)
const dbConfig = require('../dbConfig.json');
import { User } from 'bn-models';
import { AuthService, BoatnetUser, CouchDBInfo } from 'bn-auth';
import { MAT_RADIO_GROUP_CONTROL_VALUE_ACCESSOR } from '@angular/material';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { Species } from 'bn-models';
import { HttpClient } from '@angular/common/http';

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

  private couchDBInfo: CouchDBInfo;

  private mapSpeciesCodeCommonName = new Map(); // map species code to common name for PDF

  private isInstantiated: boolean;

  docChangeListener: Subject<any> = new Subject();

  initialSyncComplete: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private authService: AuthService,
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
   * Get Species via a Mango query - TODO slow without index
   */
  getSpecies(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.local_db
        .find({
          selector: {
            type: { $eq: 'species' }
          }
        })
        .then(species => {
          const speciesList = [];
          for (const d of species.docs) {
            if (d.active && d.shortCode) {
              speciesList.push({
                code: <Species>d.shortCode,
                label: `${<Species>d.shortCode} (${<Species>d.commonName})` //  ${d._id}
              });
              this.mapSpeciesCodeCommonName.set(d.shortCode, d.commonName);
            }
          }
          speciesList.sort((a, b) => {
            return a.code === b.code ? 0 : +(a.code > b.code) || -1;
          });

          resolve(speciesList);
        });
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

  /**
   * @param code species code
   */
  getSpeciesCommonName(code: string): string {
    // No guarantee that we've loaded species
    return this.mapSpeciesCodeCommonName.get(code);
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

  connectDatabase(user: BoatnetUser, password: string) {
    this.couchDBInfo = user.couchDBInfo;
    // const couch_username = this.couchDBInfo.username;
    // const couch_password = password;
    console.log('TODO: Use actual user/pw for couch. Using dbConfig.json values instead.');
    const couch_username = (<any>dbConfig).readonly_data_username;
    const couch_password = (<any>dbConfig).readonly_data_password;

    const pouchOpts = {
      skip_setup: true,
      // ajax: {
      // headers: {
      //   Authorization: 'Basic ' + window.btoa(ro_username + ':' + ro_pw)
      // }
      // },
      auth: {
        username: couch_username,
        password: couch_password
      },
      storage: 'persistent'
    };
    if (!this.isInstantiated) {
      const roDB = this.couchDBInfo.urlRoot + this.couchDBInfo.readonlyDB;
      console.log('Set up remote DB.', roDB);
      this.remote_db = new PouchDB(roDB, pouchOpts);
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
          `Initial sync complete from ${this.couchDBInfo.urlRoot}`
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

  populateOfflineData() {
    console.warn('Not inserting bulk data.')
    return;
    this.getSpecies().then(species => {
      // This is temporary code to ensure species are loaded.
      if (species.length < 666) {
        this.http
          .get('assets/db/species.json')
          .toPromise()
          .then((data: any) => {
            console.log(`Loading ${data.docs.length} species docs.`);
            for (const doc of data.docs) {
              // clear _rev field from JSON doc.
              delete doc._rev;
            }
            this.local_db.bulkDocs(data.docs).then(result => {
              console.log('Bulk insert result:', result);
            });
          });
      }
    });
  }

  getAllDocs(): Promise<string> {
    return this.local_db
      .allDocs({ include_docs: true, attachments: true })
      .then(JSON.stringify);
  }
}
