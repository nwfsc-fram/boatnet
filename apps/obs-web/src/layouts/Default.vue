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

        <q-btn flat dense round @click="navigateBack" aria-label="Back" icon="chevron_left"/>

        <q-toolbar-title>
          <span
            v-if="this.$router.currentRoute.name == 'Trips' || this.$router.currentRoute.name == 'Trip Detail'"
          >{{ this.$store.state.activeVessel.name }}</span>
          <!-- {{ currentTrip.trip_num }} -->
          {{ this.$router.currentRoute.name }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-2">
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

        <q-item to="/ots-dashboard" exact>
          <q-item-section avatar>
            <q-icon name="waves"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>OTS Dashboard</q-item-label>
            <q-item-label caption>Monitor OTS Performance</q-item-label>
          </q-item-section>
        </q-item>        

        <q-item to="/debriefer" exact>
          <q-item-section avatar>
            <q-icon name="beenhere"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Debriefer</q-item-label>
            <q-item-label caption>debriefer module description</q-item-label>
          </q-item-section>
        </q-item>

        <q-item-label header>Settings</q-item-label>

        <q-item to="/permits" exact>
          <q-item-section avatar>
            <q-icon name="assignment"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>Permits</q-item-label>
            <q-item-label caption>Associate captains to permits/vessels</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/ots-management" exact>
          <q-item-section avatar>
            <q-icon name="waves"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>OTS Management</q-item-label>
            <q-item-label caption>Manage Selection Targets</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/user-config" exact>
          <q-item-section avatar>
            <q-icon name="person"/>
          </q-item-section>
          <q-item-section>
            <q-item-label>User Config</q-item-label>
            <q-item-label caption>Manage Preferences and Contact info</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/manage-users" exact>
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
import { Component, Vue } from 'vue-property-decorator';
import { Platform } from 'quasar';
import { mapState } from 'vuex';
import router from 'vue-router';

@Component
export default class DefaultLayout extends Vue {

  public leftDrawerOpen: boolean;
  name = 'LayoutDefault';
  currentTrip = this.$store.state.currentTrip;

  navigateBack() {
    this.$router.back();
  }

  constructor() {
    super();
    this.leftDrawerOpen = Platform.is.desktop;
  }
}
</script>
-->