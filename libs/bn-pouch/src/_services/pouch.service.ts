// Boatnet Pouch Service Routines

/* tslint:disable:no-console  */
/* tslint:disable:no-var-requires  */
import { Component, Vue } from 'vue-property-decorator';
// @ts-ignore
import PouchDB from 'pouchdb-browser';
// @ts-ignore
import lf from 'pouchdb-find';
// @ts-ignore
import plf from 'pouchdb-live-find';
// @ts-ignore
import pa from 'pouchdb-authentication';
// @ts-ignore
import PouchVue from 'pouch-vue';

// PouchDB plugins: pouchdb-find (included in the monorepo), LiveFind (external plugin), and couchdb auth
PouchDB.plugin(lf);
PouchDB.plugin(plf);
PouchDB.plugin(pa);

// https://vuejs.org/v2/guide/typescript.html#Augmenting-Types-for-Use-with-Plugins
declare module 'vue/types/vue' {
  // Declare augmentation for Vue
  interface Vue {
    // @ts-ignore
    $pouch: PouchDB; // optional if `PouchDB` is available on the global object
    // @ts-ignore
    // $pouchUser: PouchDB; // optional if `PouchDB` is available on the global object
    $defaultDB: string; // the database to use if none is specified in the pouch setting of the vue component
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    pouch?: any; // this is where the database will be reactive
  }
}

Vue.use(PouchVue, {
  pouch: PouchDB,
  defaultDB: 'todos'
});

import { CouchDBCredentials } from '@boatnet/bn-couch';

// import PouchVue from 'pouch-vue';
// const PouchVue = require('pouch-vue');

// Vue.use(PouchVue, {
//   pouch: PouchDB, // optional if `PouchDB` is available on the global object
//   defaultDB: 'boatnet-dev-wsmith' // this is used as a default connect/disconnect database
//   // debug: '*' // optional - See `https://pouchdb.com/api.html#debug_mode` for valid settings
//   /// (will be a separate Plugin in PouchDB 7.0)
// });

class PouchService extends Vue {
  private currentCredentials: CouchDBCredentials | null = null;
  // private $pouch = PouchDB;
  // private couchRO: any | null = null;
  // private couchUser: any | null = null;

  constructor() {
    super();
    console.log('[PouchDB Service] Instantiated.');
    // console.log(this.$pouchRO);
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

  public connect(credentials: CouchDBCredentials) {
    console.log('[PouchDB Service] Connecting.');

    this.currentCredentials = credentials;

    const roDBName = credentials.dbInfo.urlRoot + '/' + credentials.dbInfo.readonlyDB;
    const userDBName = credentials.dbInfo.urlRoot + '/' + credentials.dbInfo.userDB;

    console.log(userDBName);
    const options = {
      username: credentials.userCredentials.username,
      password: credentials.userCredentials.password
    };


    // this.$pouch
    //   .connect(options.username, options.password, roDBName)
    //   .then((res: any) => {
    //     const isUnauthorized = res.error === 'unauthorized';
    //     const isOffline = res.status === 0;

    //     if (isOffline) {
    //       console.log('[PouchDB Service] Offline Mode');
    //       return;
    //     }

    //     if (isUnauthorized) {
    //       console.log('[PouchDB Service]Unauthorized');
    //       return;
    //     }

    //     console.log('[PouchDB Service] Online.', res);
    //     // this.$router.push('/dashboard');
    //   })
    //   .catch((error: any) => {
    //     console.error(error);
    //   });

    // this.couchRO = new Client(
    //   credentials.dbInfo.urlRoot,
    //   credentials.dbInfo.readonlyDB,
    //   options
    // );
    // this.couchUser = new Client(
    //   credentials.dbInfo.urlRoot,
    //   credentials.dbInfo.userDB,
    //   options
    // );
  }

  public addTestRow(data: {message: string}) {
    // Testing
    console.log('[PouchDB] Add', data);
    this.$pouch.post('todos', data);
  }

  public get pouchDB() {
    return PouchDB;
  }
}

export const pouchService = new PouchService();
