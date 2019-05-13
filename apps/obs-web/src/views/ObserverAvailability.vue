<template>
    <div>
        <q-card>
            <q-card-section>

                <div class="q-pa-md">
                    <q-btn
                    label='New Activity'
                    color='primary'
                    to="/new-activity"
                    exact
                    />
                </div>

                <q-table
                title='My Activities'
                :data='activities'
                :columns='columns'
                dense
                row-key='_id'
                :pagination.sync = 'pagination'
                hide-bottom
                class="bg-blue-grey-1"
                ></q-table>

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

private pagination = {rowsPerPage: 0};
private alert = false;
private newActivity = {};

private columns = [
    {name: 'startDate', label: 'Start Date', field: 'startDate', required: false, align: 'left', sortable: true},
    {name: 'endDate', label: ',End Date', field: 'endDate', required: false, align: 'left', sortable: true},
    {name: 'activityType', label: 'Type', field: 'activityType', required: false, align: 'left', sortable: true},
    {name: 'activityDescription', label: 'Activity Description',
    field: 'activityDescription', required: false, align: 'left', sortable: true}
];

private activities = [
    {
        startDate: moment().add(Math.random() * 10, 'days').format('MM/DD/YYYY'),
        endDate: moment().add(Math.random() * 10 + 10, 'days').format('MM/DD/YYYY'),
        activityType: 'Trip',
        activityDescription: 'Excalibur - EM EFP'
    },
    {
        startDate: moment().add(Math.random() * 10, 'days').format('MM/DD/YYYY'),
        endDate: moment().add(Math.random() * 10 + 10, 'days').format('MM/DD/YYYY'),
        activityType: 'Trip',
        activityDescription: 'Excalibur - EM EFP'
    },
    {
        startDate: moment().add(Math.random() * 10, 'days').format('MM/DD/YYYY'),
        endDate: moment().add(Math.random() * 10 + 10, 'days').format('MM/DD/YYYY'),
        activityType: 'Training',
        activityDescription: 'Required Safety Training'
    },
    {
        startDate: moment().add(Math.random() * 10, 'days').format('MM/DD/YYYY'),
        endDate: moment().add(Math.random() * 10 + 10, 'days').format('MM/DD/YYYY'),
        activityType: 'Vacation',
        activityDescription: 'R&R in Montana'
    },
    {
        startDate: moment().add(Math.random() * 10, 'days').format('MM/DD/YYYY'),
        endDate: moment().add(Math.random() * 10 + 10, 'days').format('MM/DD/YYYY'),
        activityType: 'Trip',
        activityDescription: 'Last Straw - EM EFP'
    },
    ];

}
</script>