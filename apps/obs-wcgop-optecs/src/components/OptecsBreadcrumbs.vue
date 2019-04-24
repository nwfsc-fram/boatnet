<template>
  <q-btn-group>
    <span v-for="(crumb, i) in breadcrumbs" :key="crumb.name">
      <q-btn
        v-if="i == 0"
        class="btn-arrow-right-only"
        color="white"
        text-color="primary"
        label="Trips"
        icon="home"
        to="/"
      />
      <q-btn
        v-else
        class="btn-arrow-right"
        :color="i != breadcrumbs.length-1 ? 'white' : 'secondary'"
        :text-color="i != breadcrumbs.length-1 ? 'primary' : 'white'"
        :to="i != breadcrumbs.length-1 ? crumb.link : ''"
      >{{crumb.name}}</q-btn>
    </span>
  </q-btn-group>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { WcgopAppState } from '../_store/types/types';
import { State, Action } from 'vuex-class';

@Component
export default class OptecsBreadcrumbs extends Vue {
  private breadcrumbs = [];
  @State('appState') private appState!: WcgopAppState;

  @Watch('$route', { immediate: true, deep: true })
  private onUrlChange(newVal: any) {
    if (!this.$route.meta.breadcrumb) {
      return;
    }
    for (const crumb of this.$route.meta.breadcrumb) {
      if (crumb.name === 'tripIdPlaceholder') {
        const tripNum = this.appState.currentTrip ? this.appState.currentTrip.tripNum : 0;
        crumb.name = tripNum;
        crumb.link += tripNum;
      }
      // TODO read state and populate haulId and species
    }
    this.breadcrumbs = this.$route.meta.breadcrumb;
  }
}
</script>
