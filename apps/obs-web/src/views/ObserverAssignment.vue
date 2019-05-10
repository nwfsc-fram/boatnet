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
                    <q-td key='vessel' style='width: 200px; white-space: normal !important;' :props='props' >{{ props.row.vessel.vesselName }}</q-td>
                    <q-td key='captain' style='width: 100px' :props='props'>{{ getCaptainName(props.row) }}</q-td>
                    <q-td key='captainPhone' style='width: 100px' :props='props'>{{ getCaptainPhone(props.row) }}</q-td>
                    <q-td key='departureDate' style='width: 200px' :props='props'>{{ formatDate(props.row.departureDate) }}</q-td>
                    <q-td key='returnDate' style='width: 200px' :props='props'>{{ formatDate(props.row.returnDate) }}</q-td>
                    <q-td key='fishery' style='width: 200px' :props='props'>{{ props.row.fishery.name }}</q-td>
                    <q-td key='departurePort' style='width: 200px' :props='props'>{{ props.row.departurePort.name }}</q-td>
                    <q-td key='observerName' style='width: 200px' :props='props'>{{ getObserverName(props.row) }}</q-td>
                    <q-td key='observerPhone' style='width: 200px' :props='props'>{{ getObserverPhone(props.row) }}</q-td>
                    <q-td key='isSelected' :props='props'>{{ getStatus(props.row) }}</q-td>
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
                    <q-td key='vessel' style='width: 200px; white-space: normal !important;' :props='props' >{{ props.row.vessel.vesselName }}</q-td>
                    <q-td key='captain' style='width: 100px' :props='props'>{{ getCaptainName(props.row) }}</q-td>
                    <q-td key='captainPhone' style='width: 100px' :props='props'>{{ getCaptainPhone(props.row) }}</q-td>
                    <q-td key='departureDate' style='width: 200px' :props='props'>{{ formatDate(props.row.departureDate) }}</q-td>
                    <q-td key='returnDate' style='width: 200px' :props='props'>{{ formatDate(props.row.returnDate) }}</q-td>
                    <q-td key='fishery' style='width: 200px' :props='props'>{{ props.row.fishery.name }}</q-td>
                    <q-td key='departurePort' style='width: 200px' :props='props'>{{ props.row.departurePort.name }}</q-td>
                    <q-td key='observerName' style='width: 200px' :props='props'>{{ getObserverName(props.row) }}</q-td>
                    <q-td key='observerPhone' style='width: 200px' :props='props'>{{ getObserverPhone(props.row) }}</q-td>
                    <q-td key='isSelected' :props='props'>{{ getStatus(props.row) }}</q-td>
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

import { Client, CouchDoc, ListOptions } from 'davenport';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';

@Component
export default class ObserverAssignment extends Vue {
    @State('trip') private trip!: TripState;
    @State('vessel') private vessel!: VesselState;
    @State('user') private user!: UserState;
    @State('oa') private oa!: ObserverAssignmentState;

