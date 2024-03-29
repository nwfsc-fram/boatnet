<template>
  <div class="q-pa-md q-gutter-md">
      <div class="text-h6" style="max-width: 70%">
        <span v-if="apiTrip.tripNum">Trip {{ apiTrip.tripNum }} - {{ apiTrip.vesselName }} ({{ apiTrip.vesselId }}) - </span> Data Comparison
        <q-btn v-if="state.user.showLogbookRetained" size="sm" @click="toggleRetained">Hide Retained</q-btn>
        <q-btn v-else color="primary" size="sm" @click="toggleRetained">Show Retained</q-btn>
        &nbsp;
        <q-btn v-if="state.user.showUnReviewed" size="sm" @click="toggleUnReviewed(false)">Hide UnReviewed</q-btn>
        <q-btn v-else color="primary" size="sm" @click="toggleUnReviewed(true)">Show UnReviewed</q-btn>
      </div>

      <div style="position: absolute; top: 30px; right: 15px">
      <q-input v-model="tripNum" label="Trip # (6 digit)" style="width: 170px" @keyup.enter.native="getAPITripData">
        <template v-slot:append>
            <q-btn color="primary" type="submit" @click="getAPITripData">load</q-btn>
        </template>
      </q-input>
      </div>

    <q-table
      :data="comp.displayTripData"
      :columns="columns"
      dense
      row-key="id"
      selection="single"
      :selected.sync="selected"
      :pagination.sync="pagination"
      binary-state-sort
      hide-bottom
      :visible-columns="visibleColumns"
      :sort-method="sorter"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="_id"></q-td>
          <q-td key="haul" :props="props">{{ props.row.haul ? props.row.haul : '' }}</q-td>
          <q-td key="speciesCode" :props="props">{{ props.row.speciesCode ? props.row.speciesCode : '' }}</q-td>
          <q-td key="logbookDiscard" :props="props" >{{ props.row.logbookDiscard ? roundVal(props.row.logbookDiscard) : '' }}</q-td>
          <q-td key="logbookRetained" :props="props" >{{ props.row.logbookRetained ? roundVal(props.row.logbookRetained) : '' }}</q-td>
          <q-td key="thirdPartyReview" :props="props" >{{ props.row.thirdPartyReview ? roundVal(props.row.thirdPartyReview) : '' }}</q-td>
          <q-td key="grade" :props="props" >{{ props.row.grade ? props.row.grade : '' }}</q-td>
          <q-td key="criteria" :props="props" >{{ props.row.criteria ? props.row.criteria : '' }}</q-td>
          <q-td key="diffReviewLogbook" :props="props" :class="getClass(props.row.diffReviewLogbook)" >{{ props.row.diffReviewLogbook ? roundVal(props.row.diffReviewLogbook) : '' }}</q-td>
          <q-td key="audit" :props="props">{{ props.row.audit ? roundVal(props.row.audit) : '' }}</q-td>
          <q-td key="diffAuditReview" :props="props" :class="getClass(props.row.diffAuditReview)">{{ props.row.diffAuditReview ? roundVal(props.row.diffAuditReview) : '' }}</q-td>
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

import { Vue, Watch } from 'vue-property-decorator';
import {
  CouchDBInfo,
  CouchDBCredentials,
  couchService
} from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';

import { Notify } from 'quasar';

import { getTripsApiTrip, getCatchApiCatch } from '@boatnet/bn-common';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;

    const sorter = (rows: any, sortBy: string, descending: boolean) => {

      const data = [ ...rows ];

      if (sortBy) {
        data.sort((a: any, b: any) => {
          if (a.haul === 'Trip' || b.haul === 'Trip') {
            return 0;
          } else if ( a[sortBy] > b[sortBy] ) {
            return descending ? 1 : - 1;

          } else if ( a[sortBy] < b[sortBy] ) {
            return descending ? - 1 : 1;
          } else {
            return 0;
          }
        });
      }

      return data;
    };

    const columns: any = [
      { name: 'haul', label: 'Haul', field: 'haul', required: false, align: 'left', sortable: true },
      { name: 'speciesCode', label: 'Species Code', field: 'speciesCode', required: false, align: 'left', sortable: true },
      { name: 'logbookDiscard', label: 'Logbook Discard (lbs)', field: 'logbookDiscard', required: false, align: 'center', sortable: true },
      { name: 'logbookRetained', label: 'Logbook Retained (lbs)', field: 'logbookRetained', required: false, align: 'center', sortable: true },
      { name: 'thirdPartyReview', label: 'Third Party Review (lbs)', field: 'thirdPartyReview', required: false, align: 'center', sortable: true },
      { name: 'grade', label: 'Grade', field: 'grade', required: false, align: 'center', sortable: true },
      { name: 'criteria', label: 'Criteria', field: 'criteria', required: false, align: 'center', sortable: true },
      { name: 'diffReviewLogbook', label: 'Logbook % of review', field: 'diffReviewLogbook', required: false, align: 'right', sortable: true },
      { name: 'audit', label: 'NWFSC Audit Discard (lbs)', field: 'audit', required: false, align: 'center', sortable: true },
      { name: 'diffAuditReview', label: 'Diff Audit Review', field: 'diffAuditReview', required: false, align: 'right', sortable: true }
    ];

    const visibleColumns: any = reactive([
      'haul',
      'speciesCode',
      'logbookDiscard',
      'logbookRetained',
      'thirdPartyReview',
      'diffReviewLogbook',
      'audit',
      'diffAuditReview',
      'grade',
      'criteria'
    ]);

    const apiTrip: any = reactive({});

    let apiCatch: any = [];

    const pagination = {
      rowsPerPage: 100
    };
    const selected: any = [];
    let tripTotals: any = {};
    let haulTotals: any = {};
    let reviewedTotals: any = {};
    const reviewedHauls: any = [];
    const tripData: any = ref([]);
    const tripNum: any = ref(context.root.$route.query.tripnum ? context.root.$route.query.tripnum : 0);
    const showRetained: any = ref(true);

    const getTripData = () => {
      tripData.value.length = 0;
      tripTotals = {};
      haulTotals = {};
      reviewedTotals = {};

      if (apiCatch.ifqThirdPartyReviewCatchHaulLevel) {
        for (const catchItem of apiCatch.ifqThirdPartyReviewCatchHaulLevel) {
          if (!reviewedHauls.includes(catchItem.haulNum)) {
            reviewedHauls.push(catchItem.haulNum);
          }
        }
      }

      // if (apiCatch.thirdPartyReviewCatch) {
      //   for (const catchItem of apiCatch.thirdPartyReviewCatch) {
      //     if (!reviewedHauls.includes(catchItem.haulNum)) {
      //       reviewedHauls.push(catchItem.haulNum);
      //     }
      //   }
      // }

      for (const catchType of ['ifqLogbookCatchHaulLevel', 'ifqThirdPartyReviewCatchHaulLevel', 'ifqNwfscAuditHaulLevel']) {
        if (apiCatch[catchType].length > 0) {
          let source = '';
          switch (catchType) {
            case 'ifqLogbookCatchHaulLevel':
                source = 'logbook';
                break;
            case 'ifqThirdPartyReviewCatchHaulLevel':
                source = 'thirdParty';
                break;
            case 'ifqNwfscAuditHaulLevel':
                source = 'nwfscAudit';
                break;
          }
          for (const species of apiCatch[catchType]) {
            // const codeLookup = speciesCodes.find( ( codes: any) => {
            //     return species.pacfinSpeciesCode === codes.pacfinSpeciesCode || species.wcgopSpeciesCode === codes.wcgopSpeciesCode;
            //   });
            // if (codeLookup) {
            //   species.speciesCode = codeLookup.commonName;

            // } else {
            //   species.speciesCode = 'fish error 321';
            // }
            species.speciesCode = species.ifqGrouping;

            if (!tripTotals[species.speciesCode]) {
              tripTotals[species.speciesCode] = {};
            }
            if (!tripTotals[species.speciesCode][source]) { tripTotals[species.speciesCode][source] = {}; }
            if (!tripTotals[species.speciesCode][source].discard) { tripTotals[species.speciesCode][source].discard = 0; }
            if (!tripTotals[species.speciesCode][source].retained) {tripTotals[species.speciesCode][source].retained = 0; }
            if (species.disposition === 'Discarded') {
              tripTotals[species.speciesCode][source].discard += parseFloat(species.speciesWeight);
            }
            if (species.disposition === 'D') {
              tripTotals[species.speciesCode][source].discard += parseFloat(species.speciesWeight);
            }
            if (source === 'logbook' && (species.disposition === 'Retained')) {
              tripTotals[species.speciesCode][source].retained += parseFloat(species.speciesWeight) ? parseFloat(species.speciesWeight) : 0;
            }

            if (!haulTotals[species.haulNum]) { haulTotals[species.haulNum] = {}; }
            if (!haulTotals[species.haulNum][species.speciesCode]) { haulTotals[species.haulNum][species.speciesCode] = {}; }
            if (!haulTotals[species.haulNum][species.speciesCode][source]) { haulTotals[species.haulNum][species.speciesCode][source] = {}; }
            if (!haulTotals[species.haulNum][species.speciesCode][source].discard) {haulTotals[species.haulNum][species.speciesCode][source].discard = ''; }
            if (source === 'logbook') { haulTotals[species.haulNum][species.speciesCode][source].retained = species.retained ? species.retained : '';
            }

            if (reviewedHauls.includes(species.haulNum)) {
              if (!reviewedTotals[species.speciesCode]) {
                reviewedTotals[species.speciesCode] = {};
              }
              if (!reviewedTotals[species.speciesCode][source]) { reviewedTotals[species.speciesCode][source] = {}; }
              if (!reviewedTotals[species.speciesCode][source].discard) { reviewedTotals[species.speciesCode][source].discard = 0; }
              if (!reviewedTotals[species.speciesCode][source].retained) {reviewedTotals[species.speciesCode][source].retained = 0; }
              if (species.disposition === 'Discarded') {
                reviewedTotals[species.speciesCode][source].discard += parseFloat(species.speciesWeight);
              }
              if (species.disposition === 'D') {
                reviewedTotals[species.speciesCode][source].discard += parseFloat(species.speciesWeight);
              }
            }

            if (species.disposition === 'Discarded') {
              haulTotals[species.haulNum][species.speciesCode][source].discard = parseFloat(species.speciesWeight);
            } else if (species.disposition === 'Retained') {
              haulTotals[species.haulNum][species.speciesCode][source].retained = parseFloat(species.speciesWeight);
            }
            if (species.disposition === 'D') {
              haulTotals[species.haulNum][species.speciesCode][source].discard = parseFloat(species.speciesWeight);
            }
          }
        }
      }

      for (const key of Object.keys(tripTotals)) {
        tripData.value.push(
          {
            id: Math.random(),
            haul: 'Trip',
            speciesCode: key,
            grade: (apiCatch.reviewedGroupingTotals.find( (row: any) => row.grouping === key) ? (apiCatch.reviewedGroupingTotals.find( (row: any) => row.grouping === key).grade) : '' ),
            criteria: (apiCatch.reviewedGroupingTotals.find( (row: any) => row.grouping === key) ? (apiCatch.reviewedGroupingTotals.find( (row: any) => row.grouping === key).criteria) : '' ),
            logbookDiscard: tripTotals[key].logbook ? tripTotals[key].logbook.discard : '',
            logbookRetained: tripTotals[key].logbook ? tripTotals[key].logbook.retained : '',
            thirdPartyReview: tripTotals[key].thirdParty ? tripTotals[key].thirdParty.discard : '',
            diffReviewLogbook: tripTotals[key].thirdParty && tripTotals[key].logbook ? getPercentDifference( tripTotals[key].logbook.discard, tripTotals[key].thirdParty.discard) : '',
            audit: tripTotals[key].nwfscAudit ? tripTotals[key].nwfscAudit.discard : '',
            diffAuditReview: tripTotals[key].nwfscAudit && tripTotals[key].thirdParty ? getPercentDifference( tripTotals[key].nwfscAudit.discard, tripTotals[key].thirdParty.discard) : ''
          }
        );
      }

      for (const key of Object.keys(reviewedTotals)) {
        tripData.value.push(
          {
            id: Math.random(),
            haul: 'Reviewed',
            speciesCode: key,
            grade: (apiCatch.reviewedGroupingTotals.find( (row: any) => row.grouping === key) ? (apiCatch.reviewedGroupingTotals.find( (row: any) => row.grouping === key).grade) : '' ),
            criteria: (apiCatch.reviewedGroupingTotals.find( (row: any) => row.grouping === key) ? (apiCatch.reviewedGroupingTotals.find( (row: any) => row.grouping === key).criteria) : '' ),
            logbookDiscard: reviewedTotals[key].logbook ? reviewedTotals[key].logbook.discard : '',
            logbookRetained: reviewedTotals[key].logbook ? reviewedTotals[key].logbook.retained : '',
            thirdPartyReview: reviewedTotals[key].thirdParty ? reviewedTotals[key].thirdParty.discard : '',
            diffReviewLogbook: reviewedTotals[key].thirdParty && reviewedTotals[key].logbook ? getPercentDifference( reviewedTotals[key].logbook.discard, reviewedTotals[key].thirdParty.discard) : '',
            audit: reviewedTotals[key].nwfscAudit ? reviewedTotals[key].nwfscAudit.discard : '',
            diffAuditReview: reviewedTotals[key].nwfscAudit && reviewedTotals[key].thirdParty ? getPercentDifference( reviewedTotals[key].nwfscAudit.discard, reviewedTotals[key].thirdParty.discard) : ''
          }
        );
      }
      for (const key of Object.keys(haulTotals)) {
        for (const subKey of Object.keys(haulTotals[key])) {
          tripData.value.push(
            {
              id: Math.random(),
              haul: key,
              speciesCode: subKey,
              grade: (apiCatch.reviewedGroupingTotals.find( (row: any) => row.grouping === subKey) ? (apiCatch.reviewedGroupingTotals.find( (row: any) => row.grouping === subKey).grade) : '' ),
              criteria: (apiCatch.reviewedGroupingTotals.find( (row: any) => row.grouping === subKey) ? (apiCatch.reviewedGroupingTotals.find( (row: any) => row.grouping === subKey).criteria) : '' ),
              logbookDiscard: haulTotals[key][subKey].logbook ? haulTotals[key][subKey].logbook.discard : '',
              logbookRetained: haulTotals[key][subKey].logbook ? haulTotals[key][subKey].logbook.retained : '',
              thirdPartyReview: haulTotals[key][subKey].thirdParty ? haulTotals[key][subKey].thirdParty.discard : '',
              diffReviewLogbook: haulTotals[key][subKey].thirdParty && haulTotals[key][subKey].logbook ? getPercentDifference( haulTotals[key][subKey].logbook.discard, haulTotals[key][subKey].thirdParty.discard ) : '',
              audit: haulTotals[key][subKey].nwfscAudit ? haulTotals[key][subKey].nwfscAudit.discard : '',
              diffAuditReview: haulTotals[key][subKey].nwfscAudit && haulTotals[key][subKey].thirdParty ? getPercentDifference( haulTotals[key][subKey].nwfscAudit.discard, haulTotals[key][subKey].thirdParty.discard ) : ''
            }
          );
        }
      }
      tripData.value.sort( (a: any, b: any) => {
        if (a.haul === 'Trip' && b.haul === 'Trip') {
          if (a.speciesCode > b.speciesCode ) {
            return 1;
          } else if (a.speciesCode < b.speciesCode) {
            return -1;
          } else {
            return 0;
          }
        }
      });
    };

    const getPercentDifference = (val1: number, val2: number) => {
      if (typeof val1 === 'number' && val1 !== 0 && typeof val2 === 'number' && val2 !== 0) {
        return (((val1 - val2) / ((val1 + val2) / 2)) * 100).toFixed(2) + '%';
      } else {
        return '';
      }
    };

    const capitalize = (val: string) => {
      let result = '';
      const words = val.split(' ');
      for (const word of words) {
        result += word.charAt(0).toUpperCase() + word.slice(1);
        if (words.indexOf(word) !== words.length - 1 ) {
          result += ' ';
        }
      }
      return result;
    };

    const roundVal = (val: number) => {
      if (val % 1 === 0 || typeof val === 'string') {
        return val;
      } else {
        return val.toFixed(2);
      }
    };

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

      // apiCatch = await getCatchApiCatch(parseInt(tripNum.value, 10));

      const masterDB = couchService.masterDB;
      const queryOptions = {
        reduce: false,
        include_docs: true,
        key: apiTrip.tripNum
      };

      // const expansionResultsQuery = await masterDB.view(
      //   'TripsApi',
      //   'expansion_results',
      //   queryOptions
      // );

      const minimalExpansionResultsQuery = await masterDB.view(
        'TripsApi',
        'minimal_expansion_results',
        queryOptions
      );

      apiCatch = minimalExpansionResultsQuery.rows[0].doc;

      if (apiCatch === 'not found') {
        Vue.set(apiTrip, tripNum, 0);
        apiCatch = [];
        tripData.value.length = 0;
        tripData.value.pop();
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
    };

    const getClass = (val: any) => {
      if (val && (parseInt(val.split('.')[0], 10) > 10 || parseInt(val.split('.')[0], 10) < -10)) {
        return 'red';
      }
    };

    const toggleRetained = () => {
      if (visibleColumns.indexOf('logbookRetained') !== -1) {
        visibleColumns.splice(visibleColumns.indexOf('logbookRetained') , 1);
        store.dispatch('user/setShowLogbookRetained', false);
      } else {
        visibleColumns.push('logbookRetained');
        store.dispatch('user/setShowLogbookRetained', true);
      }
    };

    const toggleUnReviewed = (choice: boolean) => {
      store.dispatch('user/setShowUnReviewed', choice);
    };

    const comp = reactive({
      displayTripData: computed(() => {
        if (state.user.showUnReviewed) {
          return tripData.value.filter( (row: any) => row.haul !== 'Reviewed');
        } else {
          return tripData.value.filter( (row: any) => {
            return row.haul === 'Reviewed' || reviewedHauls.includes(parseInt(row.haul, 10));
          });
        }
      })
    });

    const speciesCodes: any = [];
    const wcgopSpeciesCodes: any = [];
    const pacfinSpeciesCodes: any = [];
    const getSpeciesCodes = async () => {
      const masterDB = couchService.masterDB;
      const queryOptions = {
        reduce: false,
        include_docs: false
      };

      const speciesCodesQuery = await masterDB.view(
        'obs_web',
        'em-species-codes',
        queryOptions
      );

      const codes = speciesCodesQuery.rows;

      for (const row of codes) {
        if (row.value[1]) {
          wcgopSpeciesCodes.push(row.value[1]);
        }
        if (row.value[0]) {
          pacfinSpeciesCodes.push(row.value[0]);
        }
        speciesCodes.push(
          {
            commonName: row.key,
            pacfinSpeciesCode: row.value[0],
            wcgopSpeciesCode: row.value[1]
          }
        );
      }
      wcgopSpeciesCodes.sort( (a: any, b: any) => a - b);
      pacfinSpeciesCodes.sort( (a: any, b: any) => a - b);
    };

    onMounted( async () => {
      await getSpeciesCodes();
      if (tripNum.value !== 0) {
        await getAPITripData();
      }
      if (!store.state.user.showLogbookRetained) {
        visibleColumns.splice(visibleColumns.indexOf('logbookRetained') , 1);
      }
    });

    return {
      apiTrip,
      apiCatch,
      capitalize,
      roundVal,
      columns,
      pagination,
      selected,
      tripData,
      getPercentDifference,
      getClass,
      tripNum,
      getAPITripData,
      showRetained,
      visibleColumns,
      toggleRetained,
      toggleUnReviewed,
      state,
      comp,
      sorter,
      reviewedHauls,
      reviewedTotals
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
