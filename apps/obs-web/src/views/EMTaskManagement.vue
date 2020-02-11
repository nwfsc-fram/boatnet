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
                <q-td key="tripNum" :props="props">{{ props.row.tripNum ? props.row.tripNum : '' }}</q-td>
                <q-td key="vesselName" :props="props">{{ props.row.vessel.vesselName ? props.row.vessel.vesselName : '' }}</q-td>
                <q-td key="vesselId" :props="props" >{{ props.row.vessel.coastGuardNumber ? props.row.vessel.coastGuardNumber : props.row.vessel.stateRegulationNumber }}</q-td>
                <q-td key="returnDate" :props="props" >{{ props.row.returnDate ? props.row.returnDate : 'fish' }}</q-td>
                <q-td key="stage" :props="props" >{{ props.row.stage ? props.row.stage : '' }}</q-td>
                <q-td key="statusDate" :props="props" >{{ props.row.statusDate ? props.row.statusDate : '' }}</q-td>
                <q-td key="actions" :props="props">{{ props.row.actions ? props.row.actions : '' }}</q-td>
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

import { getTripsApiTrip, getCatchApiCatch } from '../helpers/trips-api';

export default createComponent({
    setup(props, context) {
        const columns: any = [
            {name: 'tripNum', label: 'Trip #', field: 'tripNum', required: false, align: 'left', sortable: true},
            {name: 'vesselName', label: 'Vessel Name', field: 'vessel', required: false, align: 'left', sortable: true},
            {name: 'vesselId', label: 'Vessel Id', field: 'vessel', required: false, align: 'left', sortable: true},
            {name: 'returnDate', label: 'End Date', field: 'returnDate', required: false, align: 'left', sortable: true},
            {name: 'stage', label: 'Stage', field: 'stage', required: false, align: 'left', sortable: true},
            {name: 'statusDate', label: 'Status Date', field: 'statusDate', required: false, align: 'left', sortable: true},
            {name: 'actions', label: 'Actions', field: 'actions', required: false, align: 'left', sortable: true},
        ];

        let activeTasks: any = reactive([]);
        const selected: any =[];
        const pagination = {sortBy: 'statusDate', descending: true, rowsPerPage: 50};

        const getTripsWithCaptures = async () => {
            try {
                console.log('getting trips with captures');
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
                    console.log(apiTrip);
                    const apiCatch: any = await getCatchApiCatch(trip.tripNum);
                    console.log(apiCatch);
                    const dataSources = [];
                    for (const dataSource of apiCatch) {
                        if (dataSource.source === 'nwfscAudit') {
                            trip.stage = "nwfscAudit";
                            trip.statusDate = dataSource.updateDate ? dataSource.updateDate : dataSource.createdDate;
                            break;
                        } else if (dataSource.source === 'thridParty') {
                            trip.stage = 'review';
                            trip.statusDate = dataSource.updateDate ? dataSource.updateDate : dataSource.createdDate;
                        } else if (dataSource.source === 'logbook') {
                            trip.stage = 'logbook';
                            trip.statusDate = dataSource.updateDate ? dataSource.updateDate : dataSource.createdDate;
                        } else {
                            trip.stage = 'capture';
                            trip.statusDate = trip.changeLog ? trip.changeLog[0].updateDate : trip.createdDate;
                        }
                    }
                }

                console.log(trips);
                for (const trip of trips) {
                    activeTasks.push(trip);
                }
            } catch (err) {
                console.log(err);
            }
        }

        onMounted( () => {
            getTripsWithCaptures();
        });

        return {
            activeTasks, columns, selected, pagination
        }

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