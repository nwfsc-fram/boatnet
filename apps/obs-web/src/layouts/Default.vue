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
          v-if="['Trip Detail', 'Permit Details', 'OTS Target Detail', 'User Config', 'User Details', 'EM EFP Details', 'Observer Assignment Details', 'Vessel Details', 'OTS Trip History', 'OTS Trips', 'View Image', 'E Logbook', 'EM Data Comparison', 'Log Missing Trip', 'EM Review', 'EM API Portal', 'EM Footage Manager', 'EM Footage Details', 'Species Details'].includes($route.name)"
          flat
          dense
          round
          @click="navigateBack"
          aria-label="Back"
          icon="chevron_left"
        />

        <q-toolbar-title>
          <span
            v-if="(['Trips', 'Trip Detail', 'Log Missing Trip'].includes(this.$router.currentRoute.name)) && this.vessel.activeVessel"
          >{{ this.vessel.activeVessel.vesselName }}</span>
          <!-- {{ currentTrip.trip_num }} -->
          {{ this.$router.currentRoute.name }}
        </q-toolbar-title>

        <q-btn
          v-if="['New Declaration', 'Declaration Cart', 'Declaration'].includes($route.name)"
          flat
          dense
          round
          to="/declaration-cart"
          aria-label="Back"
          icon="shopping_cart"
          class="justify-end"
        />

        <q-spinner-radio v-if="isSyncing" color="green-2" size="2em" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-2">
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

        <q-item :to="onlineStatus ? '/trips' : ''" exact :disabled="!onlineStatus">
          <q-item-section avatar>
            <q-icon name="directions" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Trips</q-item-label>
            <q-item-label caption>create trips/view trip history</q-item-label>
          </q-item-section>
        </q-item>

        <q-item :to="onlineStatus ? '/declarations' : ''" exact :disabled="!onlineStatus">
          <q-item-section avatar>
            <q-icon name="how_to_vote" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Declarations</q-item-label>
            <q-item-label caption>create declarations + view current and past declarations</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-if="isAuthorized(['enforcement'])"
          :to="onlineStatus ? '/ole-efp-management' : ''"
          exact
          :disabled="!onlineStatus"
        >
          <q-item-section avatar>
            <q-icon name="table" />
          </q-item-section>
          <q-item-section>
            <q-item-label>EFP Management</q-item-label>
            <q-item-label caption>add or edit current EFPs in the declarations app</q-item-label>
          </q-item-section>
        </q-item>

        <q-expansion-item
          label="Debriefer Tools"
          icon="beenhere"
          v-model="debrieferExpanded"
          @click="emExpanded = false; lbExpanded = false; bmExpanded = false"
          :header-inset-level="0"
          :content-inset-level=".5"
          v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
        >
          <q-item
            to="/debriefer"
            exact
            v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
          >
            <q-item-section avatar>
              <q-icon name="create" />
            </q-item-section>
            <q-item-section>
              <q-item-label>QA Data</q-item-label>
              <q-item-label caption>View/Edit observer data</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            to="/rack"
            exact
            v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
          >
            <q-item-section avatar>
              <q-icon name="scanner" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Rack Biospecimens</q-item-label>
              <q-item-label caption>Scan Biospecimens</q-item-label>
            </q-item-section>
          </q-item>

           <q-item
            to="/assign"
            exact
            v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
          >
            <q-item-section avatar>
              <q-icon name="assignment" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Assign Observers</q-item-label>
              <q-item-label caption>Assign Observers to debriefers</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-item
          to="/all-trips"
          exact
          v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer', 'observer']) && !user.captainMode"
          @click="autoHide"
        >
          <q-item-section avatar>
            <q-icon name="table_chart" />
          </q-item-section>
          <q-item-section>
            <q-item-label>All Trips</q-item-label>
            <q-item-label caption>view all ots trips</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          :to="onlineStatus ? '/missed-trips' : ''"
          exact
          :disabled="!onlineStatus"
          v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
          @click="autoHide"
        >
          <q-item-section avatar>
            <q-icon name="error_outline" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Missed Trips</q-item-label>
            <q-item-label caption>trips added after they occurred</q-item-label>
          </q-item-section>
        </q-item>

        <q-expansion-item
          v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
          label="Boatnet Management"
          icon="settings"
          v-model="bmExpanded"
          @click="emExpanded = false; lbExpanded = false; debrieferExpanded = false"
          :header-inset-level="0"
          :content-inset-level=".5"
        >
          <q-item
            to="/vessels"
            exact
            v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])  && !user.captainMode"
          >
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

          <q-item to="/permits" exact>
            <q-item-section avatar>
              <q-icon name="assignment" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Permits Viewer</q-item-label>
              <q-item-label caption>view permit endorsements and vessel association</q-item-label>
            </q-item-section>
          </q-item>

          <q-item to="/lookup-editor" exact>
            <q-item-section avatar>
              <q-icon name="edit_attributes" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Lookups Editor</q-item-label>
              <q-item-label caption>edit boatnet lookups, config + docs</q-item-label>
            </q-item-section>
          </q-item>

          <q-item to="/species-viewer" exact>
            <q-item-section avatar>
              <q-icon name="pets" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Species Viewer</q-item-label>
              <q-item-label caption>view taxonomy alias and catch grouping docs</q-item-label>
            </q-item-section>
          </q-item>

        </q-expansion-item>

        <q-expansion-item
          v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
          label="Electronic Monitoring"
          icon="videocam"
          v-model="emExpanded"
          @click="bmExpanded = false; lbExpanded = false; debrieferExpanded = false"
          :header-inset-level="0"
          :content-inset-level=".5"
        >
          <q-item
            v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
            to="/em-task-management"
            exact
            @click="autoHide"
          >
            <q-item-section avatar>
              <q-icon name="check" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Task Management</q-item-label>
              <q-item-label caption>manage 3rd party review/audit</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
            to="/em-api-portal"
            exact
            @click="autoHide"
          >
            <q-item-section avatar>
              <q-icon name="publish" />
            </q-item-section>
            <q-item-section>
              <q-item-label>API Submission Portal</q-item-label>
              <q-item-label caption>submit logbook data and em reviews to Trips API via a web portal</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
            to="/em-data-compare"
            exact
            @click="autoHide"
          >
            <q-item-section avatar>
              <q-icon name="compare" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Data Comparison</q-item-label>
              <q-item-label caption>compare logbook/3rd party review/audit</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
            to="/em-errors"
            exact
            @click="autoHide"
          >
            <q-item-section avatar>
              <q-icon name="error_outline" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Errors</q-item-label>
              <q-item-label caption>view all api submission errors</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
            to="/em-rate-management"
            exact
          >
            <q-item-section avatar>
              <q-icon name="rate_review" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Review/Audit Rate Management</q-item-label>
              <q-item-label caption>set/edit various rates</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
            to="/em-footage-manager"
            exact
          >
            <q-item-section avatar>
              <q-icon name="videocam" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Video Footage Management</q-item-label>
              <q-item-label caption>manage EM footage</q-item-label>
            </q-item-section>
          </q-item>

          <q-item
            v-if="isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer']) && !user.captainMode"
            to="/em-efp-management"
            exact
          >
            <q-item-section avatar>
              <q-icon name="table" />
            </q-item-section>
            <q-item-section>
              <q-item-label>EM EFP Management</q-item-label>
              <q-item-label caption>manage EM EFP roster</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <q-item-label header>Settings</q-item-label>

        <q-item
          style="cursor:pointer"
          :to="onlineStatus ? '/user-config' : ''"
          exact
          :disabled="!onlineStatus"
        >
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
      <q-dialog v-model="syncStatusExists" full-width full-height seamless>
        <q-card>
          <q-card-section
            style="padding: 0 5px 0 5px; margin: 0; text-align: center; position: relative; top: 10%"
          >
            <div style="padding: 0; margin: 10px 0 10px 5px; font-weight: bold" class="text-h6">
              LOADING DATA
              <br />
              <span
                v-if="syncStatus"
              >{{ syncStatus.db === 'lookups-dev' ? 'Lookups':'User' }} DB - {{ syncStatus.pending }} docs remaining.</span>
            </div>
            <q-circular-progress
              v-if="syncStatus"
              show-value
              size="150px"
              :thickness="0.2"
              :value="getPercent"
              color="primary"
              track-color="grey-3"
            >
              <q-avatar size="90px">
                <img src="../assets/NOAA_logo.svg" />
              </q-avatar>
            </q-circular-progress>
            <br />
            <br />
            <span class="text-h6">please be patient - this only happens once</span>
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="isIndexing" full-width full-height seamless>
        <q-card>
          <q-card-section
            style="padding: 0 5px 0 5px; margin: 0; text-align: center; position: relative; top: 10%"
          >
            <div style="padding: 0; margin: 10px 0 10px 5px; font-weight: bold" class="text-h6">
              INDEXING DATA
              <br />
              <span v-if="isIndexing">{{ toIndex }} remaining.</span>
            </div>
            <q-circular-progress
              v-if="isIndexing"
              show-value
              size="150px"
              :thickness="0.2"
              :value="getIndexedPercent"
              color="primary"
              track-color="grey-3"
            >
              <q-avatar size="90px">
                <img src="../assets/NOAA_logo.svg" />
              </q-avatar>
            </q-circular-progress>
            <br />
            <br />
            <span class="text-h6">please be patient</span>
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
import {
  TripState,
  VesselState,
  UserState,
  GeneralState
} from '../_store/types/types';
import { pouchService, PouchDBState } from '@boatnet/bn-pouch';
import {
  CouchDBCredentials,
  couchService,
  CouchDBState
} from '@boatnet/bn-couch';
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
  @State('general') private general!: GeneralState;

  @Action('reconnect', { namespace: 'pouchState' }) private reconnect: any;
  @Action('reconnectNoLookupsSync', {namespace: 'pouchState'}) private reconnectNoLookupsSync: any;
  @Getter('isSyncing', { namespace: 'pouchState' }) private isSyncing: any;
  @Getter('syncStatus', { namespace: 'pouchState' }) private syncStatus: any;
  @Getter('syncDateFormatted', { namespace: 'pouchState' })
  private syncDate!: string;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;
  @Action('clear', { namespace: 'alert' }) private clear: any;

  @Action('reconnect', { namespace: 'baseCouch' }) private reconnectCouch: any;

  @Getter('getOnlineStatus', { namespace: 'general' }) private onlineStatus: any;
  @Getter('autoHideMenu', {namespace: 'user'}) private autoHideMenu: any;

  private leftDrawerOpen: boolean = false;
  private userRoles: string[] = [];
  private syncIsComplete: boolean = false;
  private isIndexing: boolean = false;
  private toIndex: number = 0;
  private indexed: number = 0;
  private debrieferExpanded: boolean = false;
  private bmExpanded: boolean = false;
  private emExpanded: boolean = false;
  private lbExpanded: boolean = false;

  constructor() {
    super();
    if (!pouchService.isConnected) {
      // Reconnect PouchDB if page refreshed but still logged in
      this.reconnectNoLookupsSync().catch((err: any) => {
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
    return (
      (this.syncStatus.docs_read /
        (this.syncStatus.docs_read + this.syncStatus.pending)) *
      100
    );
  }

  private get getIndexedPercent() {
    return (this.indexed / (this.indexed + this.toIndex)) * 100;
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

  private autoHide() {
    if (this.autoHideMenu) {
      this.leftDrawerOpen = false;
    }
  }

  private created() {
    this.leftDrawerOpen = Platform.is.desktop;
    if (authService.getCurrentUser()) {
      this.userRoles = JSON.parse(
        JSON.stringify(authService.getCurrentUser()!.roles)
      );
    } else {
      this.$router.push({ path: '/login' });
    }
  }

  private navigateBack() {
    // this.$router.back();
    this.$router.go(-1);
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
  color: #007ec6 !important;
}

.q-field__native {
  font-weight: bold !important;
}
</style>
