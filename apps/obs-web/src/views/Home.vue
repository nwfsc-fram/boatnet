<template>
  <q-page class="flex flex-center">
    <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
      {{alert.message}}
      <template v-slot:action>
        <q-btn flat label="Dismiss" @click="clearAlert"/>
      </template>
    </q-banner>

    <div class="flex flex-center">
      <img alt="noaa logo" src="../assets/NOAA_logo.svg" class="hero-logo">
    </div>

    <div v-if="activeUser && !isSyncing" style="display: block; text-align: center">
      <q-btn label="Declarations" to="/declarations" color="primary" exact style="margin: 5px"></q-btn>

      <q-btn label="Trips" to="/trips" color="primary" exact style="margin: 5px"></q-btn>

      <q-btn label="My Details" to="/user-config" color="primary" exact style="margin: 5px"></q-btn>

      <q-btn v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) && !user.captainMode" label="Logbook Capture" to="/log-book-capture" color="primary" exact style="margin: 5px"></q-btn>

      <q-btn v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) && !user.captainMode" label="E Logbook" to="/e-logbook" color="primary" exact style="margin: 5px"></q-btn>
    <br>
    <q-toggle v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator'])" v-model="user.captainMode" label="Captain Mode" @input="enableCaptainMode" style="margin-top: 30px;"/>
    </div>

    <div v-else-if="!activeUser && !isSyncing" style="display: block; text-align: center">
      <div class="text-h6">
        Please complete your user details
      </div>
      <q-btn label="My Details" to="/user-config" color="primary" exact style="margin: 5px"></q-btn>
    </div>

  </q-page>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { State, Action, Getter } from 'vuex-class';
import { AlertState, VesselState, PermitState, UserState } from '../_store/types/types';
import { AuthState, authService } from '@boatnet/bn-auth';

import { Client, CouchDoc, ListOptions } from 'davenport';
import { CouchDBInfo, couchService } from '@boatnet/bn-couch';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { EmEfp, Permit } from '@boatnet/bn-models';
import moment from 'moment';

import { Notify } from 'quasar';

@Component
export default class Home extends Vue {
  @State('auth') private auth!: AuthState;
  @State('user') private user!: UserState;

  @State('permit') private permit!: PermitState;
  @Action('updatePermits', { namespace: 'permit' }) private updatePermits: any;
  @State('vessel') private vessel!: VesselState;

  @State('alert') private alert!: AlertState;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;
  @Action('clear', { namespace: 'alert' }) private clearAlert: any;

  @Getter('isSyncing', { namespace: 'pouchState' }) private isSyncing: any;
  @Getter('syncStatus', { namespace: 'pouchState'}) private syncStatus: any;

  private userRoles: string[] = [];
  private mytrips: any[] = [];
  private trip: any = {};
  private createdTrip: any = {};
  private updatedTrip: any = {};
  private activeUser: boolean = false;

  constructor() {
    super();
  }

    private enableCaptainMode(input: boolean) {
      this.user.captainMode = input;
    }

    private isAuthorized(authorizedRoles: string[]) {
      for (const role of authorizedRoles) {
        if (this.userRoles.includes(role)) {
          return true;
        }
      }
      return false;
    }

    private async getUserFromCouchDB() {
        try {
          const db = couchService.masterDB;
          const queryOptions = {
            limit: 1,
            key: authService.getCurrentUser()!.username,
            include_docs: true
            };

          const userquery = await db.viewWithDocs(
            'obs_web',
            'all_active_persons',
            queryOptions
          );

          if (userquery.rows[0]) {
            this.user.activeUser = userquery.rows[0].doc;
          }
          console.log(this.user.activeUser);

        } catch (err) {
            console.log(err);
        }
    }

  private notifySuccess(message: string) {
      Notify.create({
          message: 'Success: ' + message,
          position: 'top-right',
          color: 'green',
          timeout: 2000,
          icon: 'check',
          multiLine: true
      });
  }

