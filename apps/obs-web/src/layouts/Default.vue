<template>
  <q-layout view="lHh Lpr lFf">
    <q-header >
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
        />

        <q-toolbar-title>
          <span v-if="this.$router.currentRoute.name == 'Trips' || this.$router.currentRoute.name == 'Trip Detail'"> 
            {{ this.$store.state.activeVessel.name }} 
          </span>
          <!-- {{ currentTrip.trip_num }} -->
          {{ this.$router.currentRoute.name }} 
        </q-toolbar-title>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      bordered
      content-class="bg-grey-2"
    >
      <q-list>
        <q-item-label header>Navigation</q-item-label>

        <q-item to="/" exact>
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section><q-item-label>Home</q-item-label>
          <q-item-label caption>summary / status page depending on role?</q-item-label></q-item-section>
        </q-item>

        <q-item to="/trips" exact>
          <q-item-section avatar><q-icon name="directions" /></q-item-section>
          <q-item-section><q-item-label>Trips</q-item-label>
          <q-item-label caption>create a trip / view trip history.</q-item-label></q-item-section>
        </q-item>  

        <q-item to="/log-book-capture" exact>
          <q-item-section avatar><q-icon name="camera_alt" /></q-item-section>
          <q-item-section><q-item-label>Log Book Capture</q-item-label>
          <q-item-label caption>Use camera to take log book photo for upload</q-item-label></q-item-section>
        </q-item>

        <q-item to="/debriefer" exact>
          <q-item-section avatar><q-icon name="beenhere" /></q-item-section>
          <q-item-section><q-item-label>Debriefer</q-item-label>
          <q-item-label caption>debriefer module description.</q-item-label></q-item-section>
        </q-item>


        <q-item-label header>Settings</q-item-label>


        <q-item to="/permits" exact>
          <q-item-section avatar><q-icon name="assignment" /></q-item-section>
          <q-item-section><q-item-label>Permits</q-item-label>
          <q-item-label caption>Associate captains to permits/vessels</q-item-label></q-item-section>
        </q-item>


        <q-item to="/ots-management" exact>
          <q-item-section avatar><q-icon name="waves" /></q-item-section>
          <q-item-section><q-item-label>OTS Management</q-item-label>
          <q-item-label caption>Manage Selection Targets</q-item-label></q-item-section>
        </q-item>

        <q-item to="/user-config" exact>
          <q-item-section avatar><q-icon name="person" /></q-item-section>
          <q-item-section><q-item-label>User Config</q-item-label>
          <q-item-label caption>Manage Preferences and Contact info</q-item-label></q-item-section>
        </q-item>

        <q-item to="/manage-users" exact>
          <q-item-section avatar><q-icon name="people" /></q-item-section>
          <q-item-section><q-item-label>Manage Users</q-item-label>
          <q-item-label caption>Search for and edit user conact info</q-item-label></q-item-section>
        </q-item>

        <!-- <q-item to="/manage-vessels" exact>
          <q-item-section avatar><q-icon name="directions_boat" /></q-item-section>
          <q-item-section><q-item-label>Vessels</q-item-label>
          <q-item-label caption>chat.quasar-framework.org</q-item-label></q-item-section>
        </q-item> -->
      <br>
        <q-item>
          <q-item-section avatar><q-icon name="clear" /></q-item-section>
          <q-item-section>Log Off</q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: 'LayoutDefault',

  data() {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      currentTrip: this.$store.state.currentTrip
    };
  },
  methods: {
    navigateBack() {
        this.$router.back()
    }
  }
};
</script>

<!--
<script lang="ts">

import Vue from 'vue';
import { mapState } from 'vuex';
import router from 'vue-router';
import { Platform } from 'quasar';
import { Component, Prop } from 'vue-property-decorator';

export default class DefaultLayout extends Vue{
  private leftDrawerOpen: boolean;
  name = 'LayoutDefault';
  currentTrip = this.$store.state.currentTrip;

  navigateBack() {
    this.$router.back()
    }

  constructor() {
    super();
    this.leftDrawerOpen = Platform.is.desktop;
  }

}
</script>

-->
