<template>
  <div>
    <q-dialog v-model="dcsDetailsDialog" persistent position="bottom">
      <q-card>
        <q-card-section>
          <b>DCS Row Details</b>
          <b style="float: right">Trip Return Date: {{ formatDate(dcsRow.tripReturnDate) }}</b>
              <div class="row items-start">
                <q-input class="col dcs-dialog" v-model="dcsRow.tripNum" label="Trip #" outlined dense></q-input>
                <q-input class="col dcs-dialog" v-model="dcsRow.haulNum" label="Haul #" outlined dense></q-input>
                <q-select
                   class="col dcs-dialog"
                  v-model="dcsRow.level"
                  :options="Object.values(TripLevel)"
                  label="Level"
                  outlined
                  dense
                  options-dense
                ></q-select>
              </div>
              <div class="row items-start">
                <q-select
                  class="col dcs-dialog"
                  v-model="dcsRow.dcsErrorType"
                  :options="Object.values(DcsErrorType)"
                  label="Error Type"
                  outlined
                  dense
                  options-dense
                ></q-select>
                <q-select
                  v-if="dcsRow.afiFlag"
                  class="col dcs-dialog"
                  v-model="dcsRow.afiFlag"
                  :options="Object.values(AfiFlag)"
                  label="AFI Flag (optional)"
                  outlined
                  dense
                  options-dense
                ></q-select>
              </div>
              <q-input class="col dcs-dialog" type="textarea" autogrow v-model="dcsRow.issue" label="Issue" outlined dense></q-input>
            <br>
          <div style="text-align: right">
            <q-btn class="dcs-dialog" color="primary" size="md"  @click="submit">submit</q-btn>
            <q-btn class="dcs-dialog" color="red" size="md" @click="dismiss">Cancel</q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { createComponent, ref, onMounted, watch } from '@vue/composition-api';
import Vue, { WatchOptions } from 'vue';
import moment from 'moment';
import { Notify } from 'quasar';

import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import { authService } from '@boatnet/bn-auth/lib';

import Calendar from 'primevue/calendar';
Vue.component('pCalendar', Calendar);

import Multiselect from 'vue-multiselect';
Vue.component('multiselect', Multiselect);

import { DcsRow, TripLevel, CollectionMethod, DcsErrorType, AfiFlag } from '@boatnet/bn-models';

export default createComponent({
  props: {
    rowData: Object,
    dcsDetailsDialog: Boolean,
    isAfi: String
  },
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;
    const dcsRow: any = ref({});

    const buildRow = async (isAfi: boolean | string) => {
      const rowData: any = props.rowData;
      let trip: any = null;

      if (!rowData.returnDate) {
        const tripIdKey = ['tripId', rowData['legacy-tripId'] ? rowData['legacy-tripId'] : rowData['tripId']];
        const tripQuery: any = await masterDB.view(
            'obs_web',
            'wcgop_trips_compound_fields',
            {include_docs: true, reduce: false, key: tripIdKey} as any
        );
        trip = tripQuery.rows[0] ? tripQuery.rows[0].doc : null;
      }

      if (rowData) {
        if (props.isAfi !== 'blank') {
            return {
                type: 'dcs-row',
                observerId: state.debriefer.observer,
                tripNum: rowData.tripId ? rowData.tripId : rowData.tripNum ? rowData.tripNum : rowData['legacy-tripId'] ? rowData['legacy-tripId'] :  '',
                haulNum: rowData.operationNum ? rowData.operationNum : rowData.haulNum ? rowData.haulNum : '',
                collectionMethod: '',
                createdDate: moment().format(),
                createdBy: authService.getCurrentUser()!.username,
                level: rowData.type === 'wcgop-trip' ? 'Trip' :
                       rowData.type === 'wcgop-operation' ? 'Haul' :
                       rowData.specimenType ? 'BS' :
                       rowData.catchNum ? 'Catch' :
                       'Other',
                issue: rowData.description ? rowData.description : rowData.catchNum ? 'Catch # ' + rowData.catchNum + ' issue: ' : '',
                dcsErrorType: rowData.severity ? rowData.severity : '',
                afiFlag: isAfi === 'true' ? 'Improvement' : '-',
                afiDate: isAfi === 'true' ? moment().format() : '-',
                observerNotes: '',
                isResolved: false,
                isHidden: false,
                tripReturnDate: rowData.returnDate ? rowData.returnDate : trip ? trip.returnDate : rowData.tripReturnDate ? rowData.tripReturnDate :  moment().format()
            } as any;
        } else {
            return {
                type: 'dcs-row',
                observerId: state.debriefer.observer,
                tripNum: '',
                haulNum: '',
                collectionMethod: '',
                createdDate: moment().format(),
                createdBy: authService.getCurrentUser()!.username,
                level: '',
                issue: '',
                dcsErrorType: '',
                afiFlag: '-',
                afiDate: '-',
                observerNotes: '',
                isHidden: false,
                tripReturnDate: rowData.returnDate ? rowData.returnDate : trip ? trip.returnDate : rowData.tripReturnDate ? rowData.tripReturnDate :  moment().format()
            };
        }
      } else {
          return {
            type: 'dcs-row',
            observerId: state.debriefer.observer,
            tripNum: '',
            haulNum: '',
            collectionMethod: '',
            createdDate: moment().format(),
            createdBy: authService.getCurrentUser()!.username,
            level: '',
            issue: '',
            dcsErrorType: '',
            afiFlag: '-',
            afiDate: '-',
            observerNotes: '',
            isHidden: false,
            tripReturnDate: rowData.returnDate ? rowData.returnDate : trip ? trip.returnDate : rowData.tripReturnDate ? rowData.tripReturnDate :  moment().format()
        };
      }
    };


    const addToDcs = async (isAfi: any) => {
        dcsRow.value = await buildRow(isAfi);
    };


    const submit = async () => {
        if (dcsRow.value.afiFlag !== '-') {
          dcsRow.value.afiDate = moment().format();
        }
        dcsRow.value.type = 'dcs-row';
        dcsRow.value.observerId = state.debriefer.observer;
        if (!dcsRow.value.tripReturnDate) {
          dcsRow.value.tripReturnDate = moment().format();
        }
        const result = await masterDB.post(dcsRow.value);
        if (result) {
          Notify.create({
            message: 'issue added to dcs.'
          });
        }
        store.dispatch('debriefer/setNewDcsRow', result);
        dismiss();
    };

    const dismiss = () => {
        context.emit('close');
    };

    const formatDate = (date: string) => {
      return moment(date).format('MM/DD/YYYY');
    };

    watch(() => [props.rowData, props.isAfi], (newVal, oldVal) => {
        if (props.rowData) {
            addToDcs(props.isAfi);
        }
    });

    return {
        submit, dcsRow, TripLevel, DcsErrorType, AfiFlag, dismiss, formatDate
    };
  }
});
</script>

<style scoped>
    .dcs-dialog {
    margin: 5px !important;
    }
</style>