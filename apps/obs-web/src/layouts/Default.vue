<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
          icon="menu"
        />

        <q-btn v-if="this.$router.currentRoute.name !== 'Home'" flat dense round @click="navigateBack" aria-label="Back" icon="chevron_left"/>

        <q-toolbar-title>
          <span
            v-if="(this.$router.currentRoute.name == 'Trips' || this.$router.currentRoute.name == 'Trip Detail') && this.vessel.activeVessel"
          >{{ this.vessel.activeVessel.vesselName }}</span>
          <!-- {{ currentTrip.trip_num }} -->
          {{ this.$router.currentRoute.name }}
        </q-toolbar-title>
        <q-spinner-radio v-if="isSyncing" color="green-2" size="2em"/>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-2" v-if="!isSyncing">
      <q-list condensed>
        <q-item-label header>Navigation</q-item-label>

        <q-item to="/" exact>
          <q-item-section avatar>
            <q-icon name="home"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Home</q-item-label>
            <q-item-label caption>summary / status page</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/trips" exact>
          <q-item-section avatar>
            <q-icon name="directions"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Trips</q-item-label>
            <q-item-label caption>create a trip / view trip history</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/log-book-capture" exact>
          <q-item-section avatar>
            <q-icon name="camera_alt"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Log Book Capture</q-item-label>
            <q-item-label caption>take/upload logbook photo</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/vessels" exact v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])">
          <q-item-section avatar>
            <q-icon name="fa fa-ship"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Vessel Management</q-item-label>
            <q-item-label caption>Associate Captains with Vessels</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/em-efp-management" exact v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])">
          <q-item-section avatar>
            <q-icon name="videocam"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>EM EFP Management</q-item-label>
            <q-item-label caption>Manage EM EFP Roster</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/ots-management" exact v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])">
          <q-item-section avatar>
            <q-icon name="waves"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>OTS Management</q-item-label>
            <q-item-label caption>Manage Selection Targets</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/observer-assignment" exact v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])">
          <q-item-section avatar>
            <q-icon name="fa fa-binoculars"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Observer Assignment</q-item-label>
            <q-item-label caption>Assign Observers to Selected Trips</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/observer-availability" exact v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])">
          <q-item-section avatar>
            <q-icon name="fa fa-calendar-alt"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Observer Availability</q-item-label>
            <q-item-label caption>Manage My Availability (Observer Role)</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/debriefer" exact v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])">
          <q-item-section avatar>
            <q-icon name="beenhere"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Debriefer</q-item-label>
            <q-item-label caption>debriefer module description</q-item-label>
          </q-item-section>
        </q-item>

        <q-item-label header>Settings</q-item-label>

        <q-item to="/permits" exact v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])">
          <q-item-section avatar>
            <q-icon name="assignment"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Permits</q-item-label>
            <q-item-label caption>Associate captains to permits/vessels</q-item-label>
          </q-item-section>
        </q-item>

        <!-- <q-item to="/user-config" exact> -->
        <q-item  style="cursor:pointer">
          <q-item-section avatar @click="getUser">
            <q-icon name="person"/>
          </q-item-section>
          <q-item-section  @click="getUser">
            <q-item-label>User Config</q-item-label>
            <q-item-label caption>Manage Preferences and Contact info</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/manage-users" exact v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])">
          <q-item-section avatar>
            <q-icon name="people"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Manage Users</q-item-label>
            <q-item-label caption>edit user conact info</q-item-label>
          </q-item-section>
        </q-item>

        <br>
        <q-item to="/login" exact>
          <q-item-section avatar>
            <q-icon name="exit_to_app"/>
          </q-item-section>
          <q-item-section>Logout</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { Action, Getter, State } from 'vuex-class';
import { Platform } from 'quasar';
import router from '../router';
import { AlertState } from '../_store/index';
import { TripState, VesselState, UserState } from '../_store/types/types';
import { pouchService, PouchDBState } from '@boatnet/bn-pouch';
import { CouchDBCredentials, couchService, CouchDBState } from '@boatnet/bn-couch';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';
import { Client, CouchDoc, ListOptions } from 'davenport';

import moment from 'moment';

