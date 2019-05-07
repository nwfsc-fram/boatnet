<template>
  <div>
    <q-card>
      <q-card-section>
        <q-card bordered style="margin: 20px; padding: 20px; max-width: 400px">
          <q-card-section>
          <div class="text-h6 text-primary">
            <strong>
              {{ ots.activeOTSTarget.fishery }} :
              {{ ots.activeOTSTarget.targetType }}
              <span
                v-if="ots.activeOTSTarget.targetType === 'Vessel'"
              >: {{ ots.activeOTSTarget.targetVesselName }}</span>
              <span
                v-if="ots.activeOTSTarget.targetType === 'Port Group'"
              >: {{ ots.activeOTSTarget.targetPortGroupDescription }}</span>
            </strong>
          </div>

          <q-input
            v-model="ots.activeOTSTarget.coverageGoal"
            label="Coverage Goal"
            dense
            :rules="[val => { return val <= 100 && val >= 0  || 'rate must be between 0 and 100 %'}]"
          >
            <template v-slot:append>%</template>
          </q-input>

          <q-input
            v-model="ots.activeOTSTarget.setRate"
            dense
            :rules="[val => { return val <= 100 && val >= 0  || 'rate must be between 0 and 100 %'}]"
            label="Set Rate"
          >
            <template v-slot:append>%</template>
          </q-input>

          <q-input
            v-model="ots.activeOTSTarget.effectiveDate"
            mask="date"
            :rules="['date']"
            label="Effective Date"
            style="padding-bottom: 0"
          >
            <template>
                <q-popup-proxy>
                  <q-date v-model="ots.activeOTSTarget.effectiveDate"/>
                </q-popup-proxy>
            </template>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
              </q-icon>
            </template>
          </q-input>

          <q-input
            v-model="ots.activeOTSTarget.expirationDate"
            mask="date"
            :rules="['date']"
            label="Expiration Date"
            style="padding-bottom: 0"
          >
          <template>
            <q-popup-proxy>
              <q-date v-model="ots.activeOTSTarget.expirationDate"/>
            </q-popup-proxy>
          </template>
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
              </q-icon>
            </template>
          </q-input>
      </q-card-section>
      <q-card-actions>
          <q-btn color="red" label="Cancel" icon="warning" to="/ots-management" exact/>
          <q-btn color="primary">Save</q-btn>
      </q-card-actions>

        </q-card>

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
import { OtsTarget } from '@boatnet/bn-models';

@Component
export default class OtsTargeteDetail extends Vue {
  @State('ots') private ots!: OTSState;

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
    if (newVal === 'Fishery' && this.ots.activeOTSTarget) {
      this.ots.activeOTSTarget.targetType = 'fishery wide';
    }
  }
}
</script>
