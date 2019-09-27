<template>
  <q-page>
    {{ appMode }}

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
        <boatnet-table v-if="haulsSettings.columns" :data="haulsData[appMode]" :settings="haulsSettings" @select="handleSelectHaul">
          <template v-slot:default="rowVals">
            <q-td v-for="column of haulsSettings.columns" :align="column.align" :key="column.name">
              {{ getValue(rowVals.row.doc, column) }}
            </q-td>
          </template>
        </boatnet-table>
      </template>

      <template v-slot:goToButtons>
        <span style="position: relative; right: 10px">
          <q-btn color="primary" icon="fa fa-th-list" label="Logbook Mode" />
        </span>
      </template>

    </boatnet-summary>
  </q-page>
</template>


<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BoatnetSummary, { BoatnetHaulsSettings } from '@boatnet/bn-common';
import { Point } from 'geojson';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { pouchService } from '@boatnet/bn-pouch';
import { Action, Getter, State } from 'vuex-class';
import {
  WcgopTrip,
  WcgopOperation,
  WcgopOperationTypeName,
  LocationEvent,
  WcgopCatch,
  WcgopCatchTypeName,
  SpeciesTypeName,
  AshopTrip,
  AshopCatch,
  AshopHaul,
  AshopDiscardReason
} from '@boatnet/bn-models';
import { TripState, AppSettings } from '@boatnet/bn-common';

import moment from 'moment';

Vue.component(BoatnetSummary);

@Component
export default class Hauls extends Vue {
  private wcgopHaulsSettings: BoatnetHaulsSettings;
  private ashopHaulsSettings: BoatnetHaulsSettings;
  private haulsData: any = {};

  @State('tripsState') private tripState!: TripState;

  @Action('setCurrentHaul', { namespace: 'tripsState' })
  private setCurrentHaul: any;
  @Getter('currentHaul', { namespace: 'tripsState' })
  private currentHaul!: any;

  @Getter('currentTrip', { namespace: 'tripsState' })
  private currentTrip!: WcgopTrip | AshopTrip;

  @Action('setCurrentTrip', { namespace: 'tripsState' })
  private setCurrentTrip: any;

  @Action('save', { namespace: 'tripsState' })
  private save: any;

  @Getter('appMode', { namespace: 'appSettings' })
  private appMode!: AppSettings;

  private haulsSettings: any = {};
  private mode: string = '';

