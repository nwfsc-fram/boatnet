<template>
    <div class="q-pa-md q-gutter-md relative-position" style="min-height: 200px">

        <q-inner-loading :showing="transferring">
            <q-spinner-radio color="primary" size="3em"/>
        </q-inner-loading>
    <p>LATEST 2</p>
        <q-table
        v-if="!transferring"
        :data="activeTasks"
        :columns="columns"
        dense
        row-key="id"
        selection="single"
        :selected.sync="selected"
        :pagination.sync="pagination"
        binary-state-sort
        hide-bottom
        >
        <template v-slot:body="props">
            <q-tr :props="props">
                <q-td key="_id"></q-td>
                <q-td key="tripNum" :props="props">{{ getAttribute(props.row.tripNum) }}</q-td>
                <q-td key="vesselName" :props="props">{{ getAttribute(props.row.vessel.vesselName) }}</q-td>
                <q-td key="vesselId" :props="props" >{{ getVesselId(props.row) }}</q-td>
                <q-td key="returnDate" :props="props" >{{ getAttribute(props.row.returnDate, 'date') }}</q-td>
                <q-td key="stage" :props="props" >{{ getAttribute(props.row.stage) }}</q-td>
                <q-td key="errors" :props="props" >{{ getAttribute(props.row.errors, 'errors') }}</q-td>
                <q-td key="status" :props="props" >{{ getAttribute(props.row.status) }}</q-td>
                <q-td key="statusDate" :props="props" >{{ getAttribute(props.row.statusDate, 'date') }}</q-td>
                <!-- <q-td key="actions" :props="cellProperties" :props="props">{{ getAttribute(props.row.actions, 'link') }}
                    <a href="#/action">{{ cellProperties.value }}</a>
                </q-td> -->
                <q-td key="actions" :props="props">
                    <span v-for="action of props.row.actions" :key="props.row.actions.indexOf(action)">
                        <q-btn color="primary" size="sm" flat @click="navigateTo(action, props.row)"  >{{ action }} </q-btn>
                    </span>
                </q-td>
            </q-tr>
        </template>
        </q-table>
    </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  onServerPrefetch
} from '@vue/composition-api';
import { Vue } from 'vue-property-decorator';

import { Notify } from 'quasar';
import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';
import moment from 'moment';

import { getTripsApiTrip, getCatchApiCatch } from '@boatnet/bn-common';

