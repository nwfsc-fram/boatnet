<template>
  <q-page padding>
    <boatnet-summary currentScreen="Haul" :current="currentHaul" @edit="editHauls">
      <template v-slot:table>
        <boatnet-table
          :data="wcgopHaulsData"
          :settings="wcgopHaulsSettings"
          @select="handleSelectHaul"
        >
          <template v-slot:default="rowVals">
            <q-td key="haulNum">{{ rowVals.row.doc.operationNum }}</q-td>
            <q-td key="weightMethod">{{ rowVals.row.doc.observerTotalCatch.weightMethod }}</q-td>
            <q-td key="gearPerf">{{ rowVals.row.doc.gearPerformance }}</q-td>
            <!--still not defined in model <q-td key="targetStrategy">{{ rowVals.row.doc.targetStrategy }}</q-td>-->
            <q-td key="gearType">{{ rowVals.row.doc.gearType }}</q-td>
            <!-- <q-td key="setDate">{{ formatDate(rowVals.row.doc.locations[0].date) }}</q-td>
            <q-td key="upDate">{{ formatDate(rowVals.row.doc.locations[1].date) }}</q-td>-->
            <q-td key="otcWeight">{{ rowVals.row.doc.observerTotalCatch.measurement.value }}</q-td>
            <!--  <q-td key="errors">{{ rowVals.row.errors }}</q-td>-->
          </template>
        </boatnet-table>
      </template>
      <template v-slot:goToButtons>
        <q-btn color="primary" icon="play_arrow" label="Go To Logbook"/>
      </template>
    </boatnet-summary>
  </q-page>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BoatnetSummary, { BoatnetHaulsSettings } from '@boatnet/bn-common';
import { Point } from 'geojson';
import { pouchService } from '@boatnet/bn-pouch';
import { Action, Getter } from 'vuex-class';
import {
  WcgopTrip,
  WcgopOperation,
  WcgopOperationTypeName,
  LocationEvent,
  WcgopCatch,
  WcgopCatchTypeName,
  SpeciesTypeName
} from '@boatnet/bn-models';

import moment from 'moment';

Vue.component(BoatnetSummary);

@Component
export default class Hauls extends Vue {
  private wcgopHaulsSettings: BoatnetHaulsSettings;
  private wcgopHaulsData: any[];

  @Action('setCurrentHaul', { namespace: 'appState' })
  private setCurrentHaul: any;
  @Getter('currentHaul', { namespace: 'appState' })
  private currentHaul!: WcgopOperation;
  @Getter('currentTrip', { namespace: 'appState' })
  private currentTrip!: WcgopTrip;

  constructor() {
    super();
    this.wcgopHaulsSettings = {
      columns: [
        {
          name: 'haulNum',
          required: true,
          label: 'Haul #',
          align: 'left',
          field: 'haulNum',
          sortable: true
        },
        {
          name: 'weightMethod',
          align: 'center',
          label: 'WM',
          field: (row: any) => row.observerTotalCatch.weightMethod,
          sortable: true
        },
        {
          name: 'gearPerf',
          align: 'center',
          label: 'Gear Perf',
          field: 'gearPerformance',
          sortable: true
        },
        {
          name: 'targetStrategy',
          align: 'center',
          label: 'Strat',
          field: 'targetStrategy',
          sortable: true
        },
        {
          name: 'gearType',
          align: 'center',
          label: 'Gear Type',
          field: 'gearType',
          sortable: true
        },
        {
          name: 'setDate',
          align: 'center',
          label: 'Set Time', // TODO: this needs logic to get first and last
          field: (row: any) =>
            moment(row.locations[0].date).format('hh:mm MM/DD/YY'),
          sortable: true
        },
        {
          name: 'upDate',
          align: 'center',
          label: 'Up Time', // TODO: this needs logic to get first and last
          field: (row: any) =>
            moment(row.locations[1].date).format('hh:mm MM/DD/YY'),
          sortable: true
        },
        {
          name: 'otcWeight',
          align: 'center',
          label: 'OTC Wt',
          field: (row: any) => row.observerTotalCatch.value,
          sortable: true
        },
        {
          name: 'errors',
          align: 'center',
          label: 'Errors',
          field: (row: any) => 0, // TODO Error calc
          sortable: true
        }
      ]
    };
    const locationExample: LocationEvent = {
      location: {
        // GeoJSON https://tools.ietf.org/html/rfc7946
        type: 'Point',
        coordinates: [124.6, 10.1]
      },
      date: moment()
        .subtract(1, 'days')
        .format()
    };

    const locationExample2: LocationEvent = {
      location: {
        // GeoJSON https://tools.ietf.org/html/rfc7946
        type: 'Point',
        coordinates: [124.6, 10.1]
      },
      date: moment().format()
    };

    const exampleHaul = {
      _id: '1',
      type: WcgopOperationTypeName,
      createdBy: 'test',
      createdDate: moment().format(),
      haulNum: 1,
      observerTotalCatch: {
        value: 170,
        units: 'kg',
        weightMethod: '21'
      },
      locations: [locationExample, locationExample2],
      gearPerformance: '5',
      targetStrategy: 'ALBC',
      gearType: 'Trawl'
    };

    const exampleHaul2 = {
      ...exampleHaul,
      haulNum: 2,
      targetStrategy: 'BANK'
    };

    this.wcgopHaulsData = [exampleHaul, exampleHaul2];
  }

  private async getHauls() {
    const queryOptions = {
      keys: this.currentTrip.operationIDs
    };
    try {
      const result = await pouchService.db.allDocs(
        pouchService.userDBName,
        queryOptions
      );
      this.wcgopHaulsData = result.rows;
     // console.log('le output ' + JSON.stringify(this.wcgopHaulsData));
    } catch (err) {
      console.log('error fetching hauls');
    }
  }

  private created() {
    this.getHauls();
  }

  private handleSelectHaul(haul: any) {
    if (haul) {
      this.setCurrentHaul(haul.doc);
    } else {
      this.setCurrentHaul(undefined);
    }
  }

  private editHauls() {
    this.$router.push({ path: '/hauldetails/' + this.currentHaul.operationNum });
  }

  private formatDate(date: string) {
    return moment(date).format('HH:mm MM/DD/YY');
  }

  private displayKeyboard(e: any) {
    this.$emit('displayKeyboard', e);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
