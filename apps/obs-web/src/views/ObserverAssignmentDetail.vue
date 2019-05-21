<template>
    <div>
        <q-card>
            <q-card-section>
                <q-card class="bg-blue-grey-1">
                    <q-card-section>
                        <div class="text-h6 text-primary">{{ oa.activeTrip.vessel.vesselName }} - {{ oa.activeTrip.fishery.name }} - {{ oa.activeTrip.departurePort.name }} </div>
                        <sup v-if="oa.activeTrip.vessel.captain" class="text-primary">Skipper: {{ oa.activeTrip.vessel.captain.name }}</sup>
                        <div class="row items-start">
                        <div class="text-subtitle2 q-pa-md">
                            Depart: {{ formatDate(oa.activeTrip.departureDate) }}
                        </div>
                        <div class="text-subtitle2 q-pa-md">
                            Return: {{ formatDate(oa.activeTrip.returnDate) }}
                        </div>
                        </div>

                        <div class="text-subtitle2">
                            Assigned Observer:
                                <span v-if="oa.activeTrip.observer" class="text-white bg-primary q-pa-sm" style="border-radius: 10px">
                                    {{ oa.activeTrip.observer.firstName }} {{ oa.activeTrip.observer.lastName }}
                                </span>

                            <span v-else class="text-white bg-red q-pa-sm" style="border-radius: 10px">
                                No Observer Assigned
                            </span>
                        </div>

                    </q-card-section>
                    <q-card-actions v-if="!observerAssigned">
                        <q-btn label="Cancel" color="red" icon="warning" to="/observer-assignment" exact />
                        <q-btn label="Assign Observer" color="primary" @click="updateTrip" :disabled="!oa.activeTrip.observer"/>
                    </q-card-actions>
                    <q-card-actions v-else>
                        <q-btn label="Re-assign Trip" color="primary" icon="fa fa-redo-alt" @click="observerAssigned = false"/>
                    </q-card-actions>
                </q-card>
            </q-card-section>
            <q-card-section>
                        <q-table
                        :data="observers"
                        :columns="columns"
                        dense
                        row-key="id"
                        selection="single"
                        :pagination.sync="pagination"
                        title="Port Group Observer Availability"
                        hide-bottom
                        class="bg-blue-grey-1"
                        >
                        <template v-slot:body="props">
                            <q-tr :props="props" @click.native="setObserver(props.row)">
                            <q-td key="id"></q-td>
                            <q-td key="observerName" :props="props">{{ props.row.firstName }} {{ props.row.lastName }}</q-td>
                            <q-td key="observerPhone" :props="props">{{ formatTel(props.row.cellPhone) }}</q-td>
                            <q-td key="status" :props="props">{{ getStatus(props.row) }}</q-td>
                            <q-td key="lastScheduledDate" :props="props"> {{ formatDate(props.row.lastScheduledDate) }}</q-td>
                            <q-td key="nextScheduledDate" :props="props">{{ formatDate(props.row.nextScheduledDate) }}</q-td>
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

import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';

@Component
export default class ObserverAssignment extends Vue {
    @State('trip') private trip!: TripState;
    @State('vessel') private vessel!: VesselState;
    @State('user') private user!: UserState;
    @State('oa') private oa!: ObserverAssignmentState;

