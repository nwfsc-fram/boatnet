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
          flat
          dense
          round
          @click="navigateBack"
          aria-label="Back"
          icon="chevron_left"
        />

        <q-toolbar-title>
          {{ this.$router.currentRoute.name }}
        </q-toolbar-title>

        <q-btn
          flat
          dense
          round
          to="/login"
          aria-label="login"
          icon="person"
        />

      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered content-class="bg-grey-2">
      <q-list condensed>
        <q-item-label header>Navigation</q-item-label>
        <q-expansion-item
          label="Trips API"
          icon="directions"
          v-model="tripsExpanded"
          :header-inset-level="0"
          :content-inset-level=".5"
        >
        <q-item to="/public/trips-api" exact>
          <q-item-section>
            <q-item-label>Read Me</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/public/trips-api-spec" exact>
          <q-item-section>
            <q-item-label>Spec</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/public/trips-api-lookups" exact>
          <q-item-section>
            <q-item-label>Lookups</q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="/public/trips-api-program" exact>
          <q-item-section>
            <q-item-label>NWFSC EM Program Documents</q-item-label>
          </q-item-section>
        </q-item>

        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { Action, Getter, State } from 'vuex-class';
import { Platform } from 'quasar';
import router from '../router';

@Component
export default class PublicLayout extends Vue {

  private leftDrawerOpen: boolean = false;
  private tripsExpanded: boolean = true;

  constructor() {
    super();
  }


  private created() {
    this.leftDrawerOpen = Platform.is.desktop;
  }

  private navigateBack() {
    this.$router.back();
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
