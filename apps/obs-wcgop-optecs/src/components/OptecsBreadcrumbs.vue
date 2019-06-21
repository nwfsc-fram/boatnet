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
import { WcgopTrip, WcgopOperation } from '@boatnet/bn-models';

@Component
export default class OptecsBreadcrumbs extends Vue {
  private breadcrumbs: any[] = [];
  @Getter('currentTrip', { namespace: 'appState' })
  private currentTrip!: WcgopTrip;
  @Getter('currentHaul', { namespace: 'appState' })
  private currentHaul!: WcgopOperation;

  @Watch('$route', { immediate: true, deep: true })
  private onUrlChange(newVal: any) {
    if (!this.$route.meta.breadcrumb) {
      return;
    }
    // make a deep copy
    const temp = JSON.stringify(this.$route.meta.breadcrumb);
    this.breadcrumbs = JSON.parse(temp);

    for (let i = 0; i < this.$route.meta.breadcrumb.length; i++) {
      if (this.$route.meta.breadcrumb[i].name === 'tripIdPlaceholder') {
        const tripNum = this.currentTrip ? this.currentTrip.tripNum : 0;
        this.breadcrumbs[i].name = String(tripNum);
        this.breadcrumbs[i].link = '/tripdetails/' + String(tripNum);
      } else if (this.$route.meta.breadcrumb[i].name === 'haulIdPlaceholder') {
        const haulNum = this.currentHaul ? this.currentHaul.operationNum : 0;
        this.breadcrumbs[i].name = String(haulNum);
        this.breadcrumbs[i].link = '/hauldetails/' + String(haulNum);
      } else {
        this.breadcrumbs[i] = this.$route.meta.breadcrumb[i];
      }
      // TODO read state and populate haulId and species
    }
  }
}
</script>
