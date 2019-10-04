<template>
    <div class='q-pa-md  q-gutter-md'>

        <q-banner rounded inline-actions v-show="!!alert.message" class="bg-red text-white">
            {{alert.message}}
            <template v-slot:action>
                <q-btn flat label="Dismiss" @click="clear"/>
            </template>
        </q-banner>

        <div class="centered-page-item">
            <q-btn color='primary text-white q-ma-md' @click='newOtsTarget'>New Target</q-btn>
        </div>

        <div >
            <q-toggle
            v-model="showInactive"
            label="Show Inactive"
            @click="showInactive = !showInactive"
            left-label
            />
            <q-toggle
            v-model="showPriorYear"
            label="Show Prior Year Observed %"
            @click="showPriorYear = !showPriorYear"
            left-label
            />
        </div>

        <q-table
        title='Fishery Targets'
        :data='fisheryTargets'
        :columns='fisheryColumns'
        dense
        row-key='_id'
        :pagination.sync='pagination'
        hide-bottom
        class="bg-blue-grey-1"
        >
        <template v-slot:body='props'>
            <q-tr :props='props' @click.native='OtsTargetDetail(props.row)' >
                <q-td key='fishery' class="text-primary" style='width: 200px; white-space: normal !important;; font-weight: bold' :props='props' >{{ props.row.fishery }}</q-td>
                <!-- <q-td key='targetType' style='width: 100px' :props='props'>{{ props.row.targetType }}</q-td> -->
                <q-td key='actualObserved' style='width: 100px' :props='props'>{{ getActualObserved(props.row) }}%</q-td>
                <q-td key='coverageGoal' style='width: 100px' :props='props'>{{ props.row.coverageGoal }}%</q-td>
                <q-td key='setRate' style='width: 100px' :props='props'>{{ props.row.setRate }}%</q-td>
                <q-td key='effectiveDate' style='width: 200px' :props='props'>{{ formatDate(props.row.effectiveDate) }}</q-td>
                <q-td key='expirationDate' style='width: 200px' :props='props'>{{ formatDate(props.row.expirationDate) }}</q-td>
                <q-td key='status' :props='props'>{{ getStatus(props.row) }}</q-td>
            </q-tr>
        </template>

        </q-table>

        <q-table
        title='Vessel Targets'
        :data='vesselTargets'
        :columns='vesselColumns'
        dense
        row-key='_id'
        :pagination.sync='pagination'
        hide-bottom
        class="bg-blue-grey-1"
        :filter="filter"
        :filter-method="vesselsFilter"
        >

        <template v-slot:top-right>
            <q-input outlined dense debounce="300" color="primary" v-model="filter" label="vessel | reg">
                <template v-slot:append>
                    <q-icon name="search" />
                </template>
            </q-input>
        </template>

        <template v-slot:body='props'>
            <q-tr :props='props' @click.native='OtsTargetDetail(props.row)'>
                <q-td key='vesselFishery' style='width: 200px' :props='props'>{{ props.row.fishery }}</q-td>
                <!-- <q-td key='targetType' style='width: 100px' :props='props'>{{ props.row.targetType }}</q-td> -->
                <q-td key='vesselTargetVessel' class="text-primary" style='width: 200px; font-weight: bold' :props='props'>{{ props.row.targetVessel.vesselName }} ( {{ props.row.targetVessel.coastGuardNumber ? props.row.targetVessel.coastGuardNumber : props.row.targetVessel.stateRegulationNumber }} )</q-td>
                <q-td key='vesselActualObserved' style='width: 100px' :props='props'>{{ getActualObserved(props.row) }}%</q-td>
                <q-td key='vesselCoverageGoal' style='width: 100px' :props='props'>{{ props.row.coverageGoal }}%</q-td>
                <q-td key='vesselSetRate' style='width: 100px' :props='props'>{{ props.row.setRate }}%</q-td>
                <!-- <q-td key='targetVesselCGNumber' style='width: 100px' :props='props'>{{ props.row.targetVesselCGNumber }}</q-td> -->
                <q-td key='vesselEffectiveDate' style='width: 200px' :props='props'>{{ formatDate(props.row.effectiveDate) }}</q-td>
                <q-td key='vesselExpirationDate' style='width: 200px' :props='props'>{{ formatDate(props.row.expirationDate) }}</q-td>
                <q-td key='vesselStatus' :props='props'>{{ getStatus(props.row) }}</q-td>
            </q-tr>
        </template>
        </q-table>

        <q-table
        title='Port Group Targets'
        :data='portGroupTargets'
        :columns='portGroupColumns'
        dense
        row-key='_id'
        :pagination.sync='pagination'
        hide-bottom
        class="bg-blue-grey-1"
        >
        <template v-slot:body='props'>
            <q-tr :props='props' @click.native='OtsTargetDetail(props.row)'>
                <q-td key='portFishery' style='width: 200px' :props='props'>{{ props.row.fishery }}</q-td>
                <!-- <q-td key='targetType' style='width: 100px' :props='props'>{{ props.row.targetType }}</q-td> -->
                <q-td key='portTargetPortGroup' class="text-primary" style='width: 200px; font-weight: bold' :props='props'>{{ props.row.targetPortGroup }}</q-td>
                <q-td key='portActualObserved' style='width: 100px' :props='props'>{{ getActualObserved(props.row) }}%</q-td>
                <q-td key='portCoverageGoal' style='width: 100px' :props='props'>{{ props.row.coverageGoal }}%</q-td>
                <q-td key='portSetRate' style='width: 100px' :props='props'>{{ props.row.setRate }}%</q-td>
                <q-td key='portEffectiveDate' style='width: 200px' :props='props'>{{ formatDate(props.row.effectiveDate) }}</q-td>
                <q-td key='portExpirationDate' style='width: 200px' :props='props'>{{ formatDate(props.row.expirationDate) }}</q-td>
                <q-td key='portStatus' :props='props'>{{ getStatus(props.row) }}</q-td>
            </q-tr>
        </template>
        </q-table>
    </div>
