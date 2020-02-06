<template>
  <q-btn-group>
    <span v-for="(crumb, i) in breadcrumbs" :key="crumb.name">
      <q-btn
        v-if="i == 0"
        class="btn-arrow-right-only"
        :color="i != breadcrumbs.length-1 ? 'white' : 'secondary'"
        :text-color="i != breadcrumbs.length-1 ? 'primary' : 'white'"
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
import { BaseTrip, AshopHaul, WcgopOperation } from '@boatnet/bn-models';
import moment from 'moment';

@Component
export default class AshopBreadcrumb extends Vue {
  private breadcrumbs: any[] = [];
  @Getter('currentTrip', { namespace: 'tripsState' })
  private currentTrip!: BaseTrip;
  @Getter('currentHaul', { namespace: 'tripsState' })
  private currentHaul!: any;
  @Getter('currentCruise', { namespace: 'tripsState' })
  private currentCruise!: any;
  @Getter('currentNonFishingDay', { namespace: 'tripsState' })
  private currentNonFishingDay!: any;

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
        const haulNum = this.currentHaul ? this.currentHaul.haulNum : 0;
        this.breadcrumbs[i].name = String(haulNum);
        this.breadcrumbs[i].link = '/hauldetails/' + String(haulNum);
      } else if (this.$route.meta.breadcrumb[i].name === 'nonFishingDayPlaceholder') {
        let index = this.currentNonFishingDay;
        let date = this.currentCruise.nonFishingDays[index].date;
        date = moment(date).format('MM/DD/YYYY');
        this.breadcrumbs[i].name = date;
        index += 1;
        this.breadcrumbs[i].link = '/nonFishingDays/' + index;
      } else {
        this.breadcrumbs[i] = this.$route.meta.breadcrumb[i];
      }
      // TODO read state and populate haulId and species
    }
  }
}
</script>
