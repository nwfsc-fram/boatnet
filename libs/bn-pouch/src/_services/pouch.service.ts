// Boatnet Pouch Service Routines

/* tslint:disable:no-console */

import { CouchDBCredentials } from '../_store/types/types';
// import Client, { configureDatabase, ClientOptions } from 'davenport';

class PouchService {
  private currentCredentials: CouchDBCredentials | null = null;
  // private couchRO: any | null = null;
  // private couchUser: any | null = null;

  constructor() {
    console.log('[PouchDB Service] Instantiated.');
  }

  // get readonlyDB() {
  //   if (!this.currentCredentials || !this.couchRO) {
  //     throw new Error('Please log out and back in again.');
  //   }

  //   return this.couchRO;
  // }

  // get userDB() {
  //   if (!this.currentCredentials || !this.couchUser) {
  //     throw new Error('Please log out and back in again.');
  //   }

  //   return this.couchUser;
  // }

  // public connect(credentials: CouchDBCredentials) {
  //   console.log('[CouchDB Service] Connecting.');

  //   this.currentCredentials = credentials;

  //   const options: ClientOptions = {
  //     username: credentials.userCredentials.username,
  //     password: credentials.userCredentials.password
  //   };

  //   this.couchRO = new Client(
  //     credentials.dbInfo.urlRoot,
  //     credentials.dbInfo.readonlyDB,
  //     options
  //   );
  //   this.couchUser = new Client(
  //     credentials.dbInfo.urlRoot,
  //     credentials.dbInfo.userDB,
  //     options
  //   );
  // }
}

export const pouchService = new PouchService();