  private async getUserAliasfromCouchDB() {
    if (this.user.activeUser) {
      this.activeUser = true;
      this.user.activeUserAlias = undefined;
      console.log('active user userName: ' + authService.getCurrentUser()!.username);
      if (!this.user.activeUserAlias) {
        console.log('getting active user alias');

        const masterDb: Client<any> = couchService.masterDB;
        const queryOptions = {
          include_docs: true,
          key: authService.getCurrentUser()!.username
        };

        const couchAlias: any = await masterDb.view<any>(
          'obs_web',
          'all_person_alias',
          queryOptions
        );


        if (couchAlias.rows[0] && couchAlias.rows[0].doc.isActive === true) {
          console.log('setting active user alias');
          this.user.activeUserAlias = couchAlias.rows[0].doc;
        } else {
          console.log('user alias not found');
          const newAlias = {
              type: 'person-alias',
              firstName: this.user.activeUser!.firstName,
              lastName: this.user.activeUser!.lastName,
              userName: authService.getCurrentUser()!.username,
              personDocId: this.user.activeUser!._id,
              roles: JSON.parse(JSON.stringify(authService.getCurrentUser()!.roles)),
              isActive: true,
              isWcgop: this.user.activeUser!.isWcgop ? this.user.activeUser!.isWcgop : true,
              isAshop: this.user.activeUser!.isAshop ? this.user.activeUser!.isAshop : true
          };
          couchService.masterDB.post(newAlias).then(
              setTimeout( () => {
                  this.notifySuccess('User Alias Created');
                  location.reload();
              } , 2000 )
          );
        }
        }
      } else {
        this.activeUser = false;
      }

  }

  private async getPermits() {
    console.log('getting permits from masterDB');
    this.permit.permits = [];
    this.permit.vesselPermits = {};
    const masterDB: Client<any> = couchService.masterDB;
    try {
        const queryOptions = {
          reduce: false,
          include_docs: true,
          key: 'permit'
        };
        const permits: any = await masterDB.view<any>(
            'obs_web',
            'all_doc_types',
            queryOptions
            );

        for (const row of permits.rows) {
            const permit = row.doc;

            if (permit.vessel && permit.vessel.coastGuardNumber !== 'UNIDENTIFIED' ) {
              const vesselId = permit.vessel.coastGuardNumber ? permit.vessel.coastGuardNumber : permit.vessel.stateRegulationNumber;
              if (!this.permit.vesselPermits[vesselId]) {
                this.permit.vesselPermits[vesselId] = [];
              }
              // TODO: below is a hack to remove duplicate permits
              // there should only be one active federal permit
              // for a given permit number.
              // so doing this hack until I've figured out
              // what's wrong with the permits.
              // if (this.permit.vesselPermits[vesselId].length < 1) {
              //   this.permit.vesselPermits[vesselId].push(permit);
              // }
              if (permit.isTrawlGear) {
                this.permit.vesselPermits[vesselId].push(permit);
              }
            }
            this.permit.permits.push(permit);
        }

        } catch (err) {
            console.log(err);
        }

  }

  private async buildDesignDoc() {
    try {
        await pouchService.db.query('my_index/by_type', {
          limit: 0
        }).then( (res: any) => {
          console.log('indexing userDB');
        });
    } catch (error) {
      console.log(error);
      const designDoc = {
        _id: '_design/my_index',
        views: {
          by_type: {
            // @ts-ignore
            map: function(doc) { emit(doc.type); }.toString()
             }
          }
        };

      pouchService.db.put(designDoc).then( () => {
            pouchService.db.query('my_index/by_type', {
              limit: 0
            }).then( (res: any) => {
              console.log(res.rows.map( (row: any) => row.doc ));
            }).catch( (err: any) => {
              console.log(err);
      });
      }).catch ( (err: any) => {
          console.log(err);
        }
      );
    }

  }

  private async created() {
    this.getPermits();
    this.getUserFromCouchDB();
    this.getUserAliasfromCouchDB();
    if ( authService.getCurrentUser() ) {
      this.userRoles = JSON.parse(JSON.stringify(authService.getCurrentUser()!.roles));
    }
    this.buildDesignDoc();
  }

}
</script>

<style>
.hero-logo {
  width: 40%;
}

@media screen and (orientation: portrait) {
  .hero-logo {
    width: 50%;
  }
}

</style>