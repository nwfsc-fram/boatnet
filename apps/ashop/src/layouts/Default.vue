<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="basic">
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
          flat
          dense
          round
          @click="navigateBack"
          aria-label="Back"
          icon="chevron_left"
          size="1.5em"
        />
        <q-toolbar-title>
          <ashop-breadcrumbs/>
        </q-toolbar-title>
        <q-spinner-radio v-if="isSyncing" color="green-2" size="2em"/>
        <!-- <q-icon name="save" />-->
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-2" :mini="miniState"
        :breakpoint="500">
      <q-list>
        <q-item exact @click="toggleMiniState">
          <q-item-section avatar @click="toggleMiniState" style="cursor: pointer;">
            <q-icon :name="miniState === true ? 'fas fa-angle-double-right' : 'fas fa-angle-double-left'"/>
          </q-item-section>
          <q-item-section @click="toggleMiniState" style="cursor: pointer;">
            <q-item-label>{{miniState === true ? '' : 'Minimize menu'}}</q-item-label>
          </q-item-section>
        </q-item>

        <div v-for="(item) in appConfig.navigationDrawerItems" :key="item.label">
          <q-item :to="item.to" exact>
          <q-item-section avatar>
            <q-icon :name="item.icon"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{item.label}}</q-item-label>
          </q-item-section>
        </q-item>
        </div>

        <q-item to="/" exact>
          <q-item-section>
            <q-item-label>Last Sync: {{syncDate}}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>

      <q-dialog v-model="syncStatusExists" full-width seamless position="top">
        <q-card>
          <q-card-section style="padding: 0 5px 0 5px; margin: 0" >
              <q-btn size="sm" icon="close" flat v-close-popup class="float-right close-button"/>
              <div style="padding: 0; margin: 10px 0 10px 5px; font-weight: bold" class="text-primary">SYNCING DATA
                <span v-if="syncStatus" style=" font-size: 11px; margin-left: 20px; color: black"> {{ syncStatus.db === 'lookups-dev' ? 'Lookups':'User' }} DB - {{ syncStatus.pending }} docs remaining.</span>
                </div>
              <q-linear-progress v-if="syncStatus" stripe rounded style="height: 10px;" :value="getPercent" color="primary"></q-linear-progress>
              <br>
          </q-card-section>
        </q-card>
      </q-dialog>
      <router-view/>
    </q-page-container>

  </q-layout>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { Action, Getter, State } from 'vuex-class';
import { Platform } from 'quasar';
import router from '../router';
import AshopBreadcrumb from '../components/AshopBreadcrumb.vue';
import { pouchService, PouchDBState } from '@boatnet/bn-pouch';
import { AlertState, BoatnetConfig } from '@boatnet/bn-common';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';
import { colors } from 'quasar';

@Component({
  components: {
    'ashop-breadcrumbs': AshopBreadcrumb
  }
})
export default class DefaultLayout extends Vue {
  @State('alert') private alert!: AlertState;
  @State('pouchState') private pouchState!: PouchDBState;
  @Action('reconnect', { namespace: 'pouchState' }) private reconnect: any;
  @Getter('isSyncing', { namespace: 'pouchState' }) private isSyncing: any;
  @Getter('syncStatus', { namespace: 'pouchState' }) private syncStatus: any;
  @Getter('syncDateFormatted', { namespace: 'pouchState' })
  private syncDate!: string;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;
  @Action('clear', { namespace: 'alert' }) private clear: any;

  @Getter('appConfig', { namespace: 'appSettings' })
  private appConfig!: BoatnetConfig;

  private setting: any;

  private leftDrawerOpen: boolean = false;
  private miniState = true;
  constructor() {
    super();
    // this.leftDrawerOpen = Platform.is.desktop;
    if (!pouchService.isConnected) {
      // Reconnect PouchDB if page refreshed but still logged in
      this.reconnect().catch((err: any) => {
        this.errorAlert(err);
      });
    }
  }
  private toggleMiniState() {
    if (this.miniState) {
      this.miniState = false;
    } else {
      this.miniState = true;
    }
  }
  private navigateBack() {
    this.$router.back();
  }
  private get getPercent() {
    return this.syncStatus.docs_read / (this.syncStatus.docs_read + this.syncStatus.pending);
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

  private mounted() {
    this.$store.subscribe((mutation: any, state: any) => {
      switch(mutation.type) {
        case 'appSettings/setAppConfig':
          console.log('done ' + JSON.stringify(this.appConfig));
          this.setting = this.appConfig;
          break;
      }
    })
  }

  private async created() {
    // colors.setBrand('primary', '#000000')
    // colors.setBrand('secondary', '#f900bf')

    console.log('created default');

    if (!this.appConfig) {
      this.setting = {
        navigationDrawerItems: []
      };
      console.log('helllo ' + JSON.stringify(this.setting));
    } 

    if (authService.getCurrentUser()) {
      return;
    } else {
      this.$router.push({ path: '/login' });
    }
  }
}
</script>

<style scoped>
.close-button {
  padding: 0 !important;
}
</style>