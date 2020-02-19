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

        <q-btn
          v-if="['Trip Detail', 'Permit Details', 'OTS Target Detail', 'User Config', 'User Details', 'EM EFP Details', 'Observer Assignment Details', 'Vessel Details', 'OTS Trip History', 'OTS Trips'].includes($route.name)"
          flat
          dense
          round
          @click="navigateBack"
          aria-label="Back"
          icon="chevron_left"
        />

        <q-toolbar-title>
          <span
            v-if="(this.$router.currentRoute.name == 'Trips' || this.$router.currentRoute.name == 'Trip Detail') && this.vessel.activeVessel"
          >{{ this.vessel.activeVessel.vesselName }}</span>
          <!-- {{ currentTrip.trip_num }} -->
          {{ this.$router.currentRoute.name }}
        </q-toolbar-title>
        <q-spinner-radio v-if="isSyncing" color="green-2" size="2em" />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      content-class="bg-grey-2"
      v-if="!isSyncing"
    >
      <q-list condensed>
        <q-item-label header>Navigation</q-item-label>

        <q-item to="/" exact>
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Home</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/trips" exact>
          <q-item-section avatar>
            <q-icon name="directions" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Trips</q-item-label>
            <q-item-label caption>create trips/view trip history</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/declarations" exact>
          <q-item-section avatar>
            <q-icon name="how_to_vote" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Declarations</q-item-label>
            <q-item-label caption>create declarations + view current and past declarations</q-item-label>
          </q-item-section>
        </q-item>

        <q-expansion-item
          v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
          label="Logbook"
          icon="camera_alt"
          v-model="lbExpanded"
          @click="emExpanded = false; bmExpanded = false"
          :header-inset-level="0"
          :content-inset-level=".5"
        >

              <q-item to="/log-book-capture" exact>
                <q-item-section avatar>
                  <q-icon name="camera_alt" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Log Book Capture</q-item-label>
                  <q-item-label caption>capture + upload logbook photos</q-item-label>
                </q-item-section>
              </q-item>

              <q-item to="/e-logbook" exact>
                <q-item-section avatar>
                  <q-icon name="notes"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>E Logbook</q-item-label>
                  <q-item-label caption>paperless logbook</q-item-label>
                </q-item-section>
              </q-item>

        </q-expansion-item>

        <q-item
          to="/debriefer/summary"
          exact
          v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
        >
          <q-item-section avatar>
            <q-icon name="beenhere"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Debriefer</q-item-label>
            <q-item-label caption>debrief observed trips</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          to="/all-trips"
          exact
          v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer', 'observer']) && !user.captainMode"
        >
          <q-item-section avatar>
            <q-icon name="table_chart"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>All Trips</q-item-label>
            <q-item-label caption>observers/staff view all ots trips</q-item-label>
          </q-item-section>
        </q-item>


        <!-- <q-item to="/observer-availability" exact>
          <q-item-section avatar>
            <q-icon name="fa fa-calendar-alt" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Observer Availability</q-item-label>
            <q-item-label caption>manage my availability (bbserver role)</q-item-label>
          </q-item-section>
        </q-item> -->

        <q-expansion-item
          v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
          label="Boatnet Management"
          icon="settings"
          v-model="bmExpanded"
          @click="emExpanded = false; lbExpanded = false"
          :header-inset-level="0"
          :content-inset-level=".5"
        >

                <q-item to="/vessels" exact v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])  && !user.captainMode">
                  <q-item-section avatar>
                    <q-icon name="fa fa-ship" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Vessel Management</q-item-label>
                    <q-item-label caption>associate personnel with vessels</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item to="/manage-users" exact>
                  <q-item-section avatar>
                    <q-icon name="people" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>User Management</q-item-label>
                    <q-item-label caption>edit user conact info + roles</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item to="/ots-management" exact>
                  <q-item-section avatar>
                    <q-icon name="check_circle" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>OTS Management</q-item-label>
                    <q-item-label caption>manage selection targets</q-item-label>
                  </q-item-section>
                </q-item>

                <!-- <q-item to="/observer-assignment" exact>
                  <q-item-section avatar>
                    <q-icon name="fa fa-binoculars" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Observer Assignment</q-item-label>
                    <q-item-label caption>assign observers to selected trips</q-item-label>
                  </q-item-section>
                </q-item> -->

                <q-item to="/permits" exact >
                  <q-item-section avatar>
                    <q-icon name="assignment" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Permits Viewer</q-item-label>
                    <q-item-label caption>view permit endorsements and vessel association</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item to="/lookup-editor" exact >
                  <q-item-section avatar>
                    <q-icon name="edit_attributes" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Lookups Editor</q-item-label>
                    <q-item-label caption>edit boatnet lookups, config + docs</q-item-label>
                  </q-item-section>
                </q-item>


        </q-expansion-item>

        <q-expansion-item
          v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
          label="Electronic Monitoring"
          icon="videocam"
          v-model="emExpanded"
          @click="bmExpanded = false; lbExpanded = false"
          :header-inset-level="0"
          :content-inset-level=".5"
        >
                <q-item
                  v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
                  to="/em-efp-management" exact
                >
                  <q-item-section avatar>
                    <q-icon name="table"/>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>EM EFP Management</q-item-label>
                    <q-item-label caption>manage EM EFP roster</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
                  to="/em-task-management" exact
                >
                  <q-item-section avatar>
                    <q-icon name="check"/>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Task Management</q-item-label>
                    <q-item-label caption>manage 3rd party review/audit</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
                  to="/em-data-compare" exact
                >
                  <q-item-section avatar>
                    <q-icon name="compare"/>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Data Comparison</q-item-label>
                    <q-item-label caption>compare logbook/3rd party review/audit</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  style="color: lightgrey"
                  v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
                  to="" exact
                >
                  <q-item-section avatar>
                    <q-icon name="rate_review"/>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Review/Audit Rate Management</q-item-label>
                    <q-item-label caption>set/edit various rates</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item
                  style="color: lightgrey"
                  v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
                  to="" exact
                >
                  <q-item-section avatar>
                    <q-icon name="videocam"/>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Vido Footage Management</q-item-label>
                    <q-item-label caption>manage EM footage</q-item-label>
                  </q-item-section>
                </q-item>

        </q-expansion-item>

        <q-item-label header>Settings</q-item-label>

        <q-item style="cursor:pointer" to="/user-config" exact>
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section>
            <q-item-label>User Config</q-item-label>
            <q-item-label caption>manage preferences and contact info</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/help" exact>
          <q-item-section avatar>
            <q-icon name="help" />
          </q-item-section>
          <q-item-section>Help</q-item-section>
        </q-item>

        <br />
        <q-item to="/login" exact>
          <q-item-section avatar>
            <q-icon name="exit_to_app" />
          </q-item-section>
          <q-item-section>Logout</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-dialog v-model="syncStatusExists" full-width seamless position="bottom">
        <q-card>
          <q-card-section style="padding: 0 5px 0 5px; margin: 0">
            <!-- <q-btn size="sm" icon="close" flat v-close-popup class="float-right close-button"/> -->
            <div
              style="padding: 0; margin: 10px 0 10px 5px; font-weight: bold"
              class="text-primary"
            >
              SYNCING DATA
              <span
                v-if="syncStatus"
                style=" font-size: 11px; margin-left: 20px; color: black"
              >{{ syncStatus.db === 'lookups-dev' ? 'Lookups':'User' }} DB - {{ syncStatus.pending }} docs remaining.</span>
            </div>
            <q-linear-progress
              v-if="syncStatus"
              stripe
              rounded
              style="height: 10px;"
              :value="getPercent"
              color="primary"
            ></q-linear-progress>
            <br />
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="isIndexing" full-width seamless position="bottom">
        <q-card>
          <q-card-section style="padding: 0 5px 0 5px; margin: 0">
            <!-- <q-btn size="sm" icon="close" flat v-close-popup class="float-right close-button"/> -->
            <div
              style="padding: 0; margin: 10px 0 10px 5px; font-weight: bold"
              class="text-primary"
            >
              INDEXING DATA
              <span
                v-if="isIndexing"
                style=" font-size: 11px; margin-left: 20px; color: black"
              >{{ toIndex }} remaining.</span>
            </div>
            <q-linear-progress
              v-if="isIndexing"
              stripe
              rounded
              style="height: 10px;"
              :value="getIndexedPercent"
              color="primary"
            ></q-linear-progress>
            <br />
          </q-card-section>
        </q-card>
      </q-dialog>

      <router-view />
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
import { AuthState, authService } from '@boatnet/bn-auth';
import { Client, CouchDoc, ListOptions } from 'davenport';