</template>

<script lang='ts'>
import { State, Action, Getter, Mutation } from 'vuex-class';
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
// https://github.com/kaorun343/vue-property-decorator

import router from '../router';
import { AlertState, EmefpState, GeneralState, OTSState } from '../_store/types/types';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { EmEfp, OTSTarget, OTSTargetTypeName, WcgopTrip } from '@boatnet/bn-models';

import { Client, CouchDoc, ListOptions } from 'davenport';

import moment from 'moment';

@Component
export default class OtsMangement extends Vue {
    @State('alert') private alert!: AlertState;
    @State('ots') private ots!: OTSState;

    @Action('clear', { namespace: 'alert' }) private clear: any;
    @Action('error', { namespace: 'alert' }) private error: any;

    private showInactive: boolean = false;
    private showPriorYear: boolean = false;

    private emEfpTrips: WcgopTrip[] = [];
    private emEfpRoster: EmEfp[] = [];

    private otsTargets: OTSTarget[] = [];

    private pagination = {rowsPerPage: 0};

    private fisheryColumns: any[] = [
        {name: 'fishery', label: 'Fishery', field: 'fishery', required: true, align: 'left', sortable: true },
        // {name: 'targetType' ,label: 'Target Type', field: 'targetType', required: true, align: 'left', sortable: true},
        {name: 'actualObserved', label: 'Actual Observed', field: 'actualObserved', required: true, align: 'left', sortable: true },
        {name: 'coverageGoal', label: 'Coverage Goal', field: 'coverageGoal', required: true, align: 'left', sortable: true },
        {name: 'setRate', label: 'Set Rate', field: 'setRate', required: true, align: 'left', sortable: true },
        // {name: 'lbsLanded', label: 'LBS Landed To Date', field: 'lbsLanded', required: false, align: 'left', sortable: true },
        // {name: 'lbsCovered', label: 'LBS Covered', field: 'lbsCovered' required: false, align: 'left' },
        // {name: 'percentDifference', label: '% Difference', field: 'percentDifference', required: true, align: 'left', sortable: true },
        {name: 'effectiveDate', label: 'Effective Date', field: 'effectiveDate', required: true, align: 'left', sortable: true},
        {name: 'expirationDate', label: 'expirationDate', field: 'expirationDate', required: true, align: 'left', sortable: true},
        {name: 'status', label: 'Status', field: 'status', required: true, align: 'left', sortable: true}
    ];

    private vesselColumns: any[] = [
        {name: 'vesselFishery', label: 'Fishery', field: 'fishery', required: true, align: 'left', sortable: true },
        {name: 'vesselTargetVessel', label: 'Vessel', field: 'targetVessel.vesselName', required: true, align: 'left', sortable: true },
        {name: 'vesselActualObserved', label: 'Actual Observed', field: 'actualObserved', required: true, align: 'left', sortable: true },
        {name: 'vesselCoverageGoal', label: 'Coverage Goal', field: 'coverageGoal', required: true, align: 'left', sortable: true },
        {name: 'vesselSetRate', label: 'Set Rate', field: 'setRate', required: true, align: 'left', sortable: true },
        // {name: 'vesselLbsLanded', label: 'LBS Landed To Date', field: 'lbsLanded', required: false, align: 'left', sortable: true },
        // {name: 'vesselLbsCovered', label: 'LBS Covered', field: 'lbsCovered', required: false, align: 'left' },
        // {name: 'vesselPercentDifference', label: '% Difference', field: 'percentDifference', required: true, align: 'left', sortable: true },
        {name: 'vesselEffectiveDate', label: 'Effective Date', field: 'effectiveDate', required: true, align: 'left', sortable: true},
        {name: 'vesselExpirationDate', label: 'expirationDate', field: 'expirationDate', required: true, align: 'left', sortable: true},
        {name: 'vesselStatus', label: 'Status', field: 'status', required: true, align: 'left', sortable: true}
    ];

    private portGroupColumns: any[] = [
        {name: 'portFishery', label: 'Fishery', field: 'fishery', required: true, align: 'left', sortable: true },
        {name: 'portTargetPortGroup', label: 'Port Group', field: 'targetPortGroup', required: true, align: 'left', sortable: true },
        {name: 'portActualObserved', label: 'Actual Observed', field: 'actualObserved', required: true, align: 'left', sortable: true },
        {name: 'portCoverageGoal', label: 'Coverage Goal', field: 'coverageGoal', required: true, align: 'left', sortable: true },
        {name: 'portSetRate', label: 'Set Rate', field: 'setRate', required: true, align: 'left', sortable: true },
        // {name: 'portLbsLanded', label: 'LBS Landed To Date', field: 'lbsLanded', required: false, align: 'left', sortable: true },
        // {name: 'portLbsCovered', label: 'LBS Covered', field: 'lbsCovered', required: false, align: 'left' },
        // {name: 'portPercentDifference', label: '% Difference', field: 'percentDifference', required: true, align: 'left', sortable: true },
        {name: 'portEffectiveDate', label: 'Effective Date', field: 'effectiveDate', required: true, align: 'left', sortable: true},
        {name: 'portExpirationDate', label: 'expirationDate', field: 'expirationDate', required: true, align: 'left', sortable: true},
        {name: 'portStatus', label: 'Status', field: 'status', required: true, align: 'left', sortable: true}
    ];

    private filter: string = '';

    private vesselsFilter(rows: any, terms: any, cols: any, cellValue: any) {
        const lowerFilter = this.filter.toLowerCase();
        return rows.filter(
            (row: any) => cols.some( (col: any) => (
                    console.log(row.targetVessel.vesselName),
                    (
                        ( row.targetVessel.vesselName + '' ).toLowerCase().indexOf(lowerFilter) !== -1
                    )
                    ||
                    (
                        row.targetVessel.coastGuardNumber ?
                        row.targetVessel.coastGuardNumber.indexOf(lowerFilter) !== -1 :
                        row.targetVessel.stateRegulationNumber.indexOf(lowerFilter) !== -1
                    )
                )
            )
        );
    }

    private async getOtsTargets() {
        const masterDB: Client<any> = couchService.masterDB;
        try {
            const otsTargets = await masterDB.viewWithDocs<any>(
                'obs-web',
                'all_ots_targets',
                );
            console.log(otsTargets);
            for (const row of otsTargets.rows) {
                const target = row.doc;
                this.otsTargets.push(target);
            }

        } catch (err) {
            this.error(err);
        }
    }

    private async getEMEFP() {
      const masterDB: Client<any> = couchService.masterDB;

      const emefpTrips = await masterDB.viewWithDocs<any>(
        'obs-web',
        'em-efp-trips'
      );

      for (const row of emefpTrips.rows) {
        const trip = row.doc;
        this.emEfpTrips.push(trip);
      }

      const emefpRoster = await masterDB.viewWithDocs<any>(
        'obs-web',
        'all_em_efp'
      );

      for (const row of emefpRoster.rows) {
        const member = row.doc;
        this.emEfpRoster.push(member);
      }

    }

    private getActualObserved(otsTarget: OTSTarget) {
        if (otsTarget.targetType === 'Vessel') {
            return Math.floor(this.getCoveredPercent(otsTarget.targetVessel));
        }
        if (otsTarget.targetType === 'Fishery Wide' && otsTarget.fishery === 'EM EFP') {
            const affectedVessels = [];
            let tripsTaken = 0;
            let selectedTrips = 0;
            let coveredPercent = 0;
            // get roster
            for (const member of this.emEfpRoster) {
                if (member.vessel) {
                    affectedVessels.push(member.vessel);
                }
            }

            for (const vessel of affectedVessels) {
                tripsTaken += this.getTripsTaken(vessel);
                selectedTrips += this.getSelectedTrips(vessel);
            }

            coveredPercent = Math.floor((selectedTrips / tripsTaken) * 100);
            if (!coveredPercent) {
                coveredPercent = 0;
            }

            return coveredPercent;
        } else {
            return 'N/A';
        }
    }

    private getTripsTaken(vessel: any) {
      const vesselID = vessel.coastGuardNumber ? vessel.coastGuardNumber : vessel.stateRegulationNumber;
      let count = 0;
      for (const trip of this.emEfpTrips) {
        const tripVesselID = trip.vessel!.coastGuardNumber ? trip.vessel!.coastGuardNumber : trip.vessel!.stateRegulationNumber;
        if (this.showPriorYear) {
            if ( tripVesselID === vesselID &&
                (
                (moment(trip.departureDate).years() || moment(trip.returnDate).years()) === moment().subtract(1, 'years').years()
                )
            ) {
                count++;
            }
        } else {
            if ( tripVesselID === vesselID &&
                (
                (moment(trip.departureDate).years() || moment(trip.returnDate).years()) === moment().years()
                )
            ) {
                count++;
            }
        }

      }
      return count;
    }

    private getSelectedTrips(vessel: any) {
      const vesselID = vessel.coastGuardNumber ? vessel.coastGuardNumber : vessel.stateRegulationNumber;
      let count = 0;
      for (const trip of this.emEfpTrips) {
        const tripVesselID = trip.vessel!.coastGuardNumber ? trip.vessel!.coastGuardNumber : trip.vessel!.stateRegulationNumber;
        if (this.showPriorYear) {
            if ( tripVesselID === vesselID && trip.isSelected &&
                (
                    (moment(trip.departureDate).years() || moment(trip.returnDate).years()) === moment().subtract(1, 'years').years()
                )
            ) {
              count++;
            }
        } else {
            if ( tripVesselID === vesselID && trip.isSelected &&
                (
                    (moment(trip.departureDate).years() || moment(trip.returnDate).years()) === moment().years()
                )
            ) {
              count++;
            }
        }
      }
      return count;
    }

    private getCoveredPercent(vessel: any) {
      const coveredPercent = (this.getSelectedTrips(vessel) / this.getTripsTaken(vessel)) * 100;
      return coveredPercent ? coveredPercent : 0;
    }


    private get fisheryTargets() {
        if (this.showInactive) {
            return this.otsTargets.filter((target) => target.targetType === 'Fishery Wide');
        } else {
            return this.otsTargets.filter((target) => target.targetType === 'Fishery Wide' && this.getStatus(target) === 'Active');
        }
    }

    private get vesselTargets() {
        if (this.showInactive) {
            return this.otsTargets.filter((target) => target.targetType === 'Vessel');
        } else {
            return this.otsTargets.filter((target) => target.targetType === 'Vessel' && this.getStatus(target) === 'Active');
        }
    }

    private get portGroupTargets() {
        if (this.showInactive) {
            return this.otsTargets.filter((target) => target.targetType === 'Port Group');
        } else {
            return this.otsTargets.filter((target) => target.targetType === 'Port Group' && this.getStatus(target) === 'Active');
        }
    }

    private OtsTargetDetail(row: any) {
        console.log(row);
        this.ots.newTarget = false;
        this.ots.activeOTSTarget = row;
        console.log(this.ots.activeOTSTarget);
        this.$router.push({path: '/ots-target-detail/' + this.otsTargets.indexOf(row)});
    }

    private newOtsTarget() {
        const newOtsTarget: OTSTarget = {
            createdBy: authService.getCurrentUser()!.username,
            createdDate: moment().format(),
            type: OTSTargetTypeName,
            fishery: '',
            targetType: '',
            coverageGoal: 0,
            setRate: 0,
            targetVessel: undefined,
            targetPortGroup: undefined,
            effectiveDate: moment().format('MM/DD/YYYY'),
            expirationDate: '12/31/' + moment().format('YYYY'),
        };
        this.ots.newTarget = true;
        this.ots.activeOTSTarget = newOtsTarget;
        this.$router.push({path: '/ots-target-detail'});
    }

    private formatDate(date: string) {
        return moment(date).format('MMM DD, YYYY');
    }

    private getStatus(row: any) {
        if ( (moment(row.efffectiveDate) <= moment() && moment() <= moment(row.expirationDate)) && ( row.status !== 'Inactive' )) {
            return 'Active';
        } else {
            return 'Inactive';
        }
    }

    private created() {
        this.getOtsTargets();
        this.getEMEFP();
    }

}
</script>

<style>
.q-table__title {
    color: #1675d1;
    font-weight: bold;
}
</style>
