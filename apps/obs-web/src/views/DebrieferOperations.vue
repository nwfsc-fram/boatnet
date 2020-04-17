<template>
  <div>
    <div class="text-h6">Hauls</div>
    <prime-table :value="WcgopOperations" :columns="columns" type="Operations" uniqueKey="_id"/>
  </div>
</template>


<script lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import {
  TripState,
  PermitState,
  UserState,
  GeneralState,
  DebrieferState
} from '../_store/types/types';
import {
  WcgopTrip,
  WcgopOperation,
  WcgopCatch,
  WcgopSpecimen,
  Basket
} from '@boatnet/bn-models';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { date } from 'quasar';
import { convertToObject } from 'typescript';
import { getSelected } from '../helpers/localStorage';

@Component
export default class DebrieferOperations extends Vue {
  @Action('error', { namespace: 'alert' }) private error: any;
  @State('debriefer') private debriefer!: DebrieferState;

  @Action('addOperationId', { namespace: 'debriefer' })
  private addOperationId: any;
  @Action('removeOperationId', { namespace: 'debriefer' })
  private removeOperationId: any;

  private WcgopTrips: WcgopTrip[] = [];
  private WcgopOperations: WcgopOperation[] = [];
  private pagination = { rowsPerPage: 50 };
  private selected: any = [];
  private columns: any[] = [];

  private wcgopColumns = [
    {
      field: 'legacy.tripId',
      header: 'Trip Id',
      type: 'number',
      key: 'wcgopOpTripId'
    },
    {
      field: 'operationNum',
      header: 'Haul #',
      type: 'number',
      key: 'wcgopOpHaulNum'
    },
    {
        field: 'haulScore',
        header: 'Haul Score',
        type: 'toggle',
        list: ['Pass', 'Fail'],
        key: 'wcgopHaulScore',
        isEditable: true
      },
    {
      field: 'observerTotalCatch.measurement.value',
      header: 'OTC',
      type: 'number',
      key: 'wcgopOpOTC'
    },
    {
      field: 'observerTotalCatch.weightMethod.description',
      header: 'WT Method',
      type: 'input',
      key: 'wcgopOpWM'
    },
    {
      field: 'gearPerformance.description',
      header: 'Gear Perf',
      type: 'input',
      key: 'wcgopGearPerf'
    },
    {
      field: 'totalGearSegments',
      header: 'Total Gear',
      type: 'number',
      key: 'wcgopOpTotGear'
    },
    {
      field: 'gearSegmentsLost',
      header: 'Lost Gear',
      type: 'number',
      key: 'wcgopOpTotGearLost'
    },
    // sea bird avoidance
    {
      field: 'avgSoakTime.value',
      header: 'Average Soak Time',
      type: 'number',
      key: 'wcgopOpAvgSoakTime'
    },
    {
      field: 'beaufortValue',
      header: 'Beaufort',
      type: 'number',
      key: 'wcgopOpBeaufort'
    },
    { field: 'fit', header: 'Fit #', type: 'number', key: 'wcgopOpFit' },
    {
      field: 'calWeight',
      header: 'Cal WT',
      type: 'number',
      key: 'wcgopOpCalWeight'
    },
    {
      field: 'biolist',
      header: 'Biolist',
      type: 'number',
      key: 'wcgopOpBiolist'
    },
    {
      field: 'locations[0].locationDate',
      header: 'Start Date',
      type: 'date',
      key: 'wcgopOpStartDate'
    },
    {
      field: 'locations[1].locationDate',
      header: 'End Date',
      type: 'date',
      key: 'wcgopOpEndDate'
    },
    {
      field: 'locations[0].location.coordinates[0]',
      header: 'Start latitude',
      type: 'number',
      key: 'wcgopOpStartLat'
    },
    {
      field: 'locations[1].location.coorindates[0]',
      header: 'End latitude',
      type: 'number',
      key: 'wcgopOpEndLat'
    },
    {
      field: 'locations[0].location.coordinates[1]',
      header: 'Start longitude',
      type: 'number',
      key: 'wcgopOpStartLong'
    },
    {
      field: 'locations[1].location.coorindates[1]',
      header: 'End longitude',
      type: 'number',
      key: 'wcgopOpEndLong'
    },
    // depth
    {
      field: 'gearType.description',
      header: 'Gear Type',
      type: 'input',
      key: 'wcgopOpGearType'
    },
    {
      field: 'legacy.isBrdPresent',
      header: 'BRD',
      type: 'boolean',
      key: 'wcgopOpIsBRDPresent'
    },
    // HLFC
    {
      field: 'targetStrategy',
      header: 'Target Strategy',
      type: 'input',
      key: 'wcgopOptargetStrategy'
    },
    {
      field: 'isEfpUsed',
      header: 'EFP',
      type: 'boolean',
      key: 'wcgopOpEFPUsed'
    },
    // MMSBST
    { field: 'notes', header: 'Notes', type: 'input', key: 'wcgopOpNotes' }
  ];

