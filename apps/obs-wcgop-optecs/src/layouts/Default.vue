<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="basic">
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
          <optecs-breadcrumbs/>
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
        <q-item to="/comments" exact>
          <q-item-section avatar>
            <q-icon name="note"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Notes</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/settings" exact>
          <q-item-section avatar>
            <q-icon name="settings"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Settings</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator/>

        <q-item to="/upload" exact>
          <q-item-section avatar>
            <q-icon name="cloud_upload"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Upload Data</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/backup" exact>
          <q-item-section avatar>
            <q-icon name="settings_backup_restore"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>External Backup</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/errors" exact>
          <q-item-section avatar>
            <q-icon name="warning"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Trip Errors</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/tally" exact>
          <q-item-section avatar>
            <q-icon name="dialpad"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Tally</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator/>

        <q-item to="/login" exact>
          <q-item-section avatar>
            <q-icon name="power_settings_new"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Logout</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator/>

        <q-item to="/" exact>
          <q-item-section>
            <q-item-label>Last Sync: {{syncDate}}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view @displayKeyboard="displayKeyboard"/>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { Action, Getter, State } from 'vuex-class';
import { Platform } from 'quasar';
import router from '../router';
import OptecsBreadcrumbs from '../components/OptecsBreadcrumbs.vue';
import { pouchService, PouchDBState } from '@boatnet/bn-pouch';
import { AlertState } from '../_store/index';

@Component({
  components: {
    'optecs-breadcrumbs': OptecsBreadcrumbs
  }
})

export default class DefaultLayout extends Vue {
  @State('alert') private alert!: AlertState;
  @State('pouchState') private pouchState!: PouchDBState;
  @Action('reconnect', { namespace: 'pouchState' }) private reconnect: any;
  @Getter('isSyncing', { namespace: 'pouchState' }) private isSyncing: any;
  @Getter('syncDateFormatted', { namespace: 'pouchState' }) private syncDate!: string;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;
  @Action('clear', { namespace: 'alert' }) private clear: any;
  private leftDrawerOpen: boolean;
  private miniState = true;

  constructor() {
    super();
    this.leftDrawerOpen = Platform.is.desktop;
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

  private displayKeyboard(event: any) {
    this.$emit('displayKeyboard', event);
  }
}
</script>
