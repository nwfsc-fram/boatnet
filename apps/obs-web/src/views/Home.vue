<template>
  <div>
  <q-page class="flex flex-center q-pa-md">
    <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
      {{alert.message}}
      <template v-slot:action>
        <q-btn flat label="Dismiss" @click="clearAlert"/>
      </template>
    </q-banner>
    <div class="row items-start" v-if="offlineTrips">
      <div style="width: 100%; text-align: center">
        <q-card class="bg-red text-white">
          <q-card-section>
            <div class="text-h4">OFFLINE MODE</div>
            <div class="text-h6">Last Updated: {{ formatDateTime(offlineTrips.storedDate) }}</div>
            <div class="text-h6">Active Vessel: {{ offlineTrips.activeVessel }}</div>
          </q-card-section>
        </q-card>

        <div class="centered-page-item">Active Trips</div>

        </div>
      <q-card
        v-for="trip in offlineTrips.openTrips"
        :key="offlineTrips.openTrips.indexOf(trip)"
        :class="computedTripClass(trip)"
      >
        <q-card-section>
          <div class="text-h6" style="font-size: 14px; line-height: 4px; margin-bottom: 10px">
            <span>
              <span v-if="trip.departureDate">{{ formatDate(trip.departureDate) }}</span> -
              <span v-if="trip.returnDate">{{ formatDate(trip.returnDate) }}</span>
            </span>
            <span style="float: right" v-if="trip.tripNum"><br>Trip #: {{ trip.tripNum }}</span>
          </div>

          <div class="text-h6">
            <span v-if="trip.fishery">{{ trip.fishery.description }}</span>
            <div v-if="trip.isSelected" class="text-white" style="font-size: 12px; line-height: 20px" title="Trip Is Selected">
              <q-icon name="person_add" size="20px"></q-icon>
              <span class="text-h6">&nbsp;Observer Required</span>
            </div>
            <div v-else class="text-white" style="font-size: 12px; line-height: 20px" title="Observer Not Required">
              <q-icon name="remove" size="20px"></q-icon>
              <span class="text-h6">&nbsp;Observer Not Required</span>
            </div>
          </div>
          <div v-if="trip.observer">
            <sup class="text-white" style="float: right; text-align: right">
              observer: {{ trip.observer.firstName }} {{ trip.observer.lastName }}<br>
              mobile: {{ formatTel(trip.observer.cellPhone) }}
              </sup>
          </div>
        </q-card-section>

    </q-card>

        <div class="row items-start" v-if="offlineTrips.nextSelections.length > 0">
          <div style="width: 100%; text-align: center">
            <div class="centered-page-item">Next Trip Selections</div>
          </div>
              <q-card
                v-for="selection in offlineTrips.nextSelections"
                :key="offlineTrips.nextSelections.indexOf(selection)"
                :class="computedSelectionClass(selection)"
              >
              <q-card-section>

                <div class="text-h6">
                  <span>
                    {{ selection.fishery }}
                  </span>
                </div>
                  <div class="text-h6 text-white" style="font-size: 12px; line-height: 20px">
                    <q-icon :name="selection.isSelected ? 'person_add' : 'remove'" size="20px"></q-icon>
                    <span  class="text-h6" >&nbsp;{{ selection.isSelected ? 'Observer Required' : 'Observer Not Required'}}</span>
                  </div>
              </q-card-section>
              </q-card>
        </div>
    </div>
    <div v-if="onlineStatus">
      <div class="flex flex-center">
        <img alt="noaa logo" src="../assets/NOAA_logo.svg" class="hero-logo">
      </div>

      <div v-if="activeUser && !isSyncing" style="display: block; text-align: center">
        <br>
        <q-btn v-if="isAuthorized(['captain', 'staff', 'debriefer', 'coordinator', 'enforcement']) && !getObserverMode" label="Declarations" to="/declarations" color="primary" exact style="margin: 5px"></q-btn>

        <q-btn v-if="isAuthorized(['enforcement'])" label="EFP Management" to="/ole-efp-management" color="primary" exact style="margin: 5px"></q-btn>

        <q-btn v-if="isAuthorized(['observer']) && !getCaptainMode" label="Debriefing" to="/debriefer" color="primary" exact style="margin: 5px"></q-btn>

        <q-btn v-if="isAuthorized(['captain', 'staff', 'debriefer', 'coordinator']) && !getObserverMode" label="Trips" to="/trips" color="primary" exact style="margin: 5px"></q-btn>

        <q-btn label="My Details" to="/user-config" color="primary" exact style="margin: 5px"></q-btn>
      <br>
      <q-toggle v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator'])" v-model="captainMode" label="Captain Mode" style="margin-top: 30px;"/>
      <q-toggle v-if="isAuthorized(['debriefer', 'development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator'])" v-model="observerMode" label="Observer Mode" style="margin-top: 30px;"/>
      </div>

      <div v-else-if="!activeUser && !isSyncing" style="display: block; text-align: center">
        <div class="text-h6">
          Please complete your user details
        </div>
        <q-btn label="My Details" to="/user-config" color="primary" exact style="margin: 5px"></q-btn>
      </div>
      <br>
      <span v-if="activeUser && !isSyncing">
        <div style="display: block; text-align: center" v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']) && !getCaptainMode && !getObserverMode">
          <q-btn label="All Trips" to="/all-trips" color="primary" exact style="margin: 5px"></q-btn>
          <q-btn label="Missed Trips" to="/missed-trips" color="primary" exact style="margin: 5px"></q-btn>
          <q-btn label="Vessel Managment" to="/vessels" color="primary" exact style="margin: 5px"></q-btn>
          <q-btn label="User Management" to="/manage-users" color="primary" exact style="margin: 5px"></q-btn>
          <q-btn label="OTS Management" to="/ots-management" color="primary" exact style="margin: 5px"></q-btn>
        </div>
      </span>
  </div>

  </q-page>
    <div v-if="!onlineStatus" style="text-align: center; position: relative; bottom: 45px">
      <q-btn color="primary" flat round @click="determineNetworStatus" icon="refresh"></q-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { State, Action, Getter } from 'vuex-class';
