<template>
  <div>
    <q-card bordered>
      <q-card-section>
        <q-list>
          <q-item v-if="ots.newTarget">
            <q-item-section>
            <q-select
            v-model="ots.activeOTSTarget.fishery"
            dense
            label="Fishery"
            stack-label
            :options="fisheries"
            ></q-select>

            <q-select
            v-model="ots.activeOTSTarget.targetType"
            dense
            label="Target Type"
            stack-label
            :options="targetTypes"
            ></q-select>
            </q-item-section>
          </q-item>

          <q-item v-else class="text-h6 text-primary">
            <q-item-section>
            <strong>
              {{ ots.activeOTSTarget.fishery }} :
              {{ ots.activeOTSTarget.targetType }} Target
              <span
                v-if="ots.activeOTSTarget.targetType === 'Vessel'"
              >: {{ ots.activeOTSTarget.targetVessel.vesselName }}  ( {{ ots.activeOTSTarget.targetVessel.coastGuardNumber ? ots.activeOTSTarget.targetVessel.coastGuardNumber : ots.activeOTSTarget.targetVessel.stateRegulationNumber }} )</span>
              <span
                v-if="ots.activeOTSTarget.targetType === 'Port Group'"
              >: {{ ots.activeOTSTarget.targetPortGroup }}</span>
            </strong>
            </q-item-section>
          </q-item>


          <q-item v-if="ots.activeOTSTarget.targetType === 'Vessel'">
            <q-item-section>
            <q-select
            v-model="ots.activeOTSTarget.targetVessel"
            dense
            label="Target Vessel"
            stack-label
            option-label="vesselName"
            option-value="_id"
            use-input
            @filter="filterVessels"
            :options="vessels">
            </q-select>
            </q-item-section>
          </q-item>

          <q-item v-if="ots.activeOTSTarget.targetType === 'Port Group'">
            <q-item-section>
            <q-select
            v-model="ots.activeOTSTarget.targetPortGroup"
            dense
            label="Target Port Group"
            stack-label
            option-label="portGroup"
            option-value="_id"
            use-input
            :options="portGroups">
            </q-select>
            </q-item-section>
          </q-item>

            <q-item>
              <q-item-section>
              <q-item-label><strong>Coverage Goal<br><br></strong></q-item-label>
                <q-slider
                v-model="ots.activeOTSTarget.coverageGoal"
                :min="0"
                :max="100"
                label-always
                >
                </q-slider>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
              <q-item-label><strong>Set Rate<br><br></strong></q-item-label>
                <q-slider
                v-model="ots.activeOTSTarget.setRate"
                :min="0"
                :max="100"
                label-always
                color="green"
                >
                </q-slider>
              </q-item-section>
            </q-item>

          <div class="row items-start">

              <q-item>
                <q-item-section>

                  <div class="text-subtitle2" >Effective Date</div>
                  <q-date
                      v-model="effectiveDate"
                      :options="optionsFn"
                      color="green"
                      dark
                      >
                  </q-date>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section>
                  <div class="text-subtitle2">Expiration Date</div>
                  <q-date
                      v-model="expirationDate"
                      color="red"
                      dark
                      :options="expirationDateOptionsFn"
                      >
                  </q-date>
                  </q-item-section>
              </q-item>
          </div>

          </q-list>

<br>
      <q-card-actions>
          <q-btn color="red" label="Cancel" icon="warning" to="/ots-management" exact/>
          <q-btn color="primary" @click="saveTarget">Save</q-btn>
      </q-card-actions>

      </q-card-section>

      <q-card-section>
        <q-table
          title="Target History"
          :data="data"
          :columns="columns"
          dense
          row_key="_id"
          hide-bottom
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="coverageGoal" :props="props">{{ props.row.coverageGoal }}%</q-td>
              <q-td key="setRate" :props="props">{{ props.row.setRate }}%</q-td>
              <q-td key="effectiveDate" :props="props">{{ props.row.effectiveDate }}</q-td>
              <q-td key="expirationDate" :props="props">{{ props.row.expirationDate }}</q-td>
              <q-td key="changedBy" :props="props">{{ props.row.changedBy }}</q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import moment from 'moment';
import date from 'quasar';
import {
  GeneralState,
  PermitState,
  OTSState
} from '../_store/types/types';
import { OTSTarget, Vessel } from '@boatnet/bn-models';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { AlertState } from '../_store/types/types';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';

@Component
export default class OtsTargeteDetail extends Vue {
  @State('ots') private ots!: OTSState;

  @Action('clear', { namespace: 'alert' }) private clear: any;
  @Action('error', { namespace: 'alert' }) private error: any;

  @State('alert') private alert!: AlertState;
  @Action('clear', { namespace: 'alert' }) private clearAlert: any;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;

  private fisheries = [];
  private targetTypes = [];

  private vessels: Vessel[] = [];
  private portGroups = ['TO DO - Populate DB with Port Groups'];

  private columns = [
    {
      name: 'coverageGoal',
      label: 'Coverage Goal',
      field: 'coverageGoal',
      required: true,
      align: 'left',
      sortable: true
    },
    {
      name: 'setRate',
      label: 'Set Rate',
      field: 'setRate',
      required: true,
      align: 'left',
      sortable: true
    },
    {
      name: 'effectiveDate',
      label: 'Effective Date',
      field: 'effectiveDate',
      required: true,
      align: 'left',
      sortable: true
    },
    {
      name: 'expirationDate',
      label: 'Expiration Date',
      field: 'expirationDate',
      required: true,
      align: 'left',
      sortable: true
    },
    {
      name: 'changedBy',
      label: 'Changed By',
      field: 'changedBy',
      required: true,
      align: 'left',
      sortable: true
    }
  ];

