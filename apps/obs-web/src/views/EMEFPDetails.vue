<template>
    <div class="q-pa-md  q-gutter-md">

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
            {{alert.message}}
            <template v-slot:action>
                <q-btn flat label="Dismiss" @click="clear"/>
            </template>
        </q-banner>

        <q-card style="padding: 20px; max-width: 400px" class="bg-blue-grey-1">
          <!-- <div v-if="this.$route.params.id === 'new'"> -->
            <q-input v-model="emefp.activeEmefp.emEfpNumber" label="EM Number" @click.native="selectText"></q-input>
            <q-select
              v-model="emefp.activeEmefp.vessel"
              label="Vessel"
              :options="vessels"
              @filter="vesselsFilterFn"
              use-input
              fill-input
              hide-selected
              stack-label
              :option-label="opt => opt.vesselName + ' (' + (opt.coastGuardNumber ? opt.coastGuardNumber : opt.stateRegulationNumber)  + ')'"
              option-value="_id"
               @click.native="selectText"
              >
            </q-select>

            <div class="text-h6" >{{ emefp.activeEmefp.emEfpNumber }}</div>

            <div style="diplay: flex" v-if="emefp.activeEmefp.vessel">
              <div>Vessel: {{ emefp.activeEmefp.vessel.vesselName ? emefp.activeEmefp.vessel.vesselName : '' }}</div>
              <div>Vessel ID: {{ emefp.activeEmefp.vessel.coastGuardNumber ? emefp.activeEmefp.vessel.coastGuardNumber : emefp.activeEmefp.vessel.stateRegulationNumber }}</div>
              <div>LE Permit: <span v-if="emefp.activeEmefp.lePermit">{{ emefp.activeEmefp.lePermit.permitNumber ? emefp.activeEmefp.lePermit.permitNumber : emefp.activeEmefp.lePermit }}</span></div>
            </div>


            <q-select
              v-model="emefp.activeEmefp.lePermit"
              label="LE Permit"
              bg-color="bg-blue-grey-1"
              color="primary"
              use-chips
              option-label="permitNumber"
              option-value="permitNumber"
              emit-value
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
              :options="gearTypeOptions"
            >
            </q-select>

            <q-input label="Notes" v-model="emefp.activeEmefp.notes"></q-input>
            <br>
            <q-card-actions>
                <q-btn color="red" label="Cancel" icon="warning" to="/em-efp-management" exact/>
                <q-btn color="primary" @click="saveEmEfp">Save</q-btn>
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
import moment from 'moment';

import { Client, CouchDoc, ListOptions } from 'davenport';
import { CouchDBInfo, couchService } from '@boatnet/bn-couch';
import { AuthState, authService } from '@boatnet/bn-auth';

import { Notify } from 'quasar';

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
    private vessels = [];

    constructor() {
        super();
    }

    private selectText(event: any) {
      event.target.select();
    }

    private async getOptions() {
        try {
          const masterDb = couchService.masterDB;

          const queryOptions = {
            inclusive_end: true,
            descending: false,
            include_docs: true,
            reduce: false,
            key: 'efp-type'
          };

          const efptypes = await masterDb.view(
            'obs_web',
            'all_doc_types',
            queryOptions
          );

          this.efpTypeOptions = efptypes.rows.map((row: any) => row.doc);

          queryOptions.key = 'gear-type';

          const geartypes = await masterDb.view(
            'obs_web',
            'all_doc_types',
            queryOptions
          );

          this.gearTypeOptions = geartypes.rows.map((row: any) => row.doc).sort( (a: any, b: any ) => {
            if (a.description > b.description) {
              return 1;
            } else if (a < b) {
              return -1;
            } else {
              return 0;
            }
          });

        } catch (err) {
            this.error(err);
        }
    }

  private vesselsFilterFn(val: string, update: any, abort: any) {
    update(async () => {
      if (val === '') {
        try {
          const masterDb = couchService.masterDB;
          const queryOptions = {
            start_key: '',
            end_key: '' + '\u9999',
            inclusive_end: true,
            descending: false,
            include_docs: true,
            limit: 30
          };

          const vessels = await masterDb.view(
            'obs_web',
            'all_vessel_names',
            queryOptions
          );
          this.vessels = vessels.rows.map((row: any) => row.doc);
        } catch (err) {
          console.log(err);
        }
      } else {
        try {
          const masterDb = couchService.masterDB;
          const queryOptions = {
            start_key: val.toLowerCase(),
            end_key: val.toLowerCase() + '\u9999',
            inclusive_end: true,
            descending: false,
            include_docs: true,
            limit: 30
          };

          const vessels = await masterDb.view(
            'obs_web',
            'all_vessel_names',
            queryOptions
          );
          this.vessels = vessels.rows.map((row: any) => row.doc);
        } catch (err) {
          console.log(err);
        }
    }
    });
  }

  private created() {
      this.getOptions();
      // this.getVessels();
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

  private async saveEmEfp() {
    // Enforce Required Fields
    if (this.emefp.activeEmefp.efpTypes.length < 1 || this.emefp.activeEmefp.gear.length < 1 || !this.emefp.activeEmefp.lePermit || !this.emefp.activeEmefp.vessel ) {
      Notify.create({
        message: '<b>All fields are required (except notes), please complete missing info</b>',
            position: 'center',
            color: 'primary',
            timeout: 2000,
            icon: 'warning',
            html: true,
            multiLine: true
        });
      return;
    }

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

            this.emefp.activeEmefp.updatedBy = authService.getCurrentUser()!.username;
            this.emefp.activeEmefp.updatedDate = moment().format();

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
