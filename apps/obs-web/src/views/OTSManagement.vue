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
            left-label
            />
            <q-toggle
            v-model="showPrevious"
            label="Show Previous"
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
        >
        <template v-slot:body='props'>
            <q-tr :props='props' @click.native='OtsTargetDetail(props.row)' >
                <q-td key='fishery' style='width: 200px; white-space: normal !important;' :props='props' >{{ props.row.fishery }}</q-td>
                <!-- <q-td key='targetType' style='width: 100px' :props='props'>{{ props.row.targetType }}</q-td> -->
                <q-td key='actualObserved' style='width: 100px' :props='props'>{{ props.row.actualObserved || 'NA' }}%</q-td>
                <q-td key='coverageGoal' style='width: 100px' :props='props'>{{ props.row.coverageGoal }}%</q-td>
                <q-td key='setRate' style='width: 100px' :props='props'>{{ props.row.setRate }}%</q-td>
                <q-td key='effectiveDate' style='width: 200px' :props='props'>{{ props.row.effectiveDate }}</q-td>
                <q-td key='expirationDate' style='width: 200px' :props='props'>{{ props.row.expirationDate }}</q-td>
                <q-td key='status' :props='props'>{{ props.row.status }}</q-td>
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
        >
        <template v-slot:body='props'>
            <q-tr :props='props' @click.native='OtsTargetDetail(props.row)'>
                <q-td key='fishery' style='width: 200px' :props='props'>{{ props.row.fishery }}</q-td>
                <!-- <q-td key='targetType' style='width: 100px' :props='props'>{{ props.row.targetType }}</q-td> -->
                <q-td key='targetVesselName' style='width: 200px' :props='props'>{{ props.row.targetVesselName }} ( {{ props.row.targetVesselCGNumber }} )</q-td>
                <q-td key='actualObserved' style='width: 100px' :props='props'>{{ props.row.actualObserved || 'NA'}}%</q-td>
                <q-td key='coverageGoal' style='width: 100px' :props='props'>{{ props.row.coverageGoal }}%</q-td>
                <q-td key='setRate' style='width: 100px' :props='props'>{{ props.row.setRate }}%</q-td>
                <!-- <q-td key='targetVesselCGNumber' style='width: 100px' :props='props'>{{ props.row.targetVesselCGNumber }}</q-td> -->
                <q-td key='effectiveDate' style='width: 200px' :props='props'>{{ props.row.effectiveDate }}</q-td>
                <q-td key='expirationDate' style='width: 200px' :props='props'>{{ props.row.expirationDate }}</q-td>
                <q-td key='status' :props='props'>{{ props.row.status }}</q-td>
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
        >
        <template v-slot:body='props'>
            <q-tr :props='props' @click.native='OtsTargetDetail(props.row)'>
                <q-td key='fishery' style='width: 200px' :props='props'>{{ props.row.fishery }}</q-td>
                <!-- <q-td key='targetType' style='width: 100px' :props='props'>{{ props.row.targetType }}</q-td> -->
                <q-td key='targetPortGroupDescription' style='width: 200px' :props='props'>{{ props.row.targetPortGroupDescription }}</q-td>
                <q-td key='actualObserved' style='width: 100px' :props='props'>{{ props.row.actualObserved || 'NA' }}%</q-td>
                <q-td key='coverageGoal' style='width: 100px' :props='props'>{{ props.row.coverageGoal }}%</q-td>
                <q-td key='setRate' style='width: 100px' :props='props'>{{ props.row.setRate }}%</q-td>
                <q-td key='effectiveDate' style='width: 200px' :props='props'>{{ props.row.effectiveDate }}</q-td>
                <q-td key='expirationDate' style='width: 200px' :props='props'>{{ props.row.expirationDate }}</q-td>
                <q-td key='status' :props='props'>{{ props.row.status }}</q-td>
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
import { EmEfp, OTSTarget } from '@boatnet/bn-models';

import { Client, CouchDoc, ListOptions } from 'davenport';

import moment from 'moment';

@Component
export default class OtsMangement extends Vue {
    @State('alert') private alert!: AlertState;
    @State('ots') private ots!: OTSState;

    @Action('clear', { namespace: 'alert' }) private clear: any;
    @Action('error', { namespace: 'alert' }) private error: any;

    private showInactive: boolean = false;
    private showPrevious: boolean = false;

    private pagination = {rowsPerPage: 0};