    @Action('clear', { namespace: 'alert' }) private clear: any;
    @Action('error', { namespace: 'alert' }) private error: any;

private pagination = {rowsPerPage: 0};
private alert = false;
private selectedObserver: string = '';
private observerAssigned: boolean = false;
private trips: any = {};
private activities: any[] = [];

private observers: any[] = [];

private get getObserverNames() {
    return this.observers.map((observer) => observer.firstName + ' ' + observer.lastName );
    }

// private observerAvailability = [
//     {observerName: 'Seth Gerou', status: 'Available For Dates',
//     observerPhone: 2125551212, lastScheduledDate: '2019/03/04',
//     nextScheduledDate: '2019/05/25'},
//     {observerName: 'Will Smith', status: 'Available For Dates',
//     observerPhone: 2125551212, lastScheduledDate: '2019/04/04',
//     nextScheduledDate: '2019/05/15'},
//     {observerName: 'Nick Schaffer', status: 'Available For Dates',
//     observerPhone: 2125551212, lastScheduledDate: '2019/04/12',
//     nextScheduledDate: '2019/05/10'},
//     {observerName: 'Melina Shak', status: 'Not Available For Dates',
//     observerPhone: 2125551212, lastScheduledDate: '2019/05/01',
//     nextScheduledDate: '2019/06/14'},
// ];

private columns = [
        {name: 'observerName', label: 'Observer', field: 'observer', required: true,
        align: 'left', sortable: true },
        {name: 'observerPhone', label: 'Phone #', field: 'observer', required: true,
        align: 'left', sortable: true },
        {name: 'status', label: 'Status', field: 'status', required: true, align: 'left', sortable: true },
        {name: 'lastScheduledDate', label: 'Last Scheduled', field: 'lastScheduledDate', required: true,
        align: 'left', sortable: true },
        {name: 'nextScheduledDate', label: 'Next Scheduled', field: 'nextScheduledDate', required: true,
        align: 'left', sortable: true },
];

private setObserver(row: any) {
    if (!this.observerAssigned) {
        if (row.status === 'Available For Dates') {
            // this.oa.activeTrip.observer = row;
            Vue.set(this.oa.activeTrip, 'observer', row);
        } else {
            this.selectedObserver = row.firstName + ' ' + row.lastName;
            this.alert = true;
        }
    }
}

private formatTel(telNum: any) {
    telNum = telNum.toString();
    return '(' + telNum.substring(0, 3) + ') ' + telNum.substring(3, 6) + '-' + telNum.substring(6, 10);
}

private formatDate(date: any) {
    if (date) {
        return moment(date).format('MMM Do, YYYY');
    } else {
        return ''
    }
}

private async updateTrip() {
    try {
        delete this.oa.activeTrip.observer.status;
        delete this.oa.activeTrip.observer.lastScheduledDate;
        delete this.oa.activeTrip.observer.nextScheduledDate;
        delete this.oa.activeTrip.__index;
        delete this.oa.activeTrip.observer.__index;

        this.oa.activeTrip.updatedBy = authService.getCurrentUser()!.username;
        this.oa.activeTrip.updatedDate = moment().format();
        const masterDB: Client<any> = couchService.masterDB;

        masterDB.put(this.oa.activeTrip._id, this.oa.activeTrip, this.oa.activeTrip._rev).then( () => {
            this.$router.push({path: '/observer-assignment'});
        });
        // pouchService.db.put(pouchService.userDBName, this.oa.activeTrip);
    } catch (err) {
        console.log(err);
    }

}

private async getObservers() {
        const masterDB: Client<any> = couchService.masterDB;
        const queryOptions: ListOptions = {
          start_key: '',
          inclusive_end: true,
          descending: false
        };

        try {
            const observers = await masterDB.viewWithDocs<any>(
                'sethtest',
                'all_observers',
                queryOptions
                );

            this.observers = observers.rows.map( (user) => user.doc );

            for (const observer of this.observers) {
                this.getObserverTrips(observer);
                this.getObserverActivities(observer);
            }
    } catch (err) {
        this.error(err);
        }
    }

private getStatus(row: any) {

    let available = true;

    if (row.trips) {
        for (const trip of row.trips) {
            if (
                moment(trip.departureDate) <= moment(this.oa.activeTrip.returnDate) && moment(this.oa.activeTrip.departureDate) <= moment(trip.returnDate)
            ) { available = false; }

            if (
                moment(trip.returnDate) <= moment(this.oa.activeTrip.returnDate)
                && moment(trip.returnDate) > moment(row.lastScheduledDate)
            ) { row.lastScheduledDate = trip.returnDate }

            if (row.nextScheduledDate) {
                if (
                    moment(trip.departureDate) >= moment(this.oa.activeTrip.returnDate)
                    && moment(trip.departureDate) < moment(row.nextScheduledDate)
                ) { row.nextScheduledDate = trip.departureDate }
            } else {
                if (
                    moment(trip.departureDate) >= moment(this.oa.activeTrip.returnDate)
                ) { row.nextScheduledDate = trip.departureDate }
            }
        }
    }

    if (row.activities) {
        for (const activity of row.activities) {
            if (
                moment(activity.startDate) <= moment(this.oa.activeTrip.returnDate) && moment(this.oa.activeTrip.departureDate) <= moment(activity.endDate)
            ) { available = false; }

            if (
                moment(activity.endDate) <= moment(this.oa.activeTrip.returnDate)
                && moment(activity.endDate) > moment(row.lastScheduledDate)
            ) { row.lastScheduledDate = activity.endDate }

            if (row.nextScheduledDate) {
                if (
                    moment(activity.startDate) >= moment(this.oa.activeTrip.returnDate)
                    && moment(activity.startDate) < moment(row.nextScheduledDate)
                ) { row.nextScheduledDate = activity.startDate }
            } else {
                if (
                    moment(activity.startDate) >= moment(this.oa.activeTrip.returnDate)
                ) { row.nextScheduledDate = activity.startDate }
            }
        }
    }

    if (available === true) {
        Vue.set(row, 'status', 'Available For Dates');
        return 'Available For Dates';
    } else {
        Vue.set(row, 'status', 'Un-available');
        return 'Un-available';
        }
}

private async getObserverTrips(observer: any) {
        const masterDB: Client<any> = couchService.masterDB;
        const queryOptions: ListOptions = {
          start_key: '',
          inclusive_end: true,
          descending: false
        };

        try {
            const trips = await masterDB.viewWithDocs<any>(
                'sethtest',
                'all_observed_trips',
                {key: observer.userName}
                );

                Vue.set(observer, 'trips' , trips.rows.map( (trip) => trip.doc ));

        } catch (err) {
            this.error(err);
        }
}

private async getObserverActivities(observer: any) {
        const masterDB: Client<any> = couchService.masterDB;
        const queryOptions: ListOptions = {
          start_key: '',
          inclusive_end: true,
          descending: false
        };

        try {
            const activities = await masterDB.viewWithDocs<any>(
                'sethtest',
                'all_observer_activities',
                {key: observer.userName}
                );

            Vue.set(observer, 'activities' , activities.rows.map( (activity) => activity.doc ));
        } catch (err) {
            this.error(err);
        }
}

private created() {
    this.getObservers();
    if (this.oa.activeTrip.observer) {
        this.observerAssigned = true;
    }
}

}
</script>