export default createComponent({
    setup(props, context) {
        const columns: any = [
            {name: 'tripNum', label: 'Trip #', field: 'tripNum', required: false, align: 'left', sortable: true},
            {name: 'vesselName', label: 'Vessel Name', field: 'vesselName', required: false, align: 'left', sortable: true},
            {name: 'vesselId', label: 'Vessel Id', field: 'vesselId', required: false, align: 'left', sortable: true},
            {name: 'returnDate', label: 'End Date', field: 'returnDate', required: false, align: 'left', sortable: true},
            {name: 'stage', label: 'Stage', field: 'stage', required: false, align: 'left', sortable: true},
            {name: 'errors', label: 'lb / rev Err', field: 'errors', required: false, align: 'left', sortable: true},
            {name: 'status', label: 'Status', field: 'status', required: false, align: 'left', sortable: true},
            {name: 'statusDate', label: 'Status Date', field: 'statusDate', required: false, align: 'left', sortable: true},
            {name: 'actions', label: 'Actions', field: 'actions', required: false, align: 'left', sortable: true},
        ];

        const activeTasks: any = reactive([]);
        const selected: any = [];
        const pagination = {sortBy: 'statusDate', descending: true, rowsPerPage: 50};

        const getVesselId = (row: any) => {
            return row.vessel.coastGuardNumber ? row.vessel.coastGuardNumber : row.vessel.stateRegulationNumber;
        };

        const getAttribute = (attribute: any, format: any) => {
            if (format === 'date') {
                return attribute ? moment(attribute).format('MMM DD, YYYY HH:mm') : '';
            } else if (format === 'errors') {
                return (attribute.logbook ? attribute.logbook : '0') + ' / ' + (attribute.thirdParty ? attribute.thirdParty : '0');
            } else {
                return attribute ? attribute : '';
            }
        };

        const router = context.root.$router;
        const navigateTo = (action: any, row: any) => {
            switch (action) {
                case 'compare':
                    router.push({path: '/em-data-compare?tripnum=' + row.tripNum});
                    break;
                case 'image':
                    router.push({path: '/view-image/' + row._id});
                    break;
                case 'e logbook':
                    router.push({path: '/e-logbook/' + row.tripNum});
                    break;
                case 'em review':
                    router.push({path: '/em-review/' + row.tripNum});
                    break;
                case '+ lb data':
                    router.push({path: '/em-api-portal/' + row.tripNum + '/logbook'});
                    break;
                case '+ em review':
                    router.push({path: '/em-api-portal/' + row.tripNum + '/em review'});
                    break;
                case '+ audit':
                    router.push({path: '/em-api-portal/' + row.tripNum + '/audit'});
                    break;
            }
        };

        const transferring: any = ref(false);
        const getTripsWithCaptures = async () => {
            transferring.value = true;
            try {
                const masterDB: Client<any> = couchService.masterDB;
                const queryOptions = {
                    reduce: false,
                    include_docs: true
                };

                const tripsWithCaptures: any = await masterDB.view(
                'obs_web',
                'ots_trips_with_logbook_captures',
                queryOptions
                );
                const trips = tripsWithCaptures.rows.map( (row: any) => row.doc);

                const catchQueryOptions = {
                    reduce: false,
                    include_docs: false
                };
                let catchStatus: any = await masterDB.view(
                    'trips_api_catch_status',
                    'trips_api_catch_status',
                    catchQueryOptions
                );
                catchStatus = catchStatus.rows;

                for (const trip of trips) {
                    const tripCatch: any = catchStatus.filter( (row: any) => row.key === trip.tripNum );
                    trip.errors = {};
                    trip.stage = '';
                    trip.statusDate = '';
                    trip.actions = ['image', 'e logbook', 'em review', '+ lb data', '+ em review', 'compare', '+ audit'];
                    const stagePriority = ['logbook', 'thirdParty', 'nwfscAudit'];
                    if (tripCatch.length > 0) {

                        for (const dataSource of tripCatch) {
                            if (dataSource.value[2]) { trip.errors[dataSource.value[0]] = dataSource.value[2]; }
                            if (stagePriority.indexOf(dataSource.value[0]) > stagePriority.indexOf(trip.stage)) {
                                trip.stage = dataSource.value[0];
                                trip.statusDate = dataSource.value[1];
                                switch (dataSource.value[0]) {
                                    case 'logbook':
                                        trip.status = 'not selected for review';
                                        break;
                                    case 'thirdParty':
                                        trip.status = 'third party review submitted';
                                        break;
                                    case 'nwfscAudit':
                                        trip.status = 'NWFSC audit completed';
                                        break;
                                }
                            }
                        }
                    } else {
                        trip.stage = 'capture';
                        trip.status = 'waiting for logbook data';
                        trip.actions.splice(trip.actions.indexOf('compare'), 1);
                        trip.statusDate = trip.changeLog ? trip.changeLog[0].updateDate : trip.createdDate;
                    }
                }



                for (const trip of trips) {
                    activeTasks.push(trip);
                }
                transferring.value = false;
            } catch (err) {
                console.log(err);
            }
        };

        onMounted( () => {
            getTripsWithCaptures();
        });

        return {
            activeTasks, columns, selected, pagination, getVesselId, getAttribute, transferring, navigateTo
        };

    }

});

</script>

<style>
.red {
  color: red;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: rgb(238, 238, 238);
}
</style>