import { AlertState, VesselState, PermitState, UserState, GeneralState } from '../_store/types/types';
import { AuthState, authService } from '@boatnet/bn-auth';

import { Client, CouchDoc, ListOptions } from 'davenport';
import { CouchDBInfo, couchService } from '@boatnet/bn-couch';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { EmEfp, Permit } from '@boatnet/bn-models';
import moment from 'moment';

import { Notify } from 'quasar';
import axios from 'axios';

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

  @State('general') private general!: GeneralState;
  @Getter('getOnlineStatus', { namespace: 'general'}) private onlineStatus: any;
  @Action('setOnlineStatus', { namespace: 'general'}) private setOnlineStatus: any;
  @Action('setCaptainMode', { namespace: 'user'}) private setCaptainMode: any;
  @Getter('getCaptainMode', { namespace: 'user'}) private getCaptainMode: any;
  @Action('setObserverMode', { namespace: 'user'}) private setObserverMode: any;
  @Getter('getObserverMode', { namespace: 'user'}) private getObserverMode: any;
  @Action('setUserRoles', { namespace: 'user'}) private setUserRoles: any;
  @Getter('getUserRoles', { namespace: 'user'}) private getUserRoles: any;

  @Action('updateProgram', { namespace: 'debriefer'}) private setProgram: any;
  @Action('updateDisplayColumns', { namespace: 'debriefer'}) private setDisplayCols: any;

  private mytrips: any[] = [];
  private trip: any = {};
  private createdTrip: any = {};
  private updatedTrip: any = {};
  private activeUser: boolean = false;
  private offlineTrips: any = null;
  private url: string = '';
  // private online: boolean = this.onlineStatus;

  constructor() {
    super();
  }

    private isAuthorized(authorizedRoles: string[]) {
      for (const role of authorizedRoles) {
        if (this.getUserRoles.includes(role)) {
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
      this.user.activeUserAlias = undefined;  // eventually remove this line - useful during dev.
      console.log('active user userName: ' + authService.getCurrentUser()!.username);
      if (!this.user.activeUserAlias) {
        console.log('getting active user alias');

        const masterDb: Client<any> = couchService.masterDB;
        const queryOptions = {
          include_docs: true,
          key: authService.getCurrentUser()!.username
        };

        let couchAlias: any = await masterDb.view<any>(
          'obs_web',
          'all_person_alias',
          queryOptions
        );

        if (couchAlias.rows[0] && couchAlias.rows[0].doc.isActive === true) {
          couchAlias = couchAlias.rows[0].doc;
          if (couchAlias.firstName.toString() !== this.user.activeUser!.firstName!.toString()
            || couchAlias.lastName.toString() !== this.user.activeUser!.lastName!.toString()
            || couchAlias.personDocId.toString() !== this.user.activeUser!._id!.toString()
            || couchAlias.roles.toString() !== JSON.parse(JSON.stringify(authService.getCurrentUser()!.roles)).toString()
            ) {
              couchAlias.firstName = this.user.activeUser!.firstName;
              couchAlias.lastName = this.user.activeUser!.lastName;
              couchAlias.personDocId = this.user.activeUser!._id;
              couchAlias.roles = JSON.parse(JSON.stringify(authService.getCurrentUser()!.roles));
              couchAlias.providerAssociations = this.user.activeUser.providerAssociations ? this.user.activeUser.providerAssociations : [];

              await masterDb.put(
                couchAlias._id,
                couchAlias,
                couchAlias._rev)
                .then(
                  async () => {
                    const updatedAlias: any = await masterDb.view<any>(
                      'obs_web',
                    'all_person_alias',
                    queryOptions
                    );
                    console.log('setting active user alias');
                    this.user.activeUserAlias = updatedAlias.rows[0].doc;
                  }
              );
            } else {
              this.user.activeUserAlias = couchAlias;
            }

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
              isAshop: this.user.activeUser!.isAshop ? this.user.activeUser!.isAshop : true,
              providerAssociations: this.user.activeUser.providerAssociations ? this.user.activeUser.providerAssociations : []
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

  private async getUserProviderGroups() {
      const config = {
          headers: {
              authorization: 'Bearer ' + authService.getCurrentUser()!.jwtToken
              },
          params: {
              username: authService.getCurrentUser()!.username,
              // username: 'neil.riley'
              }
          };

      axios.get(this.url + '/api/v1/user-providers', config)
      .then((response) => {
          if (response.data.length && this.user.activeUser) {
            if (!this.user.activeUser.providerAssociations) {
              this.user.activeUser.providerAssociations = [];
            }
            this.user.activeUser.providerAssociations.push.apply(this.user.activeUser.providerAssociations, response.data );
            this.user.activeUser.providerAssociations = [...new Set(this.user.activeUser.providerAssociations)];
          }

      });
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

  private async getOfflineDocs() {
    const pouchDb = pouchService.db;
    try {
      await pouchDb.query(
        'my_index/by_type', {
          key: 'user-trips',
          include_docs: true,
          limit: 1
        },
        pouchService.userDBName
      ).then(
        (res: any) => {
        this.offlineTrips = res.rows[0].doc;
        }
      );
    } catch (err) {
      console.log(err);
    }
  }

  private async determineNetworStatus() {
    const db: Client<any> = couchService.masterDB;
    const queryOptions = {
      reduce: false,
      limit: 1
    };

    this.offlineTrips = null;

    try {
      const userquery = await db.view<any>(
      'obs_web',
      'all_doc_types',
      queryOptions
      );
      console.log('ONLINE');
      this.setOnlineStatus(true);
    } catch (err) {
      console.log('OFFLINE');
      this.setOnlineStatus(false);
      await this.getOfflineDocs();
    }
  }

  private formatDate(date: any) {
    return moment(date).format('MMM Do');
  }

  private formatDateTime(date: any) {
    return moment(date).format('MMM DD, HH:mm');
  }

  private computedTripClass(trip: any) {
    if (trip.isSelected) {
      return 'my-card bg-primary text-white';
    } else {
      return 'my-card bg-secondary text-white';
    }
  }

  private computedSelectionClass(selection: any) {
    if (selection.isSelected) {
      return 'my-card bg-primary text-white';
    } else {
      return 'my-card bg-secondary text-white';
    }
  }

  private get observerMode() {
    return this.getObserverMode;
  }

  private set observerMode(choice) {
    this.setObserverMode(choice);
  }

  private get captainMode() {
    return this.getCaptainMode;
  }

  private set captainMode(choice) {
    this.setCaptainMode(choice);
  }

  private async created() {
      if (authService.apiUrl) {
          this.url = authService.apiUrl;
      } else {
          this.url = '';
      }

      this.getPermits();
      this.getUserFromCouchDB().then(
        async () => {
          this.getUserAliasfromCouchDB();
          // create debriefer-config doc if it doesn't exist already
          const id: string = this.user.activeUser && this.user.activeUser._id ? this.user.activeUser._id : '';
          const userColConfig: any = await couchService.masterDB.viewWithDocs('obs_web', 'debriefer-config', { key: id });
          if (userColConfig.rows.length === 0) {
            const updatedRecord = {
              columnConfig: {},
              type: 'debriefer-config',
              personDocId: id,
              displayCodes: false
            };
            await couchService.masterDB.bulk([updatedRecord], true);
          } else {
            const currDoc = userColConfig.rows[0].doc;
            this.setProgram(currDoc.program);
            this.setDisplayCols(currDoc.columnConfig);
          }
        }
      );
      if ( authService.getCurrentUser() ) {
        this.setUserRoles(JSON.parse(JSON.stringify(authService.getCurrentUser()!.roles)));
      }
      this.buildDesignDoc();
      this.determineNetworStatus();

      // create debriefer-config doc if it doesn't exist already
      const id: string = this.user.activeUser && this.user.activeUser._id ? this.user.activeUser._id : '';
      const userColConfig: any = await couchService.masterDB.viewWithDocs('obs_web', 'debriefer-config', { key: id });
      if (userColConfig.rows.length === 0) {
        const updatedRecord = {
          columnConfig: {},
          type: 'debriefer-config',
          personDocId: id,
          displayCodes: false
        };
        await couchService.masterDB.bulk([updatedRecord], true);
      }
      this.getUserProviderGroups();
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
