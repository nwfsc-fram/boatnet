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
        <optecs-breadcrumbs/>
        <!-- <q-icon name="save" />-->
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-2">
      <q-list>
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

        <q-item to="/sampling" exact>
          <q-item-section avatar>
            <q-icon name="dialpad"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Sampling Assistant</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator/>

        <q-item to="/login" exact>
          <q-item-section avatar>
            <q-icon name="exit_to_app"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Logout</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator/>

        <q-item to="/" exact>
          <q-item-section>
            <q-item-label>Last Sync: 3/8/2019 12:00</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view @displayKeyboard="displayKeyboard"/>
      <boatnet-keyboard
        :visible.sync="isKeyboardVisible"
        :layout="keyboardType"
        :input="keyboardInputTarget"
      />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Platform } from 'quasar';
import { WcgopAppState } from '../_store/types/types';
import { State, Action } from 'vuex-class';

import router from '../router';

import OptecsBreadcrumbs from '../components/OptecsBreadcrumbs.vue';

@Component({
  components: {
    'optecs-breadcrumbs': OptecsBreadcrumbs
  }
})
export default class DefaultLayout extends Vue {
  private leftDrawerOpen: boolean;
  @State('appState') private appState!: WcgopAppState;
  private isKeyboardVisible: boolean = false;
  private keyboardType: string = 'normal';
  private keyboardInputTarget = null;

  constructor() {
    super();
    this.leftDrawerOpen = Platform.is.desktop;
  }

  private navigateBack() {
    this.$router.back();
  }

  private displayKeyboard(event: any) {
    console.log('s ' + this.appState.isKeyboardEnabled + ' ' + this.isKeyboardVisible);
    this.isKeyboardVisible = this.appState.isKeyboardEnabled ? true : false;
    this.keyboardType = event.dataset.layout;
    this.keyboardInputTarget = event;
  }
}
</script>
