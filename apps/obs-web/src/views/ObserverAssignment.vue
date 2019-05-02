<template>
    <div>
        <q-card>
            <q-card-section>
                <q-table
                title='Un-Assigned Trips'
                :data='unassignedTrips'
                :columns='columns'
                dense
                row-key='_id'
                :pagination.sync='unassignedPagination'
                >
                <template v-slot:body='props'>
                <q-tr :props='props' @click.native='ObserverAssignmentDetail(props.row)' >
                    <q-td key='vesselName' style='width: 200px; white-space: normal !important;' :props='props' >{{ props.row.vesselName }}</q-td>
                    <q-td key='captain' style='width: 100px' :props='props'>{{ props.row.captain || 'NA' }}</q-td>
                    <q-td key='captainPhone' style='width: 100px' :props='props'>{{ formatTel(props.row.captainPhone) || 'NA' }}</q-td>
                    <q-td key='tripStartDate' style='width: 200px' :props='props'>{{ props.row.tripStartDate }}</q-td>
                    <q-td key='tripEndDate' style='width: 200px' :props='props'>{{ props.row.tripEndDate }}</q-td>
                    <q-td key='fishery' style='width: 200px' :props='props'>{{ props.row.fishery }}</q-td>
                    <q-td key='departurePort' style='width: 200px' :props='props'>{{ props.row.departurePort }}</q-td>
                    <q-td key='observerName' style='width: 200px' :props='props'>{{ props.row.observerName }}</q-td>
                    <q-td key='observerPhone' style='width: 200px' :props='props'>{{ props.row.observerPhone }}</q-td>
                    <q-td key='selectionStatus' :props='props'>{{ props.row.selectionStatus }}</q-td>
                </q-tr>
                </template>
                </q-table>
            </q-card-section>

            <q-card-section>
                <q-table
                title='Assigned Trips'
                :data='assignedTrips'
                :columns='columns'
                dense
                row-key='_id'
                :pagination.sync='assignedPagination'
                hide-bottom
                >
                <template v-slot:body='props'>
                <q-tr :props='props' @click.native='ObserverAssignmentDetail(props.row)' >
                    <q-td key='vesselName' style='width: 200px; white-space: normal !important;' :props='props' >{{ props.row.vesselName }}</q-td>
                    <q-td key='captain' style='width: 100px' :props='props'>{{ props.row.captain || 'NA' }}</q-td>
                    <q-td key='captainPhone' style='width: 100px' :props='props'>{{ formatTel(props.row.captainPhone) || 'NA' }}</q-td>
                    <q-td key='tripStartDate' style='width: 200px' :props='props'>{{ props.row.tripStartDate }}</q-td>
                    <q-td key='tripEndDate' style='width: 200px' :props='props'>{{ props.row.tripEndDate }}</q-td>
                    <q-td key='fishery' style='width: 200px' :props='props'>{{ props.row.fishery }}</q-td>
                    <q-td key='departurePort' style='width: 200px' :props='props'>{{ props.row.departurePort }}</q-td>
                    <q-td key='observerName' style='width: 200px' :props='props'>{{ props.row.observerName }}</q-td>
                    <q-td key='observerPhone' style='width: 200px' :props='props'>{{ formatTel(props.row.observerPhone) || 'N/A'}}</q-td>
                    <q-td key='selectionStatus' :props='props'>{{ props.row.selectionStatus }}</q-td>
                </q-tr>
                </template>
                </q-table>
            </q-card-section>
        </q-card>
    </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TripState, VesselState, UserState, ObserverAssignmentState } from '../_store/types/types';
import moment from 'moment';

@Component
export default class ObserverAssignment extends Vue {
    @State('trip') private trip!: TripState;
    @State('vessel') private vessel!: VesselState;
    @State('user') private user!: UserState;
    @State('oa') private oa!: ObserverAssignmentState;

private unassignedPagination = {rowsPerPage: 10};
private assignedPagination = {rowsPerPage: 0};

private columns = [
    {name: 'vesselName', label: 'Vessel Name', field: 'vesselName',
    required: true, align: 'left', sortable: true},
    {name: 'captain', label: 'Captain', field: 'captain',
    required: true, align: 'left', sortable: true},
    {name: 'captainPhone', label: 'Captain Phone #', field: 'captainPhone',
    required: true, align: 'left'},
    {name: 'tripStartDate', label: 'Start Date', field: 'tripStartDate',
    required: true, align: 'left', sortable: true},
    {name: 'tripEndDate', label: 'End Date', field: 'tripEndDate',
    required: true, align: 'left', sortable: true},
    {name: 'fishery', label: 'Fishery', field: 'fishery',
    required: true, align: 'left', sortable: true},
    {name: 'departurePort', label: 'Departure Port', field: 'departurePort',
    required: true, align: 'left', sortable: true},
    {name: 'observerName', label: 'Observer', field: 'observerName',
    required: true, align: 'left', sortable: true},
    {name: 'observerPhone', label: 'Observer Phone #', field: 'observerPhone',
    required: true, align: 'left', sortable: true},
    {name: 'selectionStatus', label: 'Selection Status', field: 'selectionStatus',
    required: true, align: 'left', sortable: true},
];

private get assignedTrips() {
    return this.trips.filter(
        (trip) => {
          if (trip.observerName) {
            return trip;
          }
        }
        );
}

private get unassignedTrips() {
    return this.trips.filter(
        (trip) => {
          if (!trip.observerName) {
            return trip;
          }
        }
        );
}

private trips =  [
    {
        vesselName: 'Excalibur',
        captain: 'Todd Hay',
        captainPhone: 2225551212,
        tripStartDate: moment().format('MM/DD/YYYY'),
        tripEndDate: moment().format('MM/DD/YYYY'),
        fishery: 'EM EFP',
        departurePort: 'Newport',
        observerName: 'Will Smith',
        observerPhone: 2225551212,
        selectionStatus: 'Selected'
    },
    {
        vesselName: 'Raven',
        captain: 'Seth Gerou',
        captainPhone: 2225551212,
        tripStartDate: moment().format('MM/DD/YYYY'),
        tripEndDate: moment().format('MM/DD/YYYY'),
        fishery: 'EM EFP',
        departurePort: 'Newport',
        observerName: null,
        observerPhone: null,
        selectionStatus: 'Selected'
    },
    {
        vesselName: 'Last Straw',
        captain: 'Melina Shak',
        captainPhone: 2225551212,
        tripStartDate: moment().format('MM/DD/YYYY'),
        tripEndDate: moment().format('MM/DD/YYYY'),
        fishery: 'EM EFP',
        departurePort: 'Newport',
        observerName: 'Nick Schaffer',
        observerPhone: 2225551212,
        selectionStatus: 'Selected'
    },
];

private ObserverAssignmentDetail(row: any) {
    console.log(row);
    this.oa.activeTrip = row;
    this.$router.push({path: '/observer-assignment-detail/' + this.trips.indexOf(row)});
}

private formatTel(telNum: any) {
    telNum = telNum.toString();
    return '(' + telNum.substring(0, 3) + ') ' + telNum.substring(3, 6) + '-' + telNum.substring(6, 10);
}

}
</script>