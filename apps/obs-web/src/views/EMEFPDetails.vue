<template>
    <div class="q-pa-md  q-gutter-md">

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
            {{alert.message}}
            <template v-slot:action>
                <q-btn flat label="Dismiss" @click="clear"/>
            </template>
        </q-banner>

        <q-card style="padding: 20px; max-width: 400px">

            <div class="text-h6">{{ emefp.activeEmefpPermit.emEfpNumber }}</div>

            <q-select
            v-model="emefp.activeEmefpPermit.vesselName"
            label="Vessel Name"
            use-input
            hide-selected
            :options="options"
            @filter="filterFn"
            @input="updateVessel(emefp.activeEmefpPermit.vesselName)">
            <template>{{ emefp.activeEmefpPermit.vesselCGNumber }} </template>
            </q-select>

            <q-select
            v-model="getEfpTypes"
            label="EFP Types"
            bg-color="white"
            color="primary"
            multiple
            use-chips
            :options="efpTypeOptions">
            </q-select>

            <q-select
            v-model="emefp.activeEmefpPermit.gear"
            label="Gear"
            bg-color="white"
            color="primary"
            multiple
            use-chips
            :options="gearTypeOptions">
            </q-select>

            <q-select
            v-model="emefp.activeEmefpPermit.sector"
            label="Sector"
            :options="sectorOptions">
            </q-select>

            <q-select
            v-model="emefp.activeEmefpPermit.lePermit"
            label="Limited Entry Permit"
            :options="permitOptions">
            </q-select>
            <br>
            <q-card-actions>
                <q-btn color="red" label="Cancel" icon="warning" to="/em-efp-management" exact/>
                <q-btn color="primary">Save</q-btn>
            </q-card-actions>

        </q-card>
    </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { EmefpState, AlertState, PermitState } from '../_store/types/types';
import { GearType } from '@boatnet/bn-models';
import { EfpType } from '@boatnet/bn-models';

import { Client, CouchDoc, ListOptions } from 'davenport';
import { couchService } from '@boatnet/bn-couch';

@Component
export default class EMEFPDetails extends Vue {
    @State('emefp') private emefp!: EmefpState;
    @State('permit') private permit!: PermitState;

    @State('alert') private alert!: AlertState;
    @Action('clear', { namespace: 'alert' }) private clear: any;
    @Action('error', { namespace: 'alert' }) private error: any;

    private options: string[] = [];
    private efpTypeOptions: string[] = [];
    private gearTypeOptions: string[] = [];
    private sectorOptions: string[] = [];

    constructor() {
        super();
    }

    private async getOptions() {
        try {
        const roDB: Client<any> = couchService.lookups;
        const queryOptions: ListOptions = {
          limit: 100,
          start_key: 'a',
          inclusive_end: true,
          descending: false
        };

        const efptypes = await roDB.view<any>(
          'sethtest',
          'efp-type-options',
          queryOptions
        );
        this.efpTypeOptions = efptypes.rows.map((efp) => efp.key);

        const geartypes = await roDB.view<any>(
          'sethtest',
          'gear-type-options',
          queryOptions
        );
        this.gearTypeOptions = geartypes.rows.map((gear) => gear.key);

        const sectortypes = await roDB.view<any>(
          'sethtest',
          'sector-options',
          queryOptions
        );
        this.sectorOptions = sectortypes.rows.map((sector) => sector.key);
        this.sectorOptions.unshift('');

        } catch (err) {
            this.error(err);
        }
    }

  private async filterFn(val: string, update: any, abort: any) {
    if (val.length < 2) {
      abort();
      return;
    }

    update(async () => {
      try {
        const roDB: Client<any> = couchService.masterDB;
        const queryOptions: ListOptions = {
          limit: 10,
          start_key: val.toLowerCase(),
          inclusive_end: true,
          descending: false
        };
        const vessels = await roDB.view<any>(
          'sethtest',
          'all_vessels',
          queryOptions
        );
        console.log(vessels);
        this.options = vessels.rows.map((vessel) => vessel.key);
      } catch (err) {
        this.error(err);
      }
    });
  }

  private created() {
      this.getOptions();
  }

  private get permitOptions() {
      return this.permit.permits.map((permit) => permit.permit_number);
  }

  private get getEfpTypes() {
    if (this.emefp.activeEmefpPermit && this.emefp.activeEmefpPermit.efpTypes) {
      return this.emefp.activeEmefpPermit.efpTypes.map((type) => type.description);
    } else {
      return [];
    }
  }



  private async updateVessel(vesselName: string) {

      try {
        const roDB: Client<any> = couchService.masterDB;

        const vessels = await roDB.view<any>(
          'sethtest',
          'all_vessels',
        );

        const formattedVessels = [];
        for (const row of vessels.rows) {
            formattedVessels.push(row.value);
        }

        const vessel = formattedVessels.find((formattedVessel) => formattedVessel.vesselName === vesselName );
        console.log(vessel);
        if (this.emefp.activeEmefpPermit) {
          if (vessel.coastGuardNumber) {
            this.emefp.activeEmefpPermit.vesselCGNumber = vessel.coastGuardNumber;
          } else {
            this.emefp.activeEmefpPermit.vesselCGNumber = vessel.stateRegulationNumber;
          }
          this.emefp.activeEmefpPermit.vesselId = vessel._id;
        }

      } catch (err) {
          this.error(err);
      }
  }

}

</script>
