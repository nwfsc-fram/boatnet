<template>
  <q-page padding>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="haulInfo1">
        <div class="text-h5 row justify-center">Haul #{{haulNum}} Info Part 1</div>
        <div class="q-pa-md">
          <div class="q-col-gutter-md column" style="height:400px; max-height: 100%;">
            <!-- <q-input outlined class="col-2" v-model="currentTrip.vessel.name" label="Vessel Name"/> -->
          </div>
        </div>
      </q-tab-panel>
      <q-tab-panel name="haulInfo2">
        <div class="text-h5 row justify-center">Haul #{{haulNum}} Info Part 2</div>
        <div class="q-pa-md">
          <div class="q-col-gutter-md column" style="height:400px; max-height: 100%;">
            <!-- <q-input outlined class="col-2" v-model="currentTrip.vessel.name" label="Vessel Name"/> -->
          </div>
        </div>
      </q-tab-panel>
      <q-tab-panel name="haulInfo3">
        <div class="text-h5 row justify-center">Haul #{{haulNum}} Info Part 3</div>
        <div class="q-pa-md">
          <div class="q-col-gutter-md column" style="height:400px; max-height: 100%;">
            <!-- <q-input outlined class="col-2" v-model="currentTrip.vessel.name" label="Vessel Name"/> -->
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
    <div class="row justify-center">
      <q-option-group
        v-model="tab"
        inline
        :options="[
          { label: '', value: 'haulInfo1' },
          { label: '', value: 'haulInfo2' },
          { label: '', value: 'haulInfo3' },
        ]"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import {
  WcgopHaul
} from '@boatnet/bn-models';

import moment from 'moment';

@Component
export default class Trips extends Vue {
  @Prop({ default: 'haulInfo1' }) public startTab!: string;
  @Prop(Number) private haulNum!: number; // Passed by router
  private tab!: string; // Current tab (start or end)

  private currentHaul: WcgopHaul | undefined;

  constructor() {
    super();
    this.tab = this.startTab;
}

  // TODO move to shared util?
  private formatDate(dateStr: string): string {
    return moment(dateStr).format('MM/DD/YY hh:mm');
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
