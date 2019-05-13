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
        :to="crumb.link"
      >{{crumb.name}}</q-btn>
    </span>
  </q-btn-group>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { WcgopTrip } from '@boatnet/bn-models';

@Component
export default class OptecsBreadcrumbs extends Vue {
  private breadcrumbs: any[] = [];
  @Getter('currentTrip', { namespace: 'appState' })
  private currentTrip!: WcgopTrip;

  @Watch('$route', { immediate: true, deep: true })
  private onUrlChange(newVal: any) {
    if (!this.$route.meta.breadcrumb) {
      return;
    }
    const temp = JSON.stringify(this.$route.meta.breadcrumb);
    this.breadcrumbs = JSON.parse(temp);

    for (let i = 0; i < this.$route.meta.breadcrumb.length; i++) {
      if (this.$route.meta.breadcrumb[i].name === 'tripIdPlaceholder') {
        const tripNum = this.currentTrip ? this.currentTrip.tripNum : 0;
        this.breadcrumbs[i].name = String(tripNum);
        this.breadcrumbs[i].link = 'tripdetails/' + String(tripNum);
      } else {
        this.breadcrumbs[i] = this.$route.meta.breadcrumb[i];
      }
      // TODO read state and populate haulId and species
    }
  }
}
</script>