import moment from 'moment';
import { Notify } from 'quasar';

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
  @Getter('syncStatus', { namespace: 'pouchState'}) private syncStatus: any;
  @Getter('syncDateFormatted', { namespace: 'pouchState' }) private syncDate!: string;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;
  @Action('clear', { namespace: 'alert' }) private clear: any;

  @Action('reconnect', {namespace: 'baseCouch'}) private reconnectCouch: any;
  private leftDrawerOpen: boolean = false;
  private userRoles: string[] = [];
  private syncIsComplete: boolean = false;
  private isIndexing: boolean = false;
  private toIndex: number = 0;
  private indexed: number = 0;
  private bmExpanded: boolean = false;
  private emExpanded: boolean = false;
  private lbExpanded: boolean = false;

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

  private get getPercent() {
    if (
        this.syncStatus.pending < 150
        && !this.isIndexing
        && this.syncStatus.db === 'lookups-dev'
      ) {
      this.buildIndexes();
    }
    return this.syncStatus.docs_read / (this.syncStatus.docs_read + this.syncStatus.pending);
  }

  private get getIndexedPercent() {
    return this.indexed / (this.indexed + this.toIndex);
  }

  private get syncStatusExists() {
    if (this.syncStatus && this.syncStatus.pending > 2) {
      return true;
    } else {
      return false;
    }
  }

  private set syncStatusExists(statusExists: boolean) {
    console.log(statusExists);
  }

  private decrementToIndex(indexed: any) {
    console.log(indexed);
    console.log(moment().format('MMSS'));
    this.toIndex--;
    this.indexed++;
    console.log(this.toIndex);
  }

  private buildIndexes() {
    setTimeout( async () => {
      this.isIndexing = true;
      this.toIndex = 7;

      const db = pouchService.db;
      const queryOptions = { start_key: '', inclusive_end: true, reduce: false, include_docs: false };

      const ports = await db.query('obs_web/all_port_names', queryOptions, pouchService.lookupsDBName);
      this.decrementToIndex(ports);

      const vessels = await db.query('obs_web/all_vessel_names', queryOptions, pouchService.lookupsDBName);
      this.decrementToIndex(vessels);

      const vesselNums = await db.query('obs_web/all_vessel_nums', queryOptions, pouchService.lookupsDBName);
      this.decrementToIndex(vesselNums);

      const allDocs = await db.query('obs_web/all_doc_types', queryOptions, pouchService.lookupsDBName);
      this.decrementToIndex(allDocs);

      this.isIndexing = false;
      location.reload();
    }, 1500);

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

  private isAuthorized(authorizedRoles: string[]) {
    for (const role of authorizedRoles) {
      if (this.userRoles.includes(role)) {
        return true;
      }
    }
    return false;
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
