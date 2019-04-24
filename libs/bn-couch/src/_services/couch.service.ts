// Boatnet Couch Service Routines

/* tslint:disable:no-console */

import { CouchDBCredentials } from '../_store/types/types';
import Client, { configureDatabase, ClientOptions } from 'davenport';

class CouchService {
  private currentCredentials: CouchDBCredentials | null = null;
  private couchMaster: any | null = null;
  private couchLookups: any | null = null;
  private couchUser: any | null = null;

  constructor() {
    console.log('[CouchDB Service] Instantiated.');
  }

  get lookupsDB() {
    if (!this.currentCredentials || !this.couchLookups ) {
      throw new Error('Please log out and back in again.');
    }

    return this.couchLookups;
  }

  get masterDB() {
    if (!this.currentCredentials || !this.couchMaster ) {
      throw new Error('Please log out and back in again.');
    }

    return this.couchMaster;
  }

  get userDB() {
    if (!this.currentCredentials || !this.couchUser) {
      throw new Error('Please log out and back in again.');
    }

    return this.couchUser;
  }

  public connect(credentials: CouchDBCredentials) {
    console.log('[CouchDB Service] Connecting.');

    this.currentCredentials = credentials;

    const options: ClientOptions = {
      username: credentials.userCredentials.username,
      password: credentials.userCredentials.password
    };

    this.couchLookups = new Client(
      credentials.dbInfo.urlRoot,
      credentials.dbInfo.lookupsDB,
      options
    );
    this.couchMaster = new Client(
      credentials.dbInfo.urlRoot,
      credentials.dbInfo.masterDB,
      options
    );
    this.couchUser = new Client(
      credentials.dbInfo.urlRoot,
      credentials.dbInfo.userDB,
      options
    );
  }
}

export const couchService = new CouchService();
