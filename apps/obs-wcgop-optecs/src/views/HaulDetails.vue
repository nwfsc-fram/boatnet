<template>
  <q-page padding>
    <boatnet-tab-panel :size="3">
      <template v-slot:title1>
        <div class="text-h5 row justify-center">Haul #{{haulNum}} Info Part 1</div>
      </template>
      <template v-slot:content1>
        <div class>
          <div>
            <b>Biolist:</b>2
          </div>
          <div>
            <b>Beaufort Scale:</b>
          </div>
          <q-btn-toggle
            v-model="currentHaul"
            toggle-color="primary"
            :options="[
                {label: '1', value: '1'},
                {label: '2', value: '2'},
                {label: '3', value: '3'},
                {label: '4', value: '4'},
                {label: '5', value: '5'},
                {label: '6', value: '6'},
                {label: '7', value: '7'},
                {label: '8', value: '8'},
                {label: '9', value: '9'}
                ]"
          />
          <div>Sea (high waves)</div>
        </div>
        <div class="row">
          <div class="col-7 q-gutter-sm">
            <div>BRD Present?</div>
            <q-btn-toggle
              v-model="currentHaul"
              toggle-color="primary"
              :options="[
                {label: 'Y', value: true},
                {label: 'N', value: false}
                ]"
            />
            <q-select outlined v-model="currentHaul" :options="options" label="Gear Type"/>
          </div>
          <div class="col q-gutter-sm q-pl-sm">
            <div>EFP?</div>
            <q-btn-toggle
              v-model="currentHaul.isEfpUsed"
              toggle-color="primary"
              :options="[
                {label: 'Y', value: true},
                {label: 'N', value: false}
                ]"
            />
            <q-input outlined class="col-2" v-model="currentHaul" label="Target Strategy"/>
          </div>
        </div>
      </template>
      <template v-slot:title2>
        <div class="text-h5 row justify-center">Haul #{{haulNum}} Info Part 2</div>
      </template>
      <template v-slot:content2>
        <div class="q-gutter-sm">
          <div>
            <b>Biolist:</b>2
          </div>
          <div>Weight Calib</div>
            <q-btn-toggle
              v-model="currentHaul"
              toggle-color="primary"
              :options="[
                {label: '11.00', value: '1'},
                {label: '11.05', value: '2'},
                {label: 'Scale Not Used', value: '3'}
                ]"
            />
            <div>Gear Performance</div>
            <q-btn-toggle
              v-model="currentHaul.gearPerformance"
              toggle-color="primary"
              :options="[
                {label: '1', value: '1'},
                {label: '2', value: '2'},
                {label: '3', value: '3'},
                {label: '4', value: '4'},
                {label: '5', value: '5'},
                {label: '6', value: '6'},
                {label: '7', value: '7'}
                ]"
            />
            <div>OTC Weight Method</div>
            <q-btn-toggle
              v-model="currentHaul"
              toggle-color="primary"
              :options="[
                {label: '14', value: '14'},
                {label: '6', value: '6'}
                ]"
            />
            <q-input outlined class="col-2" v-model="currentHaul" label="Visual OTC"/>
            <q-input outlined class="col-2" v-model="currentHaul" label="Fit #"/>
        </div>
      </template>
      <template v-slot:title3>
        <div class="text-h5 row justify-center">Locations</div>
      </template>
      <template v-slot:content3>
        <div>
          <boatnet-locations :locations="currentHaul.locations"/>
        </div>
      </template>
    </boatnet-tab-panel>
  </q-page>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { WcgopOperation } from '@boatnet/bn-models';
import { pouchService } from '@boatnet/bn-pouch';
import { Getter } from 'vuex-class';

import moment from 'moment';

@Component
export default class Trips extends Vue {
  @Prop(Number) private haulNum!: number; // Passed by router
  private tab!: string; // Current tab (start or end)

  @Getter('currentHaul', { namespace: 'appState' })
  private currentHaulState!: WcgopOperation;

  private currentHaul: WcgopOperation = {};

  constructor() {
    super();
  }

  private async created() {
      try {
        this.currentHaul = await pouchService.db.get(
          pouchService.userDBName,
          this.currentHaulState._id
        );
      } catch (err) {
        console.log('could not find haul in database');
      }
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
