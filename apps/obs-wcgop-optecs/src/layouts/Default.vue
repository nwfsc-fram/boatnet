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

        <q-toolbar-title>Boatnet WCGOP OPTECS</q-toolbar-title>

        <div>v0.0.0</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-2">
      <q-list>
        <q-item to="/" exact>
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

        <q-item to="/" exact>
          <q-item-section avatar>
            <q-icon name="cloud_upload"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Upload Data</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/" exact>
          <q-item-section avatar>
            <q-icon name="settings_backup_restore"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>External Backup</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/" exact>
          <q-item-section avatar>
            <q-icon name="warning"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Trip Errors</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/" exact>
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
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Platform } from 'quasar';

@Component
export default class DefaultLayout extends Vue {
  private leftDrawerOpen: boolean;

  constructor() {
    super();
    this.leftDrawerOpen = Platform.is.desktop;
  }
}
</script>