  private ashopColumns = [
    {
      field: 'tripNum',
      header: 'Trip #',
      type: 'number',
      key: 'ashopOpTripNum'
    },
    {
      field: 'haulNum',
      header: 'Haul #',
      type: 'number',
      key: 'ashopOpHaulNum'
    },
    // indian fishing quote

    {
      field: 'legacy.cdqCode',
      header: 'CDQ',
      type: 'input',
      key: 'ashopOpCDQ'
    },
    {
      field: 'vesselType.description',
      header: 'Vessel Type',
      type: 'input',
      key: 'ashopOpVesselType'
    },
    {
      field: 'gearPerformance.description',
      header: 'Gear Perf',
      type: 'input',
      key: 'ashopGearPerf'
    },
    {
      field: 'startFishingLocation.date',
      header: 'Deployment Date',
      type: 'date',
      key: 'ashopOpStartFishingLoc'
    },

    {
      field: 'bottomDepth.value',
      header: 'Bottom Depth',
      type: 'number',
      key: 'ashopOpBottomDepth'
    },
    {
      field: 'fishingDepth.value',
      header: 'Fishing  Depth',
      type: 'number',
      key: 'ashopOpFishingDepth'
    },
    // depth unit
    // sampled by

    {
      field: 'legacy.rstCode',
      header: 'RST',
      type: 'input',
      key: 'ashopOpRST'
    },
    {
      field: 'legacy.rbtCode',
      header: 'RBT',
      type: 'input',
      key: 'ashopOpRBT'
    },
    {
      field: 'sampleDesignType',
      header: 'Sample Design',
      type: 'input',
      key: 'ashopOpSampleDesign'
    },
    // sample type unit
    {
      field: 'vesselEstimatedCatch.measurement.value',
      header: 'Vessel Est Catch',
      type: 'number',
      key: 'ashopOpVesselEstCatch'
    },
    {
      field: 'flowScaleCatch.measurement.value',
      header: 'Flow Scale Wt',
      type: 'number',
      key: 'ashopOpFlowScaleCatch'
    },

    { field: 'notes', header: 'Notes', type: 'input', key: 'ashopOpNotes' }
  ];

  @Watch('debriefer.trips')
  private async onTripsChange() {
    this.getOperations();
  }

  private async getOperations() {
    const masterDB: Client<any> = couchService.masterDB;
    let operationIds: string[] = [];
    let operationHolder = [];

    for (let trip of this.debriefer.trips) {
      operationIds = operationIds.concat(trip.operationIDs);
    }

    try {
      const options: ListOptions = {
        keys: operationIds
      };
      const operations = await masterDB.listWithDocs(options);
      for (const operation of operations.rows) {
        operationHolder.push(operation);
      }
      this.WcgopOperations = operationHolder;
    } catch (err) {
      this.error(err);
    }
  }

  private created() {
    this.columns = [];
    if (this.debriefer.program === 'ashop') {
      this.columns = this.ashopColumns;
    } else {
      this.columns = this.wcgopColumns;
    }
    this.getOperations();
  }

  private formatDate(inputDate: any) {
    return date.formatDate(inputDate, 'MM/DD/YYYY');
  }

  private nullValueCheck(input: any, round: boolean) {
    if (input) {
      if (round) {
        return input.value.toFixed(2);
      } else {
        return input.value;
      }
    }

    return '';
  }

  private nullDescriptionCheck(input: any) {
    if (input != null) {
      return input.description;
    }

    return '';
  }
}
</script>