<template>
    <div>
        <q-card>
            <q-card-section>
                <q-table
                title='Unassigned Trips'
                :data='unassignedTrips'
                :columns='columns'
                dense
                row-key='_id'
                :pagination.sync='unassignedPagination'
                >
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
import { TripState, VesselState, UserState } from '../_store/types/types';
import moment from 'moment';

@Component
export default class ObserverAssignment extends Vue {
    @State('trip') private trip!: TripState;
    @State('vessel') private vessel!: VesselState;
    @State('user') private user!: UserState;

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
        tripStartDate: moment().format('MM/DD/YYYYY'),
        tripEndDate: moment().format('MM/DD/YYYYY'),
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
        tripStartDate: moment().format('MM/DD/YYYYY'),
        tripEndDate: moment().format('MM/DD/YYYYY'),
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
        tripStartDate: moment().format('MM/DD/YYYYY'),
        tripEndDate: moment().format('MM/DD/YYYYY'),
        fishery: 'EM EFP',
        departurePort: 'Newport',
        observerName: 'Nick Schaffer',
        observerPhone: 2225551212,
        selectionStatus: 'Selected'
    },
];

}
</script>