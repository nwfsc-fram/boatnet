<template>
  <q-page>
    <boatnet-summary
      currentScreen="Haul"
      :current="currentHaul"
      :selectionId="currentHaul ? currentHaul.operationNum : 0"
      @edit="editHauls"
      @add="addHauls"
      @delete="deleteHauls"
      @goTo="handleGoToCatch"
    >
      <template v-slot:table>
        <boatnet-table
          :data="wcgopHaulsData"
          :settings="wcgopHaulsSettings"
          @select="handleSelectHaul"
        >
          <template v-slot:default="rowVals">
            <q-td key="haulNum">{{rowVals.row.doc.operationNum}}</q-td>
            <q-td key="weightMethod">{{rowVals.row.doc.observerTotalCatch.weightMethod ? rowVals.row.doc.observerTotalCatch.weightMethod.description : ''}}</q-td>
            <q-td key="gearPerf">{{ rowVals.row.doc.gearPerformance }}</q-td>
            <q-td key="targetStrategy">SALM</q-td> <!--TODO {{ rowVals.row.doc.targetStrategy }}-->
            <q-td key="gearType">{{ rowVals.row.doc.gearType }}</q-td>
            <q-td key="setDate">{{ rowVals.row.doc.locations ? formatDate(rowVals.row.doc.locations[0].locationDate) : '' }}</q-td>
            <q-td key="upDate">{{ rowVals.row.doc.locations ? formatDate(rowVals.row.doc.locations[rowVals.row.doc.locations.length - 1].locationDate) : ''}}</q-td>
            <q-td key="otcWeight">{{rowVals.row.doc.observerTotalCatch.measurement ? rowVals.row.doc.observerTotalCatch.measurement.value : ''}}</q-td>
            <q-td key="errors">100</q-td><!-- TODO -->
          </template>
        </boatnet-table>
      </template>
      <template v-slot:goToButtons>
        <span style="position: relative; right: 10px">
        <q-btn color="primary" icon="fa fa-th-list" label="Logbook Mode"/>
        </span>
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
  private wcgopHaulsData: any[] = [];

  @Action('setCurrentHaul', { namespace: 'appState' })
  private setCurrentHaul: any;
  @Getter('currentHaul', { namespace: 'appState' })
  private currentHaul!: WcgopOperation;

  @Getter('currentTrip', { namespace: 'appState' })
  private currentTrip!: WcgopTrip;

  @Action('save', { namespace: 'appState' })
  private save: any;

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
            moment(row.locations[0].date).format('HH:mm MM/DD/YY'),
          sortable: true
        },
        {
          name: 'upDate',
          align: 'center',
          label: 'Up Time', // TODO: this needs logic to get first and last
          field: (row: any) =>
            moment(row.locations[1].date).format('HH:mm MM/DD/YY'),
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
  }

  private async getHauls() {
    if (this.currentTrip && this.currentTrip.operationIDs) {
      const queryOptions = {
        keys: this.currentTrip.operationIDs,
        descending: true
      };
      try {
        const result = await pouchService.db.allDocs(
          pouchService.userDBName,
          queryOptions
        );
        this.wcgopHaulsData = result.rows;
      } catch (err) {
        console.log('error fetching hauls');
      }
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

  private handleGoToCatch() {
    if (this.currentHaul) {
      this.$router.push({ path: '/catch/' });
    }
  }

  private addHauls() {
    let operationNum = 1;
    if (this.wcgopHaulsData[0]) {
      operationNum = this.wcgopHaulsData[0].doc.operationNum + 1;
    }
    const haul: WcgopOperation = { operationNum };
    this.setCurrentHaul(haul);
    this.$router.push({ path: '/hauldetails/' + haul.operationNum });
  }

  private editHauls() {
    this.$router.push({ path: '/hauldetails/' + this.currentHaul.operationNum });
  }

  private deleteHauls() {
    pouchService.db.remove(pouchService.userDBName, this.currentHaul);
    if (this.currentTrip.operationIDs && this.currentHaul._id) {
      const removalIndex = this.currentTrip.operationIDs.indexOf(
        this.currentHaul._id
      );
      this.currentTrip.operationIDs.splice(removalIndex, 1);
    }
    this.getHauls();
    this.save(this.currentTrip);
    this.setCurrentHaul(undefined);
  }

  private formatDate(date: string) {
    return moment(date).format('HH:mm MM/DD/YY');
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
