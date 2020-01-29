<template>
  <div class="q-pa-md q-gutter-md">
      <div
        class="text-h6" style="max-width: 60%">
      <span v-if="apiTrip.tripNum">Trip {{ apiTrip.tripNum }} - {{ apiTrip.vesselName }} ({{ apiTrip.vesselId }}) - </span> Data Comparison
      </div>

      <div style="position: absolute; top: 30px; right: 15px">
      <q-input v-model="tripNum" label="Trip # (6 digit)" style="width: 170px" @keyup.enter.native="getAPITripData">
        <template v-slot:append>
            <q-btn color="primary" type="submit" @click="getAPITripData">load</q-btn>
        </template>
      </q-input>
      </div>

    <q-table
      :data="tripData"
      :columns="columns"
      dense
      row-key="id"
      selection="single"
      :selected.sync="selected"
      :pagination.sync="pagination"
      binary-state-sort
      hide-bottom
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="_id"></q-td>
          <q-td key="haul" :props="props">{{ props.row.haul ? props.row.haul : '' }}</q-td>
          <q-td key="species" :props="props">{{ props.row.species ? capitalize(props.row.species) : '' }}</q-td>
          <q-td key="logbookDiscard" :props="props" >{{ props.row.logbookDiscard ? props.row.logbookDiscard : '' }}</q-td>
          <q-td key="logbookRetained" :props="props" >{{ props.row.logbookRetained ? props.row.logbookRetained : '' }}</q-td>
          <q-td key="thirdPartyReview" :props="props" >{{ props.row.thirdPartyReview ? props.row.thirdPartyReview : '' }}</q-td>
          <q-td key="diffReviewLogbook" :props="props" :class="getClass(props.row.diffReviewLogbook)" >{{ props.row.diffReviewLogbook ? props.row.diffReviewLogbook : '' }}</q-td>
          <q-td key="audit" :props="props">{{ props.row.audit ? props.row.audit : '' }}</q-td>
          <q-td key="diffAuditReview" :props="props" :class="getClass(props.row.diffAuditReview)">{{ props.row.diffAuditReview ? props.row.diffAuditReview : '' }}</q-td>
        </q-tr>
      </template>
    </q-table>

  </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  onServerPrefetch
} from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';

import { Notify } from 'quasar';

import { getTripsApiTrip, getCatchApiCatch } from '../helpers/trips-api';