@Component
export default class DefaultLayout extends Vue {
  @State('alert') private alert!: AlertState;
  @State('pouchState') private pouchState!: PouchDBState;
  @State('couchState') private couchState!: CouchDBState;
  @State('trip') private trip!: TripState;
  @State('vessel') private vessel!: VesselState;
  @State('user') private user!: UserState;

  @Action('reconnect', { namespace: 'pouchState' }) private reconnect: any;
  @Getter('isSyncing', { namespace: 'pouchState' }) private isSyncing: any;
  @Getter('syncDateFormatted', { namespace: 'pouchState' }) private syncDate!: string;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;
  @Action('clear', { namespace: 'alert' }) private clear: any;

  @Action('reconnect', {namespace: 'baseCouch'}) private reconnectCouch: any;
  private leftDrawerOpen: boolean = false;
  private userRoles: string[] = [];

  constructor() {
    super();
    if (!pouchService.isConnected) {
      // Reconnect PouchDB if page refreshed but still logged in
      this.reconnect().catch((err: any) => {
        this.errorAlert(err);
      });
    }
    if (!couchService.isConnected) {
      this.reconnectCouch().catch((err: any) => {
        this.errorAlert(err);
      });
    }
  }

  private created() {
    this.leftDrawerOpen = Platform.is.desktop;
    if ( authService.getCurrentUser() ) {
      this.userRoles = JSON.parse(JSON.stringify(authService.getCurrentUser()!.roles));
    } else {
      this.$router.push({path: '/login'});
    }
  }

  private navigateBack() {
    this.$router.back();
  }

  private async getUserFromUserDB() {
      // get user doc from userDB if exits
      console.log('getting user from userDB');

      try {
          const allDocs = await pouchService.db.allDocs(
              pouchService.userDBName
              );

          for (const row of allDocs.rows) {
              if (row.doc.type === 'person' && row.doc.apexUserAdminUserName) {
                  if (row.doc.apexUserAdminUserName === authService.getCurrentUser()!.username) {

                      this.user.newUser = false;
                      // this.user.activeUser = row.doc;
                      Vue.set(this.user, 'activeUser', row.doc);
                      if (row.doc.activeVessel) {
                        this.vessel.activeVessel = row.doc.activeVessel;
                      }
                  }
              }
          }
      } catch (err) {
          this.errorAlert(err);
      }
  }

  private async getUserFromMasterDB() {
      // get user doc from master if exists / then put in userDB.
      if (this.user.activeUser === undefined) {
          console.log('Getting user from masterDB');
          try {
              const masterDB: Client<any> = couchService.masterDB;
              const user = await masterDB.viewWithDocs<any>(
                  'obs-web',
                  'all_usernames',
                  {key: authService.getCurrentUser()!.username}
              );

              if (user.rows.length > 0) {
                  couchService.masterDB.delete(user.rows[0].doc._id, user.rows[0].doc._rev);
                  pouchService.db.put(pouchService.userDBName, user.rows[0].doc).then( this.getUserFromUserDB() );
              }
          } catch (err) {
              this.errorAlert(err);
          }
      }
  }

  private isAuthorized(authorizedRoles: string[]) {
    for (const role of authorizedRoles) {
      if (this.userRoles.includes(role)) {
        return true;
      }
    }
    return false;
  }

  private getUser() {
      this.user.activeUser = undefined;

      this.getUserFromUserDB().then(
          () => {
              this.getUserFromMasterDB();
          }
          ).then(
              () => {
                  if (this.user.activeUser === undefined) {
                      this.user.newUser = true;
                      const newUser = {
                          type: 'person',
                          firstName: '',
                          lastName: '',
                          apexUserAdminUserName: authService.getCurrentUser()!.username,
                          addressLine1: '',
                          addressLine2: '',
                          city: '',
                          state: '',
                          zipCode: '',
                          country: '',
                          workPhone: '',
                          homePhone: '',
                          cellPhone: '',
                          workEmail: '',
                          homeEmail: '',
                          birthdate: '',
                          createdBy: authService.getCurrentUser()!.username,
                          createdDate: moment().format()
                          };

                      Vue.set(this.user, 'activeUser', newUser);
                  }
                  this.$router.push({path: '/user-config'});
              }
            );
  }

}
</script>

<style>
    .q-field__label {
        color: #027be3 !important;
    }

    .q-field__native {
      font-weight: bold !important;
    }
</style>
