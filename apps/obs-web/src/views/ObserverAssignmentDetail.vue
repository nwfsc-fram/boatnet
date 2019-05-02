<template>
    <div>
        <q-card>
            <q-card-section>
                <q-card>
                    <q-card-section>
                        <div class="text-h6">{{ oa.activeTrip.vesselName }} - {{ oa.activeTrip.fishery }}</div>
                        <sup class="text-primary">Skipper: {{ oa.activeTrip.captain }}</sup>
                        <p><strong>Trip Departing: {{ oa.activeTrip.departurePort }} on {{ oa.activeTrip.tripStartDate }} - Returning: {{ oa.activeTrip.tripEndDate }} </strong></p>

                        <q-select
                        v-model="oa.activeTrip.observerName"
                        :options="getObserverNames"
                        label="Observer"
                        dense
                        />
                    </q-card-section>
                    <q-card-actions>
                        <q-btn label="Cancel" color="red" icon="warning" to="/observer-assignment" exact/>
                        <q-btn label="Assign Observer" color="primary" to="/observer-assignment" exact/>
                    </q-card-actions>
                </q-card>
            </q-card-section>
            <q-card-section>
                        <q-table
                        :data="observerAvailability"
                        :columns="columns"
                        dense
                        row-key="id"
                        selection="single"
                        :pagination.sync="pagination"
                        title="Port Group Observer Availability"
                        hide-bottom
                        >
                        <template v-slot:body="props">
                            <q-tr :props="props" @click.native="setObserver(props.row)">
                            <q-td key="id"></q-td>
                            <q-td key="observerName" :props="props">{{ props.row.observerName }}</q-td>
                            <q-td key="observerPhone" :props="props">{{ formatTel(props.row.observerPhone) }}</q-td>
                            <q-td key="status" :props="props">{{ props.row.status }}</q-td>
                            <q-td key="lastScheduledDate" :props="props">{{ props.row.lastScheduledDate }}</q-td>
                            <q-td key="nextScheduledDate" :props="props">{{ props.row.nextScheduledDate }}</q-td>
                            </q-tr>
                            </template>
                        </q-table>
            </q-card-section>
        </q-card>

                <q-dialog v-model="alert">
                <q-card>
                    <q-card-section>
                    <div class="text-h6">{{ selectedObserver }} is not available for this date range, please make a different selection.</div>
                    <q-btn color="primary" size="md" style="float: right" @click="alert = false">OK</q-btn>
                    <br><br>
                    </q-card-section>
                </q-card>
                </q-dialog>
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
private selectedObserver: string = '';

private observers = [
    {observerName: 'Seth Gerou'},
    {observerName: 'Will Smith'},
    {observerName: 'Nick Schaffer'},
    {observerName: 'Melina Shak'}
];

private get getObserverNames() {
    return this.observers.map((observer) => observer.observerName );
    }

private observerAvailability = [
    {observerName: 'Seth Gerou', status: 'Available For Dates',
    observerPhone: 2125551212, lastScheduledDate: '2019/03/04',
    nextScheduledDate: '2019/05/25'},
    {observerName: 'Will Smith', status: 'Available For Dates',
    observerPhone: 2125551212, lastScheduledDate: '2019/04/04',
    nextScheduledDate: '2019/05/15'},
    {observerName: 'Nick Schaffer', status: 'Available For Dates',
    observerPhone: 2125551212, lastScheduledDate: '2019/04/12',
    nextScheduledDate: '2019/05/10'},
    {observerName: 'Melina Shak', status: 'Not Available For Dates',
    observerPhone: 2125551212, lastScheduledDate: '2019/05/01',
    nextScheduledDate: '2019/06/14'},
];

private columns = [
        {name: 'observerName', label: 'Observer', field: 'observerName', required: true,
        align: 'left', sortable: true },
        {name: 'observerPhone', label: 'Phone #', field: 'observerPhone', required: true,
        align: 'left', sortable: true },
        {name: 'status', label: 'Status', field: 'status', required: true, align: 'left', sortable: true },
        {name: 'lastScheduledDate', label: 'Last Scheduled', field: 'lastScheduledDate', required: true,
        align: 'left', sortable: true },
        {name: 'nextScheduledDate', label: 'Next Scheduled', field: 'nextScheduledDate', required: true,
        align: 'left', sortable: true },
];

private setObserver(row: any) {
    if (row.status === 'Available For Dates') {
        this.oa.activeTrip.observerName = row.observerName;
    } else {
        this.selectedObserver = row.observerName;
        this.alert = true;
    }
}

private formatTel(telNum: any) {
    telNum = telNum.toString();
    return '(' + telNum.substring(0, 3) + ') ' + telNum.substring(3, 6) + '-' + telNum.substring(6, 10);
}

}
</script>