export default createComponent({
  setup(props, context) {
    const columns: any = [
      { name: 'haul', label: 'Haul', field: 'haul', required: false, align: 'left', sortable: true },
      { name: 'species', label: 'Species', field: 'species', required: false, align: 'left', sortable: true },
      { name: 'logbookDiscard', label: 'Logbook Discard (lbs)', field: 'logbookDiscard', required: false, align: 'center', sortable: true },
      { name: 'logbookRetained', label: 'Logbook Retained (lbs)', field: 'logbookRetained', required: false, align: 'center', sortable: true },
      { name: 'thirdPartyReview', label: 'Third Party Review (lbs)', field: 'thirdPartyReview', required: false, align: 'center', sortable: true },
      { name: 'diffReviewLogbook', label: 'Diff Review Logbook', field: 'diffReviewLogbook', required: false, align: 'right', sortable: true },
      { name: 'audit', label: 'NWFSC Audit Discard (lbs)', field: 'audit', required: false, align: 'center', sortable: true },
      { name: 'diffAuditReview', label: 'Diff Audit Review', field: 'diffAuditReview', required: false, align: 'right', sortable: true }
    ];

    let apiTrip: any = reactive({
      // _id: '77fd968d63e9b5c90a434aa5cd2afb30',
      // _rev: '1-a74f82244ea465bf1f50ed4f570e9768',
      // vesselId: 'CF9490UV',
      // vesselName: 'Boaty McBoatFace',
      // departurePort: 'seattle',
      // departureDate: '2019-11-15T04:46:45.623Z',
      // returnPort: 'seattle',
      // returnDate: '2019-11-15T04:46:45.623Z',
      // permits: ['GF99999'],
      // fisheries: ['EM EFP'],
      // type: 'trips-api',
      // tripNum: 100002
    });

    let apiCatch: any = [
      {
        _id: '6ec983c88220cad5c56c5a94a3d29f28',
        _rev: '2-f322bdfda33c70a5cc5e8a8df0884fc0',
        tripNum: 100002,
        source: 'thirdParty',
        hauls: [
          {
            haulNum: 1,
            date: '2019-11-15T04:46:45.623Z',
            setTime: 'T04:46:45.623Z',
            setLoc: '41.40338, 2.17403',
            upTime: 'T04:46:45.623Z',
            upLoc: '41.40338, 2.17403',
            targetStrategy: 'PCHK',
            catch: [
              {
                speciesName: 'canary rockfish',
                discard: 100
              },
              {
                speciesName: 'pacific halibut',
                discard: 544
              }
            ]
          },
          {
            haulNum: 2,
            date: '2019-11-15T04:46:45.623Z',
            setTime: 'T04:46:45.623Z',
            setLoc: '41.40338, 2.17403',
            upTime: 'T04:46:45.623Z',
            upLoc: '41.40338, 2.17403',
            targetStrategy: 'PCHK',
            catch: [
              {
                speciesName: 'canary rockfish',
                discard: 324
              },
              {
                speciesName: 'pacific halibut',
                discard: 544
              }
            ]
          },
          {
            haulNum: 3,
            date: '2019-11-15T04:46:45.623Z',
            setTime: 'T04:46:45.623Z',
            setLoc: '41.40338, 2.17403',
            upTime: 'T04:46:45.623Z',
            upLoc: '41.40338, 2.17403',
            targetStrategy: 'PCHK',
            catch: [
              {
                speciesName: 'canary rockfish',
                discard: 324
              },
              {
                speciesName: 'pacific halibut',
                discard: 544
              }
            ]
          }
        ],
        type: 'trips-api-catch'
      },
      {
        _id: '6ec983c88220cad5c56c5a94a3d29f28',
        _rev: '2-f322bdfda33c70a5cc5e8a8df0884fc0',
        tripNum: 100002,
        source: 'logbook',
        hauls: [
          {
            haulNum: 1,
            date: '2019-11-15T04:46:45.623Z',
            setTime: 'T04:46:45.623Z',
            setLoc: '41.40338, 2.17403',
            upTime: 'T04:46:45.623Z',
            upLoc: '41.40338, 2.17403',
            targetStrategy: 'PCHK',
            catch: [
              {
                speciesName: 'canary rockfish',
                discard: 224
              },
              {
                speciesName: 'pacific halibut',
                discard: 354
              },
              {
                speciesName: 'penguin',
                retained: 123,
                discard: 321
              }
            ]
          },
          {
            haulNum: 2,
            date: '2019-11-15T04:46:45.623Z',
            setTime: 'T04:46:45.623Z',
            setLoc: '41.40338, 2.17403',
            upTime: 'T04:46:45.623Z',
            upLoc: '41.40338, 2.17403',
            targetStrategy: 'PCHK',
            catch: [
              {
                speciesName: 'canary rockfish',
                discard: 214
              },
              {
                speciesName: 'pacific halibut',
                discard: 500,
                retained: 20000
              }
            ]
          },
          {
            haulNum: 3,
            date: '2019-11-15T04:46:45.623Z',
            setTime: 'T04:46:45.623Z',
            setLoc: '41.40338, 2.17403',
            upTime: 'T04:46:45.623Z',
            upLoc: '41.40338, 2.17403',
            targetStrategy: 'PCHK',
            catch: [
              {
                speciesName: 'canary rockfish',
                discard: 300
              },
              {
                speciesName: 'pacific halibut',
                discard: 480
              }
            ]
          }
        ],
        type: 'trips-api-catch'
      },
      {
        _id: '6ec983c88220cad5c56c5a94a3d29f28',
        _rev: '2-f322bdfda33c70a5cc5e8a8df0884fc0',
        tripNum: 100002,
        source: 'nwfscAudit',
        hauls: [
          {
            haulNum: 1,
            date: '2019-11-15T04:46:45.623Z',
            setTime: 'T04:46:45.623Z',
            setLoc: '41.40338, 2.17403',
            upTime: 'T04:46:45.623Z',
            upLoc: '41.40338, 2.17403',
            targetStrategy: 'PCHK',
            catch: [
              {
                speciesName: 'canary rockfish',
                discard: 140
              },
              {
                speciesName: 'pacific halibut',
                discard: 540
              }
            ]
          },
          {
            haulNum: 3,
            date: '2019-11-15T04:46:45.623Z',
            setTime: 'T04:46:45.623Z',
            setLoc: '41.40338, 2.17403',
            upTime: 'T04:46:45.623Z',
            upLoc: '41.40338, 2.17403',
            targetStrategy: 'PCHK',
            catch: [
              {
                speciesName: 'canary rockfish',
                discard: 330
              },
              {
                speciesName: 'pacific halibut',
                discard: 543
              },
              {
                speciesName: 'octopus',
                discard: 35
              }
            ]
          }
        ],
        type: 'trips-api-catch'
      }
    ];

    const pagination = {
      rowsPerPage: 100
    };
    let selected: any = [];
    let tripTotals: any = {};
    let haulTotals: any = {};
    let tripData: any = [];
    let tripNum: any = ref(context.root.$route.query.tripnum ? context.root.$route.query.tripnum : 0);

    const getTripData = () => {
      tripData.length = 0;
      tripTotals = {};
      haulTotals = {};
      for (const source of apiCatch) {
        for (const haul of source.hauls) {
          for (const species of haul.catch) {
            if (!tripTotals[species.speciesName]) {
              tripTotals[species.speciesName] = {};
            }
            if (!tripTotals[species.speciesName][source.source]) { tripTotals[species.speciesName][source.source] = {}; }
            if (!tripTotals[species.speciesName][source.source].discard) { tripTotals[species.speciesName][source.source].discard = 0;}
            if (!tripTotals[species.speciesName][source.source].retained) {tripTotals[species.speciesName][source.source].retained = 0;}
            tripTotals[species.speciesName][source.source].discard += species.discard;
            if (source.source === 'logbook') {tripTotals[species.speciesName][source.source].retained += species.retained ? species.retained : 0;}

            if (!haulTotals[haul.haulNum]) { haulTotals[haul.haulNum] = {}; }
            if (!haulTotals[haul.haulNum][species.speciesName]) { haulTotals[haul.haulNum][species.speciesName] = {}; }
            if (!haulTotals[haul.haulNum][species.speciesName][source.source]) { haulTotals[haul.haulNum][species.speciesName][source.source] = {}; }
            if (!haulTotals[haul.haulNum][species.speciesName][source.source].discard) {haulTotals[haul.haulNum][species.speciesName][source.source].discard = ''; }
            if (source.source === 'logbook') { haulTotals[haul.haulNum][species.speciesName][source.source].retained = species.retained ? species.retained : '';
            }
            if (species.discard) {
              haulTotals[haul.haulNum][species.speciesName][source.source].discard = species.discard;
            }
          }
        }
      }

      for (const key of Object.keys(tripTotals)) {
        tripData.push(
          {
            id: Math.random(),
            haul: 'Trip',
            species: key,
            logbookDiscard: tripTotals[key].logbook ? tripTotals[key].logbook.discard : '',
            logbookRetained: tripTotals[key].logbook ? tripTotals[key].logbook.retained : '',
            thirdPartyReview: tripTotals[key].thirdParty ? tripTotals[key].thirdParty.discard : '',
            diffReviewLogbook: tripTotals[key].thirdParty && tripTotals[key].logbook ? getPercentDifference( tripTotals[key].thirdParty.discard, tripTotals[key].logbook.discard) : '',
            audit: tripTotals[key].nwfscAudit ? tripTotals[key].nwfscAudit.discard : '',
            diffAuditReview: tripTotals[key].nwfscAudit && tripTotals[key].thirdParty ? getPercentDifference( tripTotals[key].nwfscAudit.discard, tripTotals[key].thirdParty.discard) : ''
          }
        );
      }

      for (const key of Object.keys(haulTotals)) {
        for (const subKey of Object.keys(haulTotals[key])) {
          tripData.push(
            {
              id: Math.random(),
              haul: key,
              species: subKey,
              logbookDiscard: haulTotals[key][subKey].logbook ? haulTotals[key][subKey].logbook.discard : '',
              logbookRetained: haulTotals[key][subKey].logbook ? haulTotals[key][subKey].logbook.retained : '',
              thirdPartyReview: haulTotals[key][subKey].thirdParty ? haulTotals[key][subKey].thirdParty.discard : '',
              diffReviewLogbook: haulTotals[key][subKey].thirdParty && haulTotals[key][subKey].logbook ? getPercentDifference( haulTotals[key][subKey].thirdParty.discard, haulTotals[key][subKey].logbook.discard ) : '',
              audit: haulTotals[key][subKey].nwfscAudit ? haulTotals[key][subKey].nwfscAudit.discard : '',
              diffAuditReview: haulTotals[key][subKey].nwfscAudit && haulTotals[key][subKey].thirdParty ? getPercentDifference( haulTotals[key][subKey].nwfscAudit.discard, haulTotals[key][subKey].thirdParty.discard ) : ''
            }
          );
        }
      }
    };

    const getPercentDifference = (val1: number, val2: number) => {
      if (typeof val1 === 'number' && typeof val2 === 'number') {
        return (((val1 - val2) / ((val1 + val2) / 2)) * 100).toFixed(2) + '%';
      } else {
        return '';
      }
    };

    const capitalize = (val: string) => {
      let result = '';
      const words = val.split(' ');
      for (const word of words) {
        result += word.charAt(0).toUpperCase() + word.slice(1)
        if (words.indexOf(word) !== word.length -1 ) { result += ' '}
      }
      return result;
    }

    const getAPITripData = async () => {
      const apiResponse: any = await getTripsApiTrip(parseInt(tripNum.value, 10));
      if (apiResponse.tripNum) {
        apiTrip.tripNum = apiResponse.tripNum;
        apiTrip.vesselName = apiResponse.vesselName;
        apiTrip.vesselId = apiResponse.vesselId;
      } else {
        apiTrip.tripNum = 0;
        apiTrip.vesselName = '';
        apiTrip.vesselId = '';
      }

      apiCatch = await getCatchApiCatch(parseInt(tripNum.value, 10));
      if (apiCatch === 'not found') {
        Vue.set(apiTrip, tripNum, 0)
        // apiTrip = {tripNum: 0};
        apiCatch = [];
        tripData.length = 0;
        tripData.pop();
        Notify.create({
          message: 'No catch found matching trip #',
          position: 'top-right',
          color: 'red',
          timeout: 2000,
          icon: 'cancel',
          multiLine: true
        });
        } else {
          getTripData();
      }
    }

    const getClass = (val: any) => {
      if (val && (parseInt(val.split('.')[0], 10) > 10 || parseInt(val.split('.')[0], 10) < -10)) {
        return 'red';
      }
    };

    onMounted(() => {
      if (tripNum.value !== 0) {
        getAPITripData();
      }
    });

    return {
      apiTrip,
      apiCatch,
      capitalize,
      columns,
      pagination,
      selected,
      tripData,
      getPercentDifference,
      getClass,
      tripNum,
      getAPITripData
    };
  }
});
</script>

<style>
.red {
  color: red;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: rgb(238, 238, 238);
}
</style>