  private data = [
    {
      _id: 'dfe24rgsdfg34rwersg',
      coverageGoal: 35,
      setRate: 37,
      effectiveDate: moment().format('MM/DD/YYYY'),
      expirationDate: '12/31/' + moment().format('YYYY'),
      changedBy: 'Scott Leach'
    },
    {
      _id: 'gergse545yehtdfg',
      coverageGoal: 25,
      setRate: 29,
      effectiveDate: moment().format('MM/DD/YYYY'),
      expirationDate: '12/31/' + moment().format('YYYY'),
      changedBy: 'John La Fargue'
    },
    {
      _id: 'gdhe45e45ydthnytesrfgb',
      coverageGoal: 17,
      setRate: 27,
      effectiveDate: moment().format('MM/DD/YYYY'),
      expirationDate: '12/31/' + moment().format('YYYY'),
      changedBy: 'Scott Leach'
    },
    {
      _id: 'wtsdgdhrt5dure7yh',
      coverageGoal: 43,
      setRate: 43,
      effectiveDate: moment().format('MM/DD/YYYY'),
      expirationDate: '12/31/' + moment().format('YYYY'),
      changedBy: 'John La Fargue'
    }
  ];

  @Watch('ots.activeOTSTarget.targetType')
  private onChange(newVal: any, oldVal: any) {
    if (oldVal === 'Vessel' && this.ots.activeOTSTarget && this.ots.activeOTSTarget.targetVessel) {
      this.ots.activeOTSTarget.targetVessel = undefined;
    }
    if (oldVal === 'Port Group' && this.ots.activeOTSTarget && this.ots.activeOTSTarget.targetPortGroup) {
      this.ots.activeOTSTarget.targetPortGroup = undefined;
    }
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

        const allFisheries = await pouchDB.query(
          pouchService.lookupsDBName,
          'obs_web/all_fisheries',
          queryOptions
        );
        this.fisheries = allFisheries.rows.map((row: any) => row.key);

        const otsTargetTypes = await pouchDB.query(
          pouchService.lookupsDBName,
          'obs_web/ots-target-types',
          queryOptions
        );
        this.targetTypes = otsTargetTypes.rows.map((row: any) => row.key);

        } catch (err) {
            this.error(err);
        }
    }

    private optionsFn(val: string) {
      return moment(val) >= moment().subtract(1, 'days');
    }

    private async saveTarget() {
      if (this.ots.activeOTSTarget && this.ots.activeOTSTarget._id && this.ots.activeOTSTarget._rev) {
        try {
          const masterDB: Client<any> = couchService.masterDB;

          delete this.ots.activeOTSTarget.__index;
          this.ots.activeOTSTarget.updatedBy = authService.getCurrentUser()!.username;
          this.ots.activeOTSTarget.updatedDate = moment().format();

          masterDB.put(this.ots.activeOTSTarget._id,
                        this.ots.activeOTSTarget,
                        this.ots.activeOTSTarget._rev)
                        .then( () => {this.$router.push({path: '/ots-management'});
                        });
        } catch (err) {
          console.log(err);
          }
      } else {
        try {
          const masterDB: Client<any> = couchService.masterDB;

          masterDB.post(this.ots.activeOTSTarget).then( () => {
                      this.$router.push({path: '/ots-management'});
                  });
        } catch (err) {
          console.log(err);
        }

      }
    }

    get effectiveDate(): string {
        if (this.ots.activeOTSTarget) {
            return moment(this.ots.activeOTSTarget.effectiveDate).format('YYYY/MM/DD');
        } else {
          return '';
        }
    }

    set effectiveDate(value: string) {
        if (this.ots.activeOTSTarget) {
            this.ots.activeOTSTarget.effectiveDate = value;
        }
    }

    get expirationDate(): string {
        if (this.ots.activeOTSTarget) {
            return moment(this.ots.activeOTSTarget.expirationDate).format('YYYY/MM/DD');
        } else {
          return '';
        }
    }

    set expirationDate(value: string) {
        if (this.ots.activeOTSTarget) {
            this.ots.activeOTSTarget.expirationDate = value;
        }
    }

    private expirationDateOptionsFn(val: string) {
      if (this.ots.activeOTSTarget && this.ots.activeOTSTarget.effectiveDate) {
          return moment(val) >= moment(this.ots.activeOTSTarget.effectiveDate);
      }
    }

    private filterVessels(val: string, update: any, abort: any) {
      update(async () => {
            try {
              const masterDB: Client<any> = couchService.masterDB;
              const queryOptions: ListOptions = {
                limit: 7,
                start_key: val.toLowerCase(),
                inclusive_end: true,
                descending: false
              };

              const vessels = await masterDB.viewWithDocs<any>(
                'optecs_trawl',
                'all_vessel_names',
                queryOptions
              );

              this.vessels = vessels.rows.map((row: any) => row.doc);
            } catch (err) {
              this.errorAlert(err);
            }
          });
        }

    private created() {
      this.getOptions();
    }

}
</script>