    @Action('clear', { namespace: 'alert' }) private clear: any;
    @Action('error', { namespace: 'alert' }) private error: any;

private unassignedPagination = {rowsPerPage: 10};
private assignedPagination = {rowsPerPage: 0};
private trips: any[] = [];

private columns = [
    {name: 'vessel', label: 'Vessel Name', field: 'vessel',
    required: true, align: 'left', sortable: true},
    {name: 'captain', label: 'Captain', field: 'vessel',
    required: true, align: 'left', sortable: true},
    {name: 'captainPhone', label: 'Captain Phone #', field: 'vessel',
    required: true, align: 'left'},
    {name: 'departureDate', label: 'Start Date', field: 'departureDate',
    required: true, align: 'left', sortable: true},
    {name: 'returnDate', label: 'End Date', field: 'returnDate',
    required: true, align: 'left', sortable: true},
    {name: 'fishery', label: 'Fishery', field: 'fishery',
    required: true, align: 'left', sortable: true},
    {name: 'departurePort', label: 'Departure Port', field: 'departurePort',
    required: true, align: 'left', sortable: true},
    {name: 'observerName', label: 'Observer', field: 'observer',
    required: true, align: 'left', sortable: true},
    {name: 'observerPhone', label: 'Observer Phone #', field: 'observer',
    required: true, align: 'left', sortable: true},
    {name: 'isSelected', label: 'Selection Status', field: 'isSelected',
    required: true, align: 'left', sortable: true},
];

private get assignedTrips() {
    return this.trips.filter(
        (trip) => {
          if (trip.observer) {
            return trip;
          }
        }
        );
}

private get unassignedTrips() {
    return this.trips.filter(
        (trip) => {
          if (!trip.observer) {
            return trip;
          }
        }
        );
}

// private trips =  [
//     {
//         vesselName: 'Excalibur',
//         captain: 'Todd Hay',
//         captainPhone: 2225551212,
//         tripStartDate: moment().format('MM/DD/YYYY'),
//         tripEndDate: moment().add(5, 'days').format('MM/DD/YYYY'),
//         fishery: 'EM EFP',
//         departurePort: 'Newport',
//         observerName: 'Will Smith',
//         observerPhone: 2225551212,
//         selectionStatus: 'Selected'
//     },
//     {
//         vesselName: 'Raven',
//         captain: 'Seth Gerou',
//         captainPhone: 2225551212,
//         tripStartDate: moment().format('MM/DD/YYYY'),
//         tripEndDate: moment().add(5, 'days').format('MM/DD/YYYY'),
//         fishery: 'EM EFP',
//         departurePort: 'Newport',
//         observerName: null,
//         observerPhone: null,
//         selectionStatus: 'Selected'
//     },
//     {
//         vesselName: 'Timmy Boy',
//         captain: 'Scott Leach',
//         captainPhone: 2225551212,
//         tripStartDate: moment().format('MM/DD/YYYY'),
//         tripEndDate: moment().add(5, 'days').format('MM/DD/YYYY'),
//         fishery: 'EM EFP',
//         departurePort: 'Newport',
//         observerName: null,
//         observerPhone: null,
//         selectionStatus: 'Selected'
//     },
//     {
//         vesselName: 'FishWish',
//         captain: 'John LaFargue',
//         captainPhone: 2225551212,
//         tripStartDate: moment().format('MM/DD/YYYY'),
//         tripEndDate: moment().add(5, 'days').format('MM/DD/YYYY'),
//         fishery: 'EM EFP',
//         departurePort: 'Newport',
//         observerName: null,
//         observerPhone: null,
//         selectionStatus: 'Selected'
//     },
//     {
//         vesselName: 'Last Straw',
//         captain: 'Melina Shak',
//         captainPhone: 2225551212,
//         tripStartDate: moment().format('MM/DD/YYYY'),
//         tripEndDate: moment().add(5, 'days').format('MM/DD/YYYY'),
//         fishery: 'EM EFP',
//         departurePort: 'Newport',
//         observerName: 'Nick Schaffer',
//         observerPhone: 2225551212,
//         selectionStatus: 'Selected'
//     },
// ];

private async getEMEFPTrips() {
    const masterDB: Client<any> = couchService.masterDB;
    try {

        const emefpTrips = await masterDB.view<any>(
            'sethtest',
            'em-efp-trips',
            );

        for (const row of emefpTrips.rows) {
            const trip = row.value;
            this.trips.push(trip);
        }

    } catch (err) {
        this.error(err);
    }
  }

private ObserverAssignmentDetail(row: any) {
    this.oa.activeTrip = row;
    this.$router.push({path: '/observer-assignment-detail/' + this.trips.indexOf(row)});
}

private formatTel(telNum: any) {
    if (telNum.length === 10) {
        telNum = telNum.toString();
        return '(' + telNum.substring(0, 3) + ') ' + telNum.substring(3, 6) + '-' + telNum.substring(6, 10);
    } else {
        return '';
    }
}

private formatDate(date: any) {
    return moment(date).format('MMM Do, YYYY');
}

private getCaptainName(row: any) {
    if (row.vessel.captain) {
        return row.vessel.captain.name;
    } else {
        return '';
    }
}

private getCaptainPhone(row: any) {
    if (row.vessel.captain) {
        return this.formatTel(row.vessel.captain.phone);
    } else {
        return '';
    }
}

private getObserverName(row: any) {
    if (row.observer) {
        return row.observer.firstName + row.observer.lastName;
    } else {
        return '';
    }
}

private getObserverPhone(row: any) {
    if (row.observer) {
        return this.formatTel(row.observer.cellPhone);
    } else {
        return '';
    }
}

private getStatus(row: any) {
    if (row.isSelected) {
        return 'Selected';
    } else {
        return 'Not Selected';
    }
}

private created() {
    this.getEMEFPTrips();
}

}
</script>