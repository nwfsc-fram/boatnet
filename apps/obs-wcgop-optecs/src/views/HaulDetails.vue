<template>
  <q-page padding>
    <boatnet-tab-panel :size="3">
      <template v-slot:title1>
        <div class="text-h5 row justify-center">Haul #{{haulNum}} Info Part 1</div>
      </template>
      <template v-slot:content1>
        <div class="q-gutter-md column">
          <div>
            <b>Biolist:</b>2
          </div>
          <boatnet-button-toggle
            title="Beaufort Scale:"
            :value.sync="currentHaul.beaufortValue"
            :options="beaufortOptions"
            :description="beaufortLookupVals[currentHaul.beaufortValue] ? beaufortLookupVals[currentHaul.beaufortValue].value : ''"
            @save="save"
          />
          <boatnet-button-toggle
            title="Gear Type:"
            :value.sync="currentHaul.gearType"
            :options="gearTypeOptions"
            :description="gearTypeLookupVals[currentHaul.gearType] ? gearTypeLookupVals[currentHaul.gearType].value : ''"
            @save="save"
          />

          <boatnet-button-toggle
            title="BRD Present?"
            :value.sync="currentHaul.legacy.isBrdPresent"
            :options="[
                {label: 'Y', value: true},
                {label: 'N', value: false}
                ]"
            @save="save"
          />
          <boatnet-button-toggle
            title="EFP?"
            :value.sync="currentHaul.isEfpUsed"
            :options="[
                {label: 'Y', value: true},
                {label: 'N', value: false}
                ]"
            @save="save"
          />
          <div class="col-2">
            <q-select
              class="col-2"
              debounce="500"
              @input="save"
              outlined
              use-input
              fill-input
              hide-selected
              v-model="currentHaul.targetStrategy"
              label="Target Strategy"
              :options="options"
              option-value="label"
              @filter="filterSpecies"
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
            :value.sync="currentHaul.calWeight"
            :options="[
                {label: '11.00', value: '11.00'},
                {label: '11.05', value: '11.05'},
                {label: 'Scale Not Used', value: 'NA'}
                ]"
            @save="save"
          />
          <boatnet-button-toggle
            title="Gear Performance"
            :value.sync="currentHaul.gearPerformance"
            :options="gearPerformanceOptions"
            :description="gearPerformanceLookupVals[currentHaul.gearPerformance] ? gearPerformanceLookupVals[currentHaul.gearPerformance].value : ''"
            @save="save"
          />
          <boatnet-button-toggle
            title="OTC Weight Method"
            :value.sync="currentHaul.observerTotalCatch.weightMethod.description"
            :options="[
                {label: '14', value: '14'},
                {label: '6', value: '6'}
                ]"
            @save="save"
          />
          <q-input
            outlined
            class="col-2"
            v-model="currentHaul.observerTotalCatch.measurement.value"
            label="Visual OTC"
            debounce="500"
            @input="save"
          />
          <q-input
            outlined
            class="col-2"
            v-model="currentHaul.fit"
            label="Fit #"
            debounce="500"
            @input="save"
          />
        </div>
      </template>
      <template v-slot:title3>
        <div class="text-h5 row justify-center">Locations</div>
      </template>
      <template v-slot:content3>
        <div>
          <boatnet-locations :locations="currentHaul.locations" @save="save"/>
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
import { Action, Getter } from 'vuex-class';

import moment from 'moment';

@Component
export default class Trips extends Vue {
  @Prop(Number) private haulNum!: number; // Passed by router
  private tab!: string; // Current tab (start or end)

  @Getter('currentHaul', { namespace: 'appState' })
  private currentHaulState!: WcgopOperation;
  @Action('save', { namespace: 'appState' })
  private saveHaul: any;
  private currentHaul: WcgopOperation = {
    observerTotalCatch: {
      measurement: {},
      weightMethod: {}
    },
    legacy: {}
  };
  private speciesList: string[] = [];

  private beaufortLookupVals: any[] = [];
  private beaufortOptions: any[] = [];

  private gearPerformanceLookupVals: any[] = [];
  private gearPerformanceOptions: any[] = [];

  private gearTypeLookupVals: any[] = [];
  private gearTypeOptions: any[] = [];

  private options: string[] = [];

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
    // TODO toggle between all_gear_type_trawl or all_gear_type_fixed_gear
    // based on what gear user selects
    this.gearTypeLookupVals = await this.getLookupVals(
      'optecs_trawl/all_gear_type_trawl'
    );
    this.gearTypeOptions = this.getOptions(this.gearTypeLookupVals);
    this.populateSpeciesList();
  }

  private async getLookupVals(tableName: string) {
    let lookupVals;
    try {
      const descriptions = await pouchService.db.query(
        pouchService.lookupsDBName,
        tableName
      );
      lookupVals = descriptions.rows.map((row: any) => row);
      lookupVals.sort(this.sorter);
      return lookupVals.reduce(this.reducer, {});
    } catch (err) {
      console.log(err.message);
    }
  }

  private getOptions(lookups: any): any[] {
    const optionsHolder = [];
    for (const lookup of Object.keys(lookups)) {
      optionsHolder.push({ label: lookup, value: lookup });
    }
    return optionsHolder;
  }

  private sorter(a: any, b: any) {
    return a.key - b.key;
  }

  private reducer(accum: any, curr: any) {
    const lookup = 'key';
    accum[curr[lookup]] = curr;
    return accum;
  }

  private async populateSpeciesList() {
    const species = await pouchService.db.query(
      pouchService.lookupsDBName,
      'optecs_trawl/all_tally_species'
    );

    this.speciesList = species.rows;
  }

  private async filterSpecies(val: string, update: any, abort: any) {
    update(async () => {
      const valUpper = val.toUpperCase();
      this.options = this.speciesList
        .filter((s: any) => {
          return (
            s.key.startsWith(valUpper) ||
            s.value.commonName.toUpperCase().indexOf(valUpper) > -1
          );
        })
        .map((s: any) => {
          return {
            label: s.key + ': ' + s.value.commonName,
            ...s
          };
        });
    });
  }

  private save() {
    this.saveHaul(this.currentHaul);
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
