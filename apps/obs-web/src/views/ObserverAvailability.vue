<template>
    <div>
        <q-card>
            <q-card-section>

                <div class="q-pa-md">
                    <q-btn
                    label='New Activity'
                    color='primary'
                    @click="newActivity"
                    />
                </div>

                <q-table
                title='My Activities'
                :data='allActivities'
                :columns='columns'
                dense
                row-key='_id'
                :pagination.sync = 'pagination'
                hide-bottom
                class="bg-blue-grey-1"
                >
                <template v-slot:body="props">
                    <q-tr :props="props" @click.native="editActivity(props.row)" @contextmenu.native="deleteActivity($event, props.row)">
                        <q-td key="startDate" :props="props">{{ formatDate(props.row.startDate) }}</q-td>
                        <q-td key="endDate" :props="props">{{ formatDate(props.row.endDate) }}</q-td>
                        <q-td key="activityType" :props="props">{{ props.row.activityType }}</q-td>
                        <q-td key="activityDescription" :props="props">{{ props.row.activityDescription }}</q-td>
                        <q-td key="status" :props="props">{{ props.row.status }}</q-td>
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
import { TripState, VesselState, UserState, ObserverAssignmentState, ObserverAvailabilityState } from '../_store/types/types';
import moment from 'moment';

import { ObserverActivityTypeName } from '@boatnet/bn-models';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { AuthState, authService, CouchDBInfo } from '@boatnet/bn-auth';

@Component({
  pouch: {
    userActivities() { // Also declared in class
      return {
        database: pouchService.userDBName,
        selector: { type: 'observer-activity' },
        sort: [{ startDate: 'desc' }]
        // limit: 5 // this.resultsPerPage,
      };
    },
    userTrips() { // Also declared in class
      return {
        database: pouchService.userDBName,
        selector: { type: 'wcgop-trip' },
        sort: [{ tripNum: 'desc' }]
        // limit: 5 // this.resultsPerPage,
      };
    }
  }
})
export default class ObserverAssignment extends Vue {
    @State('trip') private trip!: TripState;
    @State('vessel') private vessel!: VesselState;
    @State('user') private user!: UserState;
    @State('oa') private oa!: ObserverAssignmentState;
    @State('obact') private obact!: ObserverAvailabilityState;

    @State('pouchState') private pouchState!: PouchDBState;

    @Action('clear', { namespace: 'alert' }) private clear: any;
    @Action('error', { namespace: 'alert' }) private error: any;

    private pagination = {rowsPerPage: 0};
    private alert = false;

    private userActivities!: any;
    private userTrips!: any;

    public get userDBActivities() {
        // TODO: This seems to block the UI - handle asyn
        if (this.userActivities) {
        return this.userActivities;
        } else {
        return [];
        }
    }
  public get userDBTrips() {
    // TODO: This seems to block the UI - handle asyn
    // console.log('Called userDBTrips');
    if (this.userTrips) {
      return this.userTrips;
    } else {
      return [];
    }
  }

  public get allActivities() {
      if (this.userActivities && this.userTrips) {
          const allActivities = [];
          for (const activity of this.userActivities) {
              if (moment(activity.endDate) > moment()) {
                  allActivities.push(activity);
              }
          }
          for (const trip of this.userTrips) {
              if (moment(trip.returnDate) > moment()) {
                  allActivities.push({
                      startDate: trip.departureDate,
                  endDate: trip.returnDate,
                  activityType: 'Trip',
                  activityDescription: trip.vessel.vesselName + ' - ' + trip.fishery.name,
                  status: trip.tripStatus.description
                });
            }
          }

          return allActivities.sort((a, b) => (a.startDate > b.startDate) ? 1 : -1);

      } else {
          return [];
      }
  }

    private get currentReadonlyDB(): string {
        if (!this.pouchState.credentials) {
        console.warn('WARNING: current RO db is undefined');
        return '';
        } else {
        return this.pouchState.credentials.dbInfo.lookupsDB;
        }
    }

    private get currentUserDB(): string {
        if (!this.pouchState.credentials) {
        console.warn('WARNING: current User db is undefined');
        return '';
        } else {
        return this.pouchState.credentials.dbInfo.userDB;
        }
    }

    private get lookupsDB() {
        // @ts-ignore
        return this[this.selectedDBName];
    }

    private columns = [
        {name: 'startDate', label: 'Start Date', field: 'startDate', required: false, align: 'left', sortable: true},
        {name: 'endDate', label: 'End Date', field: 'endDate', required: false, align: 'left', sortable: true},
        {name: 'activityType', label: 'Type', field: 'activityType', required: false, align: 'left', sortable: true},
        {name: 'activityDescription', label: 'Description',
        field: 'activityDescription', required: false, align: 'left', sortable: true},
        {name: 'status', label: 'Status',
        field: 'status', required: false, align: 'left', sortable: true}
    ];

    private formatDate(date: string) {
        return moment(date).format('MMM DD, YYYY');
    }

    private newActivity() {
        const newActivity = {
            type: ObserverActivityTypeName,
            createdBy: authService.getCurrentUser()!.username,
            createdDate: moment().format(),
            };
        this.obact.activeActivity = newActivity;
        this.obact.isNewActivity = true;
        this.$router.push({path: '/activity-detail'});
    }

    private editActivity(row: any) {
        if (row.activityType !== 'Trip') {
            this.obact.activeActivity = row;
            this.obact.isNewActivity = false;
            this.$router.push({path: '/activity-detail'});
        } else {
            alert('Trips are not editabe from this page.');
        }
    }

    private deleteActivity($event: any, row: any) {
        $event.preventDefault();
        if (row.activityType !== 'Trip') {
            console.log("To Do: implement delete activity on right click / long click.");
        }
    }

}
</script>