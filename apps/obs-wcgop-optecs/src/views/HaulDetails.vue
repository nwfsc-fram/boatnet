<template>
  <q-page padding>
    <boatnet-tab-panel :size="3">
      <template v-slot:title1>
        <div class="text-h5 row justify-center">Haul #{{haulNum}} Info Part 1</div>
      </template>
      <template v-slot:content1>
        <div class="q-gutter-md">
          <div>
            <b>Biolist:</b>2
          </div>
          <boatnet-button-toggle
            title="Beaufort Scale:"
            :value.sync="beaufort"
            :options="beaufortOptions"
            :description="beaufortLookupVals[beaufort] ? beaufortLookupVals[beaufort].value : ''"
          />
          <boatnet-button-toggle
            title="Gear Type:"
            :value.sync="gearType"
            :options="gearTypeOptions"
            :description="gearTypeLookupVals[gearType] ? gearTypeLookupVals[gearType].value : ''"
          />
        </div>
        <div class="row q-pt-md">
          <div class="col q-gutter-md">
            <boatnet-button-toggle
              title="BRD Present?"
              :value.sync="currentHaul"
              :options="[
                {label: 'Y', value: true},
                {label: 'N', value: false}
                ]"
            />
          </div>
          <div class="col q-gutter-md q-pl-sm">
            <boatnet-button-toggle
              title="EFP?"
              :value.sync="efp"
              :options="[
                {label: 'Y', value: true},
                {label: 'N', value: false}
                ]"
            />
            <q-select
              outlined
              use-input
              fill-input
              hide-selected
              v-model="targetStrategy"
              label="Target Strategy"
              :options="speciesLookupVals"
              option-value="label"
              @filter="getSpeciesLookup"
            />
          </div>
        </div>
      </template>
      <template v-slot:title2>
        <div class="text-h5 row justify-center">Haul #{{haulNum}} Info Part 2</div>
      </template>
      <template v-slot:content2>
        <div class="q-gutter-md">
          <div>
            <b>Biolist:</b>2
          </div>
          <boatnet-button-toggle
            title="Weight Calib"
            :value.sync="currentHaul"
            :options="[
                {label: '11.00', value: '1'},
                {label: '11.05', value: '2'},
                {label: 'Scale Not Used', value: '3'}
                ]"
          />
          <boatnet-button-toggle
            title="Gear Performance"
            :value.sync="currentHaul.gearPerformance"
            :options="gearPerformanceOptions"
            :description="gearPerformanceLookupVals[currentHaul.gearPerformance-1] ? gearPerformanceLookupVals[currentHaul.gearPerformance-1].value : ''"
          />
          <boatnet-button-toggle
            title="OTC Weight Method"
            :value.sync="currentHaul"
            :options="[
                {label: '14', value: '14'},
                {label: '6', value: '6'}
                ]"
          />
          <q-input outlined class="col-2" v-model="emptyString" label="Visual OTC"/>
          <q-input outlined class="col-2" v-model="emptyString" label="Fit #"/>
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
import { ListOptions } from 'davenport';
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
  private speciesLookupVals: string[] = [];

  private beaufortLookupVals: any[] = [];
  private beaufortOptions: any[] = [];

  private gearPerformanceLookupVals: any[] = [];
  private gearPerformanceOptions: any[] = [];

  private gearTypeLookupVals: any[] = [];
  private gearTypeOptions: any[] = [];

  // TODO change to read from db
  private beaufort = 0;
  private gearType = 0;
  private targetStrategy = '';
  private efp = true;
  private emptyString = '';

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
    this.beaufortLookupVals = await this.getLookupVals(
      'optecs_trawl/all_beaufort_description'
    );
    this.beaufortOptions = this.getOptions(this.beaufortLookupVals);
    this.gearPerformanceLookupVals = await this.getLookupVals(
      'optecs_trawl/all_gear_performance_description'
    );
    this.gearPerformanceOptions = this.getOptions(
      this.gearPerformanceLookupVals
    );
    this.gearTypeLookupVals = await this.getLookupVals(
      'optecs_trawl/all_gear_type_description'
    );
    this.gearTypeOptions = this.getOptions(this.gearTypeLookupVals);
  }

  private async getLookupVals(tableName: string) {
    try {
      const descriptions = await pouchService.db.query(
        pouchService.lookupsDBName,
        tableName
      );
      return descriptions.rows.map((row: any) => row);
    } catch (err) {
      console.log(err.message);
    }
  }

  private getOptions(lookups: any[]): any[] {
    const optionsHolder = [];
    for (const lookup of lookups) {
      optionsHolder.push({ label: lookup.key, value: lookup.key });
    }
    return optionsHolder;
  }

  private async getSpeciesLookup(
    val: string,
    update: any,
    abort: any,
    lookupTable: string
  ) {
    update(async () => {
      try {
        const db = pouchService.db;
        const queryOptions = {
          limit: 5,
          start_key: val.toLowerCase(),
          end_key: val.toLowerCase() + '{}',
          inclusive_end: true,
          descending: false
        };

        const species = await db.query(
          pouchService.lookupsDBName,
          'optecs_trawl/all_tally_species',
          queryOptions
        );
        this.speciesLookupVals = species.rows.map(
          (s: any) => s.key + '  ' + s.value.commonName
        );
      } catch (err) {
        console.log('Issue fetching species info ' + err);
      }
    });
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
