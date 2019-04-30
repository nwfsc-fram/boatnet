<template>
    <div>
        <q-table
        title='Unassigned Trips'
        :data='unassignedTrips'
        :columns='columns'
        dense
        row-key='_id'
        :pagination.sync='pagination'
        hide-bottom
        ></q-table>

        <q-table
        title='Assigned Trips'
        :data='unassignedTrips'
        :columns='columns'
        dense
        row-key='_id'
        :pagination.sync='pagination'
        hide-bottom
        ></q-table>
    </div>
</template>

<script lang="ts">

import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TripState, VesselState, UserState } from '../_store/types/types';

@Component
export default class Trips extends Vue {
    @State('trip') private trip!: TripState;
    @State('vessel') private vessel!: VesselState;
    @State('user') private user!: UserState;

private get unassignedTrips() {
    return this.trip.trips;
}

private columns = [
    {name: 'vesselName', label: 'Vessel Name', field: 'vesselName', required: true, align: 'left', sortable: true},
    {name: 'captain', label: 'Captain', field: 'captain', required: true, align: 'left', sortable: true},
    {name: 'fishery', label: 'Fishery', field: 'fishery', required: true, align: 'left', sortable: true},
    {name: 'startPort', label: 'Vessel Name', field: 'vesselName', required: true, align: 'left', sortable: true},
    {name: 'startDate', label: 'Vessel Name', field: 'vesselName', required: true, align: 'left', sortable: true},
    {name: 'endPort', label: 'Vessel Name', field: 'vesselName', required: true, align: 'left', sortable: true},
    {name: 'endDate', label: 'Vessel Name', field: 'vesselName', required: true, align: 'left', sortable: true},
];


}
</script>