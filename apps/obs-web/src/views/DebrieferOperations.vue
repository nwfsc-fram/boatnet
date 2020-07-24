<template>
  <div>
    <prime-table
      :value="operations"
      :columns="columns"
      type="Operations"
      uniqueKey="_id"
      :enableSelection="true"
      :isFullSize="isFullSize"
    />
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

@Component
export default class DebrieferOperations extends Vue {
  @Prop() private isFullSize!: boolean;
  @Prop() private operations!: any[];
  @Action('error', { namespace: 'alert' }) private error: any;
  @State('debriefer') private debriefer!: DebrieferState;

  private columns: any[] = [];

  private wcgopColumns = [
    {
      field: 'legacy.tripId',
      header: 'Trip Id',
      type: 'number',
      key: 'wcgopOpTripId',
      width: '80'
    },
    {
      field: 'operationNum',
      header: 'Haul #',
      type: 'number',
      key: 'wcgopOpHaulNum',
      width: '60'
    },
    {
      field: 'haulScore',
      header: 'Haul Score',
      type: 'toggle',
      list: ['Pass', 'Fail'],
      key: 'wcgopHaulScore',
      isEditable: true,
      width: '100'
    },
    {
      field: 'observerTotalCatch.measurement.value',
      header: 'OTC (lbs)',
      type: 'double',
      key: 'wcgopOpOTC',
      width: '100'
    },
    {
      field: 'observerTotalCatch.weightMethod.description',
      header: 'OTC WT Method',
      type: 'input',
      key: 'wcgopOpWM',
      width: '150'
    },
    {
      field: 'gearPerformance.description',
      header: 'Gear Perf',
      type: 'input',
      key: 'wcgopGearPerf',
      width: '150'
    },
    {
      field: 'totalGearSegments',
      header: 'Total Gear',
      type: 'number',
      key: 'wcgopOpTotGear',
      width: '100'
    },
    {
      field: 'gearSegmentsLost',
      header: 'Lost Gear',
      type: 'number',
      key: 'wcgopOpTotGearLost',
      width: '100'
    },
    // sea bird avoidance
    {
      field: 'avgSoakTime.value',
      header: 'Average Soak Time',
      type: 'number',
      key: 'wcgopOpAvgSoakTime',
      width: '100'
    },
    {
      field: 'beaufortValue',
      header: 'Beaufort',
      type: 'number',
      key: 'wcgopOpBeaufort',
      width: '70'
    },
    {
      field: 'fit',
      header: 'Fit #',
      type: 'number',
      key: 'wcgopOpFit',
      width: '70'
    },
    {
      field: 'calWeight',
      header: 'Cal WT',
      type: 'number',
      key: 'wcgopOpCalWeight',
      width: '70'
    },
    {
      field: 'biolist',
      header: 'Biolist',
      type: 'number',
      key: 'wcgopOpBiolist',
      width: '100'
    },
    {
      field: 'locations[0].locationDate',
      header: 'Start Date',
      type: 'date',
      key: 'wcgopOpStartDate',
      width: '150'
    },
    {
      field: 'locations[1].locationDate',
      header: 'End Date',
      type: 'date',
      key: 'wcgopOpEndDate',
      width: '150'
    },
    {
      field: 'locations[0].location.coordinates[0]',
      header: 'Start lat',
      type: 'double',
      key: 'wcgopOpStartLat',
      width: '125'
    },
    {
      field: 'locations[1].location.coorindates[0]',
      header: 'End lat',
      type: 'double',
      key: 'wcgopOpEndLat',
      width: '125'
    },
    {
      field: 'locations[0].location.coordinates[1]',
      header: 'Start long',
      type: 'double',
      key: 'wcgopOpStartLong',
      width: '125'
    },
    {
      field: 'locations[1].location.coorindates[1]',
      header: 'End long',
      type: 'double',
      key: 'wcgopOpEndLong',
      width: '125'
    },
    // depth
    {
      field: 'gearType.description',
      header: 'Gear Type',
      type: 'input',
      key: 'wcgopOpGearType',
      width: '250'
    },
    {
      field: 'legacy.isBrdPresent',
      header: 'BRD',
      type: 'boolean',
      key: 'wcgopOpIsBRDPresent',
      width: '100'
    },
    // HLFC
    {
      field: 'targetStrategy',
      header: 'Target Strategy',
      type: 'input',
      key: 'wcgopOptargetStrategy',
      width: '100'
    },
    {
      field: 'isEfpUsed',
      header: 'EFP',
      type: 'boolean',
      key: 'wcgopOpEFPUsed',
      width: '80'
    },
    // MMSBST
    {
      field: 'notes',
      header: 'Notes',
      type: 'input',
      key: 'wcgopOpNotes',
      width: '200'
    }
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

  private created() {
    this.columns = [];
    if (this.debriefer.program === 'ashop') {
      this.columns = this.ashopColumns;
    } else {
      this.columns = this.wcgopColumns;
    }
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