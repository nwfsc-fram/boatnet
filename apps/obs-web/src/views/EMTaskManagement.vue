<template>
    <div class="q-pa-md q-gutter-md relative-position" style="min-height: 200px">

        <q-inner-loading :showing="transferring">
            <q-spinner-radio color="primary" size="3em"/>
        </q-inner-loading>

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
        >
        <template v-slot:body="props">
            <q-tr :props="props">
                <q-td key="_id"></q-td>
                <q-td key="tripNum" :props="props">{{ getAttribute(props.row.tripNum) }}</q-td>
                <q-td key="vesselName" :props="props">{{ getAttribute(props.row.vessel.vesselName) }}</q-td>
                <q-td key="vesselId" :props="props" >{{ getVesselId(props.row) }}</q-td>
                <q-td key="thirdPartyReviewer" :props="props" >{{ getReviewer(props.row) }}</q-td>
                <q-td key="returnDate" :props="props" >{{ getAttribute(props.row.returnDate, 'date') }}</q-td>
                <q-td key="stage" :props="props" >{{ getAttribute(props.row.stage) }}</q-td>
                <q-td key="revision" :props="props" >{{ getAttribute(props.row.revision, 'revision') }}</q-td>
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
        const store = context.root.$store;
        const state = store.state;

        const columns: any = [
            {name: 'tripNum', label: 'Trip #', field: 'tripNum', required: false, align: 'left', sortable: true},
            {name: 'vesselName', label: 'Vessel Name', field: 'vesselName', required: false, align: 'left', sortable: true},
            {name: 'vesselId', label: 'Vessel Id', field: 'vesselId', required: false, align: 'left', sortable: true},
            {name: 'thirdPartyReviewer', label: 'Reviewer', field: 'thirdPartyReviewer', required: false, align: 'left', sortable: true},
            {name: 'returnDate', label: 'End Date', field: 'returnDate', required: false, align: 'left', sortable: true},
            {name: 'stage', label: 'Stage', field: 'stage', required: false, align: 'left', sortable: true},
            {name: 'revision', label: 'Revisions l.b./rv.', field: 'revision', required: false, align: 'center', sortable: true},
            {name: 'errors', label: 'Errors l.b./rv.', field: 'errors', required: false, align: 'center', sortable: true},
            {name: 'status', label: 'Status', field: 'status', required: false, align: 'left', sortable: true},
            {name: 'statusDate', label: 'Status Date', field: 'statusDate', required: false, align: 'left', sortable: true},
            {name: 'actions', label: 'Actions', field: 'actions', required: false, align: 'left', sortable: true},
        ];

        const activeTasks: any = reactive([]);
        const selected: any = [];
        const pagination = {sortBy: 'statusDate', descending: true, rowsPerPage: 40};

        const getVesselId = (row: any) => {
            return row.vessel.coastGuardNumber ? row.vessel.coastGuardNumber : row.vessel.stateRegulationNumber;
        };

        const getReviewer = (row: any) => {
            return row.vessel.thirdPartyReviewer ? row.vessel.thirdPartyReviewer.description : '';
        }

        const getAttribute = (attribute: any, format: any) => {
            if (format === 'date') {
                return attribute ? moment(attribute).format('MMM DD, YYYY HH:mm') : '';
            } else if ( format === 'errors' && attribute) {
                return (attribute.logbook ? attribute.logbook : '0') + ' / ' + (attribute.thirdParty ? attribute.thirdParty : '0');
            } else if ( format === 'revision' && attribute ) {
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
                case '+ footage':
                    router.push({path: '/em-footage-detail/' + row.tripNum});
                    break;
                case '+ audit':
                    router.push({path: '/em-api-portal/' + row.tripNum + '/audit'});
                    break;
                case 'results':
                    router.push({path: '/em-results/' + row.tripNum});
                    break;
                case 'add logbook capture':
                    store.dispatch('vessel/setActiveVessel', row.vessel);
                    router.push({path: '/trips', query: {tripId: row._id, action: 'close'}});
                    break;
                case 'cancel trip':
                    store.dispatch('vessel/setActiveVessel', row.vessel);
                    router.push({path: '/trips', query: {tripId: row._id, action: 'cancel'}});
                    break;
            }
        };

        const transferring: any = ref(false);
        const getTripsWithCaptures = async () => {
            activeTasks.length = 0;
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
                    'TripsApi',
                    'catch-status',
                    catchQueryOptions
                );
                catchStatus = catchStatus.rows;

                const resultsQueryOptions = {
                    reduce: false,
                    include_docs: false
                };

                let results: any = await masterDB.view(
                    'TripsApi',
                    'expansion_results',
                    resultsQueryOptions
                );
                results = results.rows.map( (row: any) => row.key);

                for (const trip of trips) {
                    const tripCatch: any = catchStatus.filter( (row: any) => row.key === trip.tripNum );
                    trip.errors = {};
                    trip.revision = {};
                    trip.stage = '';
                    trip.statusDate = '';
                    trip.actions = ['image', 'e logbook', 'em review', '+ lb data', '+ em review', 'compare', '+ footage', '+ audit'];
                    if (results.includes(trip.tripNum)) {
                        trip.actions.push('results');
                    }
                    const stagePriority = ['logbook', 'thirdParty', 'nwfscAudit'];
                    if (tripCatch.length > 0) {

                        for (const dataSource of tripCatch) {
                            if (dataSource.value[2]) { trip.errors[dataSource.value[0]] = dataSource.value[2]; }
                            if (dataSource.value[3]) { trip.revision[dataSource.value[0]] = dataSource.value[3]; }
                            if (stagePriority.indexOf(dataSource.value[0]) > stagePriority.indexOf(trip.stage)) {
                                trip.stage = dataSource.value[0];
                                trip.statusDate = dataSource.value[1];
                                switch (dataSource.value[0]) {
                                    case 'logbook':
                                        const selectionQuery: any = await masterDB.view(
                                            'TripsApi',
                                            'em-haul-review-selection-by-tripNum',
                                            {include_docs: true, reduce: false, key: trip.tripNum} as any
                                        );
                                        if (selectionQuery.rows && selectionQuery.rows.length > 0) {
                                            trip.status = 'haulNum(s) ' + selectionQuery.rows[0].doc.selectedHauls + ' selected for review';
                                        } else {
                                            trip.status = 'not selected for review';
                                        }
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

                const displayTrip = (currentTrip: any) => {
                    if (
                        (
                            state.user.userRoles.includes('provider')
                            && currentTrip.vessel.thirdPartyReviewer
                            && state.user.activeUser.providerAssociations
                            && state.user.activeUser.providerAssociations.includes(currentTrip.vessel.thirdPartyReviewer.description)
                        )
                        ||
                        (
                            state.user.userRoles.includes('staff')
                            || state.user.userRoles.includes('data_steward')
                        )
                    ) {
                        return true;
                    } else {
                        return false;
                    }
                }

                for (const trip of trips) {
                    if ( displayTrip(trip)) {
                        activeTasks.push(trip);
                    }
                }

                if (state.user.showOpenEmTrips) {
                    const openResults: any = await masterDB.view(
                        'obs_web',
                        'open_ots_trips',
                        {reduce: false, include_docs: true} as any
                    );

                    for (let result of openResults.rows) {
                        result = result.doc;
                        result.actions = ['add logbook capture', 'cancel trip'];
                        result.stage = 'open trip';
                        result.status = 'trip has not been closed';
                        result.statusDate = result.updatedDate ? result.updatedDate : result.createdDate;
                        if (displayTrip(result)) {
                            activeTasks.unshift(result);
                        }
                        }
                }
                transferring.value = false;
            } catch (err) {
                console.error(err);
            }
        };

        watch(() => state.user.showOpenEmTrips, getTripsWithCaptures);

        return {
            activeTasks, columns, selected, pagination, getReviewer, getVesselId, getAttribute, transferring, navigateTo
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