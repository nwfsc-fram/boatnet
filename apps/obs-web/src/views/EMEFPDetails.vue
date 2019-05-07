<template>
    <div class="q-pa-md  q-gutter-md">

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
            {{alert.message}}
            <template v-slot:action>
                <q-btn flat label="Dismiss" @click="clear"/>
            </template>
        </q-banner>

        <q-card style="padding: 20px; max-width: 400px">
          <div v-if="this.$route.params.id === 'new'">
            <q-input v-model="emefp.activeEmefp.emEfpNumber" label="EM Nubmer"></q-input>
            <q-select v-model="emefp.activeEmefp.vesselName" label="Vessel" :options="options" @filter="filterFn" use-input stack-label ></q-select>
          </div>
          <div v-else>
            <div class="text-h6" >{{ emefp.activeEmefp.emEfpNumber }}</div>
            <div style="diplay: flex">
              <div>Vessel: {{ emefp.activeEmefp.vesselName }}</div>
              <div>Vessel ID: {{ emefp.activeEmefp.vesselCGNumber }}</div>
              <div>LE Permit: {{ emefp.activeEmefp.lePermit }}</div>
            </div>
          </div>

            <!-- <q-select
            v-model="emefp.activeEmefp.vesselName"
            label="Vessel Name"
            use-input
            hide-selected
            :options="options"
            @filter="filterFn"
            @input="updateVessel(emefp.activeEmefp.vesselName)">
            <template>{{ emefp.activeEmefp.vesselCGNumber }} </template>
            </q-select> -->

            <q-select
            v-model="efpTypes"
            label="EFP Types"
            bg-color="white"
            color="primary"
            multiple
            use-chips
            :options="efpTypeOptions"
            >
            </q-select>

            <q-select
            v-model="emefp.activeEmefp.gear"
            label="Gear"
            bg-color="white"
            color="primary"
            multiple
            use-chips
            :options="gearTypeOptions">
            </q-select>

            <!-- <q-select
            v-model="emefp.activeEmefp.lePermit"
            label="Limited Entry Permit"
            :options="permitOptions">
            </q-select> -->
            <br>
            <q-card-actions>
                <q-btn color="red" label="Cancel" icon="warning" to="/em-efp-management" exact/>
                <q-btn color="primary" to="/em-efp-management" exact>Save</q-btn>
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
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';

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
        // const masterDB: Client<any> = couchService.masterDB;
        const pouchDB = pouchService.db;
        const queryOptions: ListOptions = {
          limit: 100,
          start_key: 'a',
          inclusive_end: true,
          descending: false
        };

        const efptypes = await pouchDB.lookupsDBName.view<any>(
          'obs_web',
          'efp-type-options',
          queryOptions
        );
        this.efpTypeOptions = efptypes.rows.map((efp: any) => efp.key);

        const geartypes = await pouchDB.lookupsDBName.view<any>(
          'obs_web',
          'gear-type-options',
          queryOptions
        );
        this.gearTypeOptions = geartypes.rows.map((gear: any) => gear.key);

        } catch (err) {
            this.error(err);
        }
    }

  private async filterFn(val: string, update: any, abort: any) {
    // if (val.length < 2) {
    //   abort();
    //   return;
    // }

    update(async () => {
      try {
        const masterDB: Client<any> = couchService.masterDB;
        const queryOptions: ListOptions = {
          limit: 10,
          start_key: val.toLowerCase(),
          inclusive_end: true,
          descending: false
        };
        const vessels = await masterDB.view<any>(
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

  get efpTypes(): string[] {
    if (this.emefp.activeEmefp && this.emefp.activeEmefp.efpTypes) {
      return this.emefp.activeEmefp.efpTypes.map((efpType) => efpType.description);
    } else {
      return [];
    }
  }

  set efpTypes(value: string[]) {
    if (this.emefp.activeEmefp) {
      this.emefp.activeEmefp.efpTypes = [];
      for (const item of value) {
        this.emefp.activeEmefp.efpTypes.push(
          {description: item}
        );
      }
    }
  }

  private async updateVessel(vesselName: string) {

      try {
        const masterDB: Client<any> = couchService.masterDB;

        const vessels = await masterDB.view<any>(
          'sethtest',
          'all_vessels',
        );

        const formattedVessels = [];
        for (const row of vessels.rows) {
            formattedVessels.push(row.value);
        }

        const vessel = formattedVessels.find((formattedVessel) => formattedVessel.vesselName === vesselName );
        console.log(vessel);
        if (this.emefp.activeEmefp) {
          if (vessel.coastGuardNumber) {
            this.emefp.activeEmefp.vesselCGNumber = vessel.coastGuardNumber;
          } else {
            this.emefp.activeEmefp.vesselCGNumber = vessel.stateRegulationNumber;
          }
          this.emefp.activeEmefp.vesselId = vessel._id;
        }

      } catch (err) {
          this.error(err);
      }
  }

}

</script>
