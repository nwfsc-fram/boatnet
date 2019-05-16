<template>
    <div class="q-pa-md  q-gutter-md">

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
            {{alert.message}}
            <template v-slot:action>
                <q-btn flat label="Dismiss" @click="clear"/>
            </template>
        </q-banner>

        <q-card style="padding: 20px; max-width: 400px" class="bg-blue-grey-1">
          <div v-if="this.$route.params.id === 'new'">
            <q-input v-model="emefp.activeEmefp.emEfpNumber" label="EM Nubmer"></q-input>
            <q-select v-model="emefp.activeEmefp.vessel" label="Vessel" :options="options" @filter="filterFn" use-input stack-label option-label="vesselName"
            option-value="_id"></q-select>
          </div>
          <div v-else>
            <div class="text-h6" >{{ emefp.activeEmefp.emEfpNumber }}</div>
            <div style="diplay: flex">
              <div>Vessel: {{ emefp.activeEmefp.vesselName ? emefp.activeEmefp.vesselName : emefp.activeEmefp.vessel.vesselName }}</div>
              <div>Vessel ID: {{ emefp.activeEmefp.vesselCGNumber ? emefp.activeEmefp.vesselCGNumber : emefp.activeEmefp.vessel.coastGuardNumber ? emefp.activeEmefp.vessel.coastGuardNumber : emefp.activeEmefp.vessel.stateRegulationNumber }}</div>
              <div>LE Permit: <span v-if="emefp.activeEmefp.lePermit">{{ emefp.activeEmefp.lePermit.permit_number ? emefp.activeEmefp.lePermit.permit_number : emefp.activeEmefp.lePermit }}</span></div>
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
            v-model="emefp.activeEmefp.lePermit"
            label="LE Permit"
            bg-color="bg-blue-grey-1"
            color="primary"
            use-chips
            option-label="permit_number"
            option-value="permit_number"
            :options="permit.permits"
            >

            </q-select>

            <q-select
            v-model="emefp.activeEmefp.efpTypes"
            label="EFP Types"
            bg-color="bg-blue-grey-1"
            color="primary"
            multiple
            option-label="description"
            option-value="_id"
            use-chips
            :options="efpTypeOptions"
            >
            </q-select>

            <q-select
            v-model="emefp.activeEmefp.gear"
            label="Gear"
            bg-color="bg-blue-grey-1"
            color="primary"
            multiple
            use-chips
            option-label="description"
            option-value="_id"
            :options="gearTypeOptions">
            </q-select>

            <q-input label="Notes" v-model="emefp.activeEmefp.notes"></q-input>
            <!-- <q-select
            v-model="emefp.activeEmefp.lePermit"
            label="Limited Entry Permit"
            :options="permitOptions">
            </q-select> -->
            <br>
            <q-card-actions>
                <q-btn color="red" label="Cancel" icon="warning" to="/em-efp-management" exact/>
                <q-btn color="primary" @click="saveEmEfp">Save</q-btn>
                <q-btn color="red" label="?" icon="fa fa-trash"/>
                <!-- <q-btn color="red" label="Delete/ Close" icon="fa fa-ban"/> -->
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
import axios from 'axios';

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
    private permits = [];

    constructor() {
        super();
    }

    private async getOptions() {
        try {
        // const masterDB: Client<any> = couchService.masterDB;
        const pouchDB = pouchService.db;
        const queryOptions: ListOptions = {
          limit: 100,
          start_key: '',
          inclusive_end: true,
          descending: false
        };

        const efptypes = await pouchDB.query(
          pouchService.lookupsDBName,
          'obs_web/efp-type-options',
          queryOptions
        );
        this.efpTypeOptions = efptypes.rows.map((efp: any) => efp.value);

        const geartypes = await pouchDB.query(
          pouchService.lookupsDBName,
          'obs_web/gear-type-options',
          queryOptions
        );
        this.gearTypeOptions = geartypes.rows.map((gear: any) => gear.value);

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
          this.options = vessels.rows.map((vessel) => vessel.value);
        } catch (err) {
          this.error(err);
        }
      });
  }

  private created() {
      this.getOptions();
      this.getPermits();
  }

  private getPermits() {
      axios.get('https://www.webapps.nwfsc.noaa.gov/apex/ifq/permits/public_permits_active_v/?limit=500')
          .then( (response) => {
              // this.$store.dispatch('updatePermits', response.data.items);
              this.permits = response.data.items;
              console.log(this.permits);
          });
  }

  get efpTypes() {
    if (this.emefp.activeEmefp && this.emefp.activeEmefp.efpTypes) {
      return this.emefp.activeEmefp.efpTypes.map((efpType: any) => efpType.description);
    } else {
      return [];
    }
  }

  set efpTypes(value) {
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

  private async saveEmEfp() {
    const masterDB: Client<any> = couchService.masterDB;
    if (this.emefp.newEmEfp) {
      try {
          masterDB.post(this.emefp.activeEmefp).then(
            () => this.$router.push({path: '/em-efp-management'})
          );
        } catch (err) {
          this.error(err);
        }
    } else {
        try {
          if (this.emefp.activeEmefp) {
            delete this.emefp.activeEmefp.__index;

            masterDB.put(this.emefp.activeEmefp._id,
                          this.emefp.activeEmefp,
                          this.emefp.activeEmefp._rev)
                          .then( () => {this.$router.push({path: '/em-efp-management'});
                          });
            }
        } catch (err) {
          this.error(err);
          }
    }
  }

}

</script>