    constructor() {
    super();

    this.wcgopHaulsSettings = {
      columns: [
        {
          name: 'operationNum',
          required: true,
          label: 'Haul #',
          align: 'left',
          field: 'operationNum',
          sortable: true
        },
        {
          name: 'weightMethod',
          align: 'center',
          label: 'WM',
          field: 'observerTotalCatch.weightMethod',
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
          field: 'targetStrategy.code',
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
          field: 'setTime',
          sortable: true
        },
        {
          name: 'upDate',
          align: 'center',
          label: 'Up Time', // TODO: this needs logic to get first and last
          field: 'upDate',
          sortable: true
        },
        {
          name: 'otcWeight',
          align: 'center',
          label: 'OTC Wt',
          field: 'observerTotalCatch.value',
          sortable: true
        },
        {
          name: 'errors',
          align: 'center',
          label: 'Errors',
          field: 'errors', // TODO Error calc
          sortable: true
        }
      ]
    };

    this.ashopHaulsSettings = {
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
          name: 'obsEstCatch',
          align: 'center',
          label: 'Obs Est. Catch',
          field: 'observerEstimatedCatch.measurement.value',
          sortable: true
        },
        {
          name: 'vesselEstCatch',
          align: 'center',
          label: 'Vessel Est. Catch',
          field: 'vesselEstimatedCatch.measurement.value',
          sortable: true
        },
        {
          name: 'cvEstDisc',
          align: 'center',
          label: 'C.V. Est Disc',
          field: 'totalEstimatedDiscard.value',
          sortable: true
        },
        {
          name: 'startDate',
          align: 'center',
          label: 'Start Date',
          field: 'startFishingLocation.date', // Is this correct?
          sortable: true
        }
      ]
    };

  }

  private async getHauls() {
    // if (this.currentTrip && this.currentTrip.operationIDs) {
    //   const queryOptions = {
    //     keys: this.currentTrip.operationIDs,
    //     descending: true
    //   };
    //   try {
    //     const result = await pouchService.db.allDocs(
    //       pouchService.userDBName,
    //       queryOptions
    //     );
    //     this.haulsData = result.rows;
    //   } catch (err) {
    //     console.log('error fetching hauls');
    //   }
    // }
    this.haulsData = {
      wcgop: [
        {
          doc: {
              operationNum: 17,
              observerTotalCatch: {
                weightMethod: 12,
                value: 42
              },
              gearPerformance: 5,
              targetStrategy: {
                code: 'URK1'
              },
              gearType: 'Pot',
              setTime: '2019-05-29T12:13:00-07:00',
              upDate: '2019-05-29T12:13:00-011:00',
              errors: 99
          }
        }
        ],
      ashop: [
        {
        doc: {
            haulNum: 44,
            observerEstimatedCatch: {
              measurement: {
                value: 99
              }
            },
            vesselEstimatedCatch: {
              measurement: {
                value: 634
              }
            },
            totalEstimatedDiscard: {
              value: 234
            },
            startFishingLocation: {
              date: '2019-05-29T12:13:00-07:00'
            }
          }
        }
      ]
    };

    // this.haulsData = [
    //   {
    //     doc: {
    //         haulNum: 17,
    //         observerEstimatedCatch: {
    //           measurement: {
    //             value: 99
    //           }
    //         },
    //         vesselEstimatedCatch: {
    //           measurement: {
    //             value: 634
    //           }
    //         },
    //         totalEstimatedDiscard: {
    //           value: 234
    //         },
    //         startFishingLocation: {
    //           date: '2019-05-29T12:13:00-07:00'
    //         }
    //       }
    //     }

    //     {
    //       doc: {
    //           operationNum: 17,
    //           observerTotalCatch: {
    //             weightMethod: 12,
    //             value: 42
    //           },
    //           gearPerformance: 5,
    //           targetStrategy: {
    //             code: 'URK1'
    //           },
    //           gearType: 'Pot',
    //           setTime: '2019-05-29T12:13:00-07:00',
    //           upDate: '2019-05-29T12:13:00-011:00',
    //           errors: 99
    //       }
    //     }

    // ];
  }

  private created() {
    this.setCurrentTrip({
      type: 'ashop-trip',
      uploadedBy: 'nicholas.shaffer@noaa.gov',
      uploadedDate: '2019-05-29T12:13:00-07:00',
      operationIDs: [],
      vessel: 4487,
      departureDate: '2008-05-13T08:00:00-07:00',
      returnDate: '2008-06-17T12:00:00-07:00',
      departurePort: {
        _id: '800f861a2dbf141f75a309dfe06e3792',
        _rev: '1-eafacc4bbcd478edf413445d48c02c86',
        type: 'ashop-port',
        portCode: 15,
        name: 'Seattle',
        state: 'WA'
      },
      returnPort: {
        _id: '800f861a2dbf141f75a309dfe06e3792',
        _rev: '1-eafacc4bbcd478edf413445d48c02c86',
        type: 'ashop-port',
        portCode: 15,
        name: 'Seattle',
        state: 'WA'
      },
      tripNum: 1,
      observers: [11889, [11889], [11956]],
      crewSize: 212,
      didFishingOccur: true,
      legacy: {
        cruiseNum: 11889,
        tripSeq: 61,
        cruiseVesselSeq: 41
      }
    });
    this.getHauls();
    this.getColumns();
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
    this.mode = JSON.parse(JSON.stringify(this.appMode));
    let num = 1;

    if (this.haulsData[this.mode][0]) { // remove modes - early dev only
      num = this.haulsData[this.mode][0].doc[this.haulsSettings.itemNumName] + 1; // remove modes - early dev only
    }

    if (this.mode === 'wcgop') {
      const haul: WcgopOperation = { operationNum: num };

      this.setCurrentHaul(haul);
      this.$router.push({ path: '/hauldetails/' + haul.operationNum });
    }

    if (this.mode === 'ashop') {
        const haul: AshopHaul = { haulNum: num };
        this.setCurrentHaul(haul);
        this.$router.push({ path: '/hauldetails/' + haul.haulNum });
    }

  }

  private editHauls() {
    this.mode = JSON.parse(JSON.stringify(this.appMode));
    if (this.mode === 'wcgop') {
      this.$router.push({
        path: '/hauldetails/' + this.currentHaul.operationNum
      });
    }

    if (this.mode === 'ashop') {
      this.$router.push({
        path: '/hauldetails/' + this.currentHaul.haulNum
      });
    }
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

  private getValue(row: any, attribute: any) {
    const fields = attribute.field.split('.');
    let value = row;
    for (const field of fields) {
      value = value[field];
    }
    return value;
  }

  private async getColumns() {
    if (this.appMode) {
      try {
        const db = pouchService.db;
        const queryOptions = {
          limit: 1,
          start_key: this.appMode,
          inclusive_end: true,
          descending: false,
          include_docs: true
        };
        const columns = await db.query(
          pouchService.lookupsDBName,
          'LookupDocs/boatnet-config-lookup',
          queryOptions
        );
        console.log(columns.rows[0].doc.hauls);
        this.haulsSettings = columns.rows[0].doc.hauls;
      } catch (err) {
        console.log(err);
      }
    }
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
