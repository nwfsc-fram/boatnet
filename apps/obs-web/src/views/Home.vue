<template>
  <q-page class="flex flex-center">
    <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
      {{alert.message}}
      <template v-slot:action>
        <q-btn flat label="Dismiss" @click="clear"/>
      </template>
    </q-banner>

    <img alt="noaa logo" src="../assets/NOAA_logo.svg" class="hero-logo">

    <div>
      <!-- <q-select
      outlined
      class="col-2"
      v-model="myvessel"
      label="Vessel Name/ Registration"
      use-input
      hide-selected
      input-debounce="0"
      :options="options"
      @filter="filterFn">
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">No results</q-item-section>
        </q-item>
      </template>
      </q-select>-->
    </div>
  </q-page>
</template>

<script lang="ts">
import { mapState } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';

import { State, Action } from 'vuex-class';
import { AlertState, VesselState } from '../_store/types/types';
import { AuthState } from '@boatnet/bn-auth';

import { Client, CouchDoc, ListOptions } from 'davenport';
import { couchService } from '@boatnet/bn-couch';
import { EmEfp } from '@boatnet/bn-models';
import moment from 'moment';

@Component
export default class Home extends Vue {
  @State('alert') private alert!: AlertState;
  @State('vessel') private vessel!: VesselState;
  @State('auth') private auth!: AuthState;

  @Action('clear', { namespace: 'alert' }) private clear: any;
  @Action('error', { namespace: 'alert' }) private error: any;

  private options: string[] = [];
  private myvessel: string = '';

  constructor() {
    super();
  }

  // private async filterFn(val: string, update: any, abort: any) {
  //   if (val.length < 2) {
  //     abort();
  //     return;
  //   }
  //   update(async () => {
  //     try {
  //       const masterDB: Client<any> = couchService.masterDB;

  //       const queryOptions: ListOptions = {
  //         limit: 5,
  //         start_key: val.toLowerCase(),
  //         inclusive_end: true,
  //         descending: false
  //       };

  //       const vessels = await masterDB.view<any>(
  //         'optecs_trawl',
  //         'all_vessel_names',
  //         queryOptions
  //       );

  //       this.options = vessels.rows.map((vessel) => vessel.value);
  //     } catch (err) {
  //       this.error(err);
  //     }
  //   });
  // }

  private async couch() {
    const masterDB: Client<any> = couchService.masterDB;
    // const queryOptions: ListOptions = {
    //       limit: 100,
    //       start_key: 'a',
    //       inclusive_end: true,
    //       descending: false
    //     };

    try {
      // const vessels = await masterDB.view<any>(
      //   'optecs_trawl',
      //   'all_vessel_names',
      //   queryOptions
      // );

      // this.options = vessels.rows.map((vessel) => vessel.value);

      const vessels = await masterDB.view<any>('optecs_trawl', 'all_vessel_names');

      console.log(vessels);
    } catch (err) {
      this.error(err);
    }
  }

  private created() {
    this.couch();
  }
}
</script>

<style>
.hero-logo {
  width: 40%;
}

@media screen and (orientation: portrait) {
  .hero-logo {
    width: 80%;
  }
}
</style>

function(doc) {
    if (doc.type == "wcgop-trip") {
        emit([doc._id, 0], null);
        if (doc.operationIDs) {
            for (var i in doc.operationIDs) {
                emit([doc._id, Number(i)+1], {_id: doc.operationIDs[i]});
            }
        }
    }
}

function (doc) {
  if (doc.type == 'OTSTrip' && doc.fishery == 'em efp') {
    emit([doc.value, 0], null);
  }
}

{
  "_id": "35c37dafc014e9849c8c1d39212fa2e3",
  "type": "OTSTrip",
  "fishery": "em efp",
  "vessel": {
    "vesselName": "Excalibur",
    "vesselId": "8cd474c09923733485c6e3ed4e03b9d7"
  },
  "vesselName": "excalibur",
  "vesselId": "8cd474c09923733485c6e3ed4e03b9d7",
  "isSelected": "true",
  "permits": ["GF0810"],
  "messages": [],
  "tripNum": 3,
  "departureDate": "2002-11-14T00:00:00.000Z",
  "departurePort": {
    "_id": "30cafeabcda58695800638aaf73551ce",
    "name": "NEAH BAY"
  },
  "returnDate": "2002-11-16T00:15:00.000Z",
  "returnPort": {
    "_id": "30cafeabcda58695800638aaf73551ce",
    "name": "NEAH BAY"
  },
  "tripStatus": {
    "description":"Active"
    }
}

  { _id: '123456', type: 'trip', tripNum: 3, isSelected: false,
    vessel: {vesselName: 'Excalibur', coastGuardNumber: 'fgr243rt'},
    departureDate: '8/03/2018 10:01 AM', returnDate: '8/20/2018 3:33 PM',
    departurePort: {name: 'Newport'} , returnPort: {name: 'same as start'},
    fishery: {name: 'Limited Entry - Catch Shares'},
    permits: [{label: 'A21rv35', value: 'A21rv35'}],
    messages: [], tripStatus: {description: 'Active'}
  },

  {
  "_id": "35c37dafc014e9849c8c1d39212ff896",
  "type": "OTSTarget",
  "fishery": "EM EFP",
  "targetType": "Fishery",
  "target": "Fishery Wide",
  "coverageGoal": 27,
  "setRate": 33,
  "effectiveDate": "2019-03-26T08:20:33-07:00",
  "expirationDate": "2019-12-31T08:20:33-07:00"
}

  "type": "OTSTarget",
  "fishery": "EM EFP",
  "targetType": "Vessel",
  "targetVesselID": "d4fsdsgrgre3q4q5wefsdfbsdfg",
  "targetVesselName": "Raven",
  "targetVesselCGNumber": "55432343",
  "coverageGoal": 27,
  "setRate": 33,
  "effectiveDate": "2019-03-26T08:20:33-07:00",
  "expirationDate": "2019-12-31T08:20:33-07:00"

  	30cafeabcda58695800638aaf7593ab9	excalibur	Excalibur (578930)

    30cafeabcda58695800638aaf772c24e	raven	Raven (249995)
	  30cafeabcda58695800638aaf75f4944	raven	Raven (629499)

    30cafeabcda58695800638aaf74c19a5	last straw	Last Straw (532419)