    private fisheryColumns: any[] = [
        {name: 'fishery', label: 'Fishery', field: 'fishery',
        required: true, align: 'left', sortable: true },
        // {name: 'targetType' ,label: 'Target Type', field: 'targetType',
        // required: true, align: 'left', sortable: true},
        {name: 'actualObserved', label: 'Actual Observed', field: 'actualObserved',
        required: true, align: 'left', sortable: true },
        {name: 'coverageGoal', label: 'Coverage Goal', field: 'coverageGoal',
        required: true, align: 'left', sortable: true },
        {name: 'setRate', label: 'Set Rate', field: 'setRate', required: true, align: 'left' },
        // {name: 'lbsLanded', label: 'LBS Landed To Date', field: 'lbsLanded',
        // required: false, align: 'left', sortable: true },
        // {name: 'lbsCovered', label: 'LBS Covered', field: 'lbsCovered',
        // required: false, align: 'left' },
        // {name: 'percentDifference', label: '% Difference', field: 'percentDifference',
        // required: true, align: 'left', sortable: true },
        {name: 'effectiveDate', label: 'Effective Date', field: 'effectiveDate',
        required: true, align: 'left', sortable: true},
        {name: 'expirationDate', label: 'expirationDate', field: 'expirationDate',
        required: true, align: 'left', sortable: true},
        {name: 'status', label: 'Status', field: 'status',
        required: true, align: 'left', sortable: true}
    ];

    private vesselColumns: any[] = [
        {name: 'fishery', label: 'Fishery', field: 'fishery', required: true,
        align: 'left', sortable: true },
        // {name: 'targetType' ,label: 'Target Type', field: 'targetType',
        // required: true, align: 'left', sortable: true},
        {name: 'targetVesselName', label: 'Vessel', field: 'targetVesselName',
        required: true, align: 'left', sortable: true },
        {name: 'actualObserved', label: 'Actual Observed', field: 'actualObserved',
        required: true, align: 'left', sortable: true },
        {name: 'coverageGoal', label: 'Coverage Goal', field: 'coverageGoal',
        required: true, align: 'left', sortable: true },
        {name: 'setRate', label: 'Set Rate', field: 'setRate', required: true, align: 'left' },
        // {name: 'targetVesselId', label: 'Target Vessel ID', field: 'targetVesselId',
        // required: true, align: 'left', sortable: true },
        // {name: 'targetVesselCGNumber', label: 'Target Vessel CG Number', field: 'targetVesselCGNumber',
        // required: true, align: 'left', sortable: true },
        // {name: 'lbsLanded', label: 'LBS Landed To Date', field: 'lbsLanded',
        // required: false, align: 'left', sortable: true },
        // {name: 'lbsCovered', label: 'LBS Covered', field: 'lbsCovered',
        // required: false, align: 'left' },
        // {name: 'percentDifference', label: '% Difference', field:
        // 'percentDifference', required: true, align: 'left', sortable: true },
        {name: 'effectiveDate', label: 'Effective Date', field: 'effectiveDate',
        required: true, align: 'left', sortable: true},
        {name: 'expirationDate', label: 'expirationDate', field: 'expirationDate',
        required: true, align: 'left', sortable: true},
        {name: 'status', label: 'Status', field: 'status',
        required: true, align: 'left', sortable: true}
    ];

    private portGroupColumns: any[] = [
        {name: 'fishery', label: 'Fishery', field: 'fishery', required: true,
        align: 'left', sortable: true },
        // {name: 'targetType' ,label: 'Target Type', field: 'targetType',
        // required: true, align: 'left', sortable: true},
        {name: 'targetPortGroupDescription', label: 'Port Group', field: 'targetPortGroupDescription',
        required: true, align: 'left', sortable: true },
        {name: 'actualObserved', label: 'Actual Observed', field: 'actualObserved',
        required: true, align: 'left', sortable: true },
        {name: 'coverageGoal', label: 'Coverage Goal', field: 'coverageGoal',
        required: true, align: 'left', sortable: true },
        {name: 'setRate', label: 'Set Rate', field: 'setRate', required: true, align: 'left' },
        // {name: 'targetPortGroupId', label: 'Target Port Group ID', field:
        // 'targetPortGroupId', required: true, align: 'left', sortable: true },
        // {name: 'lbsLanded', label: 'LBS Landed To Date', field: 'lbsLanded',
        // required: false, align: 'left', sortable: true },
        // {name: 'lbsCovered', label: 'LBS Covered', field: 'lbsCovered', required: false, align: 'left' },
        // {name: 'percentDifference', label: '% Difference', field:
        // 'percentDifference', required: true, align: 'left', sortable: true },
        {name: 'effectiveDate', label: 'Effective Date', field: 'effectiveDate',
        required: true, align: 'left', sortable: true},
        {name: 'expirationDate', label: 'expirationDate', field: 'expirationDate',
        required: true, align: 'left', sortable: true},
        {name: 'status', label: 'Status', field: 'status',
        required: true, align: 'left', sortable: true}
    ];

    private otsTargets: any[] = [
        {
            _id: 'weaefaq3ar34rwefgsdfq',
            fishery: 'EM EFP',
            targetType: 'Fishery',
            coverageGoal: 27,
            setRate: 33,
            effectiveDate: moment().format('MM/DD/YYYY'),
            expirationDate: '12/31/' + moment().format('YYYY'),
            actualObserved: 28,
            status: 'Active'
        },
        {
            _id: 'gsdffweer34rwgrthg34er34',
            fishery: 'Limited Entry - Catch Shares',
            targetType: 'Fishery',
            coverageGoal: 32,
            setRate: 37,
            effectiveDate: moment().format('MM/DD/YYYY'),
            expirationDate: '12/31/' + moment().format('YYYY'),
            actualObserved: 30,
            status: 'Active'
        },
        {
            _id: 'weaefaq3ar34rwefgsdfq',
            fishery: 'Trawl Gear - Mod EFP',
            targetType: 'Fishery',
            coverageGoal: 33,
            setRate: 33,
            effectiveDate: moment().format('MM/DD/YYYY'),
            expirationDate: '12/31/' + moment().format('YYYY'),
            actualObserved: 10,
            status: 'Active'
        },
        {
            _id: 'vsdffew34r34rfsdffd3r3',
            fishery: 'EM EFP',
            targetType: 'Vessel',
            coverageGoal: 23,
            setRate: 29,
            targetVesselID: 'd4fsdsgrgre3q4q5wefsdfbsdfg',
            targetVesselName: 'Excalibur',
            targetVesselCGNumber: '5346605',
            effectiveDate: moment().format('MM/DD/YYYY'),
            expirationDate: '12/31/' + moment().format('YYYY'),
            actualObserved: 27,
            status: 'Active'
        },
        {
            _id: 'fdsfweqrawfsdfsefafsdfqwe',
            fishery: 'EM EFP',
            targetType: 'Vessel',
            coverageGoal: 35,
            setRate: 40,
            targetVesselID: 'd4fsdsgrgre3q4q5wefsdfbsdfg',
            targetVesselName: 'Raven',
            targetVesselCGNumber: '55432343',
            effectiveDate: moment().format('MM/DD/YYYY'),
            expirationDate: '12/31/' + moment().format('YYYY'),
            actualObserved: 22,
            status: 'Active'
        },
        {
            _id: 'fesfgg54gsr5bsr5h45ats4s',
            fishery: 'EM EFP',
            targetType: 'Vessel',
            coverageGoal: 40,
            setRate: 55,
            targetVesselID: 'd4fsdsgrgre3q4q5wefsdfbsdfg',
            targetVesselName: 'Last Straw',
            targetVesselCGNumber: '3456463',
            effectiveDate: moment().format('MM/DD/YYYY'),
            expirationDate: '12/31/' + moment().format('YYYY'),
            actualObserved: 35,
            status: 'Active'
        },
        {
            _id: 'vsdfv3434rervsdfbq3a3rwfffdvsdf',
            fishery: 'EM EFP',
            targetType: 'Port Group',
            coverageGoal: 22,
            setRate: 27,
            targetPortGroupID: 'd4fsdsgrgre3q4q5wefsdfbsdfg',
            targetPortGroupDescription: 'SPS (Seattle Area)',
            effectiveDate: moment().format('MM/DD/YYYY'),
            expirationDate: '12/31/' + moment().format('YYYY'),
            actualObserved: 20,
            status: 'Active'
        },
        {
            _id: 'f34wrsersgwerf34wfsgq34',
            fishery: 'EM EFP',
            targetType: 'Port Group',
            coverageGoal: 30,
            setRate: 35,
            targetPortGroupID: 'd4fsdsgrgre3q4q5wefsdfbsdfg',
            targetPortGroupDescription: 'ACA (Los Angeles Area)',
            effectiveDate: moment().format('MM/DD/YYYY'),
            expirationDate: '12/31/' + moment().format('YYYY'),
            status: 'Active'
        },
        {
            _id: 'sfdvw43st4t45g56h6ehtyjrty',
            fishery: 'EM EFP',
            targetType: 'Port Group',
            coverageGoal: 33,
            setRate: 33,
            targetPortGroupID: 'd4fsdsgrgre3q4q5wefsdfbsdfg',
            targetPortGroupDescription: 'AOR (Northern Oregon)',
            effectiveDate: moment().format('MM/DD/YYYY'),
            expirationDate: '12/31/' + moment().format('YYYY'),
            actualObserved: 33,
            status: 'Active'
        },
    ];

    private get fisheryTargets() {
        return this.otsTargets.filter((target) => target.targetType === 'Fishery');
    }

    private get vesselTargets() {
        return this.otsTargets.filter((target) => target.targetType === 'Vessel');
    }

    private get portGroupTargets() {
        return this.otsTargets.filter((target) => target.targetType === 'Port Group');
    }

    private OtsTargetDetail(row: any) {
        console.log(row);
        this.ots.activeOTSTarget = row;
        console.log(this.ots.activeOTSTarget);
        this.$router.push({path: '/ots-target-detail/' + this.otsTargets.indexOf(row)});
    }

    private newOtsTarget() {
        this.$router.push({path: '/ots-target-detail'});
    }

}
</script>

<style>
.q-table__title {
    color: #1675d1;
    font-weight: bold;
}
</style>
