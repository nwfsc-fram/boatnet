<template>
    <div class="q-pa-md q-gutter-md">

        <q-table
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
                <q-td key="statusDate" :props="props" >{{ getAttribute(props.row.statusDate, 'date') }}</q-td>
                <!-- <q-td key="actions" :props="cellProperties" :props="props">{{ getAttribute(props.row.actions, 'link') }}
                    <a href="#/action">{{ cellProperties.value }}</a>
                </q-td> -->
                <q-td key="actions" :props="props">
                    <span v-for="action of props.row.actions" :key="props.row.actions.indexOf(action)">
                        <q-btn color="primary" size="sm" flat :to="getActionUrl(action, props.row)" >{{ action }} </q-btn>
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
            } else {
                return attribute ? attribute : '';
            }
        };

        const getActionUrl = (action: any, row: any) => {
            if (action === 'compare') {
                return 'em-data-compare?' + 'tripnum=' + row.tripNum;
            } else if (action === 'view') {
                return 'view-image?' + 'id=' + row._id;
            }
        };

        const getTripsWithCaptures = async () => {
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
                for (const trip of trips) {
                    const apiTrip: any = await getTripsApiTrip(trip.tripNum);
                    const apiCatch: any = await getCatchApiCatch(trip.tripNum);
                    trip.stage = '';
                    trip.statusDate = '';
                    trip.actions = ['view', 'compare', 'review'];
                    const stagePriority = ['logbook', 'thirdParty', 'nwfscAudit'];
                    if (Array.isArray(apiCatch)) {

                        for (const dataSource of apiCatch) {
                            if (stagePriority.indexOf(dataSource.source) > stagePriority.indexOf(trip.stage)) {
                                trip.stage = dataSource.source;
                                trip.statusDate = dataSource.updateDate ? dataSource.updateDate : dataSource.createdDate;
                            }
                        }
                    } else {
                        trip.stage = 'capture';
                        trip.statusDate = trip.changeLog ? trip.changeLog[0].updateDate : trip.createdDate;
                    }
                }
                for (const trip of trips) {
                    activeTasks.push(trip);
                }
            } catch (err) {
                console.log(err);
            }
        };

        onMounted( () => {
            getTripsWithCaptures();
        });

        return {
            activeTasks, columns, selected, pagination, getVesselId, getAttribute, getActionUrl
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