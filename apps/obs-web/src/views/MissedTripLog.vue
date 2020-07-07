<template>
    <div>
    <q-table
      v-if="trips.length > 0"
      :data="trips"
      :columns="columns"
      :pagination.sync="pagination"
      :selected.sync="selected"
      row-key="_id"
      dense
      hide-bottom
    >
      <template v-slot:body="props">
        <q-tr :props="props"  @click.native="review(props.row)" :class="!props.row.maximizedRetention || props.row.isSelected ? 'text-red-6' : 'black'">
          <q-td key="createdDate" :props="props">{{ formatDateTime(props.row.createdDate) }}</q-td>
          <q-td key="createdBy" :props="props">{{ props.row.createdBy }}</q-td>
          <q-td key="vesselName" :props="props">{{ props.row.vessel.vesselName }}</q-td>
          <q-td key="vesselId" :props="props">{{ props.row.vessel.coastGuardNumber ? props.row.vessel.coastGuardNumber : props.row.vessel.stateRegualtionNumber }}</q-td>
          <q-td key="tripNum" :props="props">{{ ![0,1].includes(props.row.tripNum) ? props.row.tripNum : '' }}</q-td>
          <q-td key="isSelected" :props="props">{{ props.row.isSelected }}</q-td>
          <q-td key="maximizedRetention" :props="props">{{ props.row.maximizedRetention ? props.row.maximizedRetention : 'false' }}</q-td>
          <q-td key="departureDate" :props="props">{{ formatDateTime(props.row.departureDate) }}</q-td>
          <q-td key="departurePort" :props="props">{{ props.row.departurePort.name }}</q-td>
          <q-td key="returnDate" :props="props">{{ formatFullDate(props.row.returnDate) }}</q-td>
          <q-td key="returnPort" :props="props">{{ props.row.returnPort.name }}</q-td>
          <q-td key="fishery" :props="props">{{ props.row.fishery.description === 'Electronic Monitoring EFP' ? 'EM EFP' : props.row.fishery.description}}</q-td>
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
    import { CouchDBInfo, CouchDBCredentials, couchService } from '@boatnet/bn-couch';
    import { Client, CouchDoc, ListOptions } from 'davenport';
    import moment from 'moment';

    export default createComponent({
        setup(props, context) {
            const store = context.root.$store;
            const state = store.state;
            const columns  = [
                {name: 'createdDate', label: 'Trip Entered', field: 'createdDate', required: false, align: 'left', sortable: true},
                {name: 'createdBy', label: 'Entered By', field: 'createdBy', required: false, align: 'left', sortable: true},
                {name: 'vesselName', label: 'Vessel Name', field: 'vessel.vesselName', required: false, align: 'left', sortable: true},
                {name: 'vesselId', label: 'Vessel #', field: 'vessel.vesselId', required: false, align: 'left', sortable: true},
                {name: 'tripNum', label: 'Trip Number', field: 'tripNum', required: false, align: 'left', sortable: true},
                {name: 'isSelected', label: 'Observed', field: 'isSelected', required: false, align: 'left', sortable: true},
                {name: 'maximizedRetention', label: 'Max Retention', field: 'maximizedRetention', required: false, align: 'left', sortable: true},
                {name: 'departureDate', label: 'Departure Date / Time', field: 'departureDate', required: false, align: 'left', sortable: true, sort: (a: any, b: any) => (a).localeCompare(b)},
                {name: 'departurePort', label: 'Departure Port', field: 'departurePort', required: false, align: 'left', sortable: true, sort: (a: any, b: any) => (a.name).localeCompare(b.name)},
                {name: 'returnDate', label: 'Return Date', field: 'returnDate', required: false, align: 'left', sortable: true, sort: (a: any, b: any) => (a).localeCompare(b)},
                {name: 'returnPort', label: 'Return Port', field: 'returnPort', required: false, align: 'left', sortable: true, sort: (a: any, b: any) => (a.name).localeCompare(b.name)},
                {name: 'fishery', label: 'Fishery', field: 'fishery', required: false, align: 'left', sortable: true, sort: (a: any, b: any) => (a.description).localeCompare(b.description)},
            ];
            const pagination = {
                sortBy: 'departureDate',
                descending: false,
                rowsPerPage: 0,
                };

            const selected: any = [];

            const trips: any = ref([]);
            onMounted( async () => {
                try {
                    const masterDB: Client<any> = couchService.masterDB;
                    const queryOptions = {
                        reduce: false,
                        include_docs: true,
                    };
                    const missedTrips = await masterDB.view<any>(
                            'obs_web',
                            'missed_trips',
                            queryOptions
                        );

                    trips.value = missedTrips.rows.map( (row: any) => row.doc);
                } catch (err) {
                    console.log(err);
                }
            });

            function formatFullDate(date: any) {
            return moment(date).format('MM/DD/YYYY');
            }

            function formatDateTime(date: any) {
            return moment(date).format('MM/DD/YYYY, HH:mm');
            }

            function review(trip: any) {
                state.trip.activeTrip = trip;
                state.trip.newTrip = false;
                state.trip.readOnly = true;
                state.vessel.activeVessel = trip.vessel;
                context.root.$router.push({path: '/trips/' + trip.tripNum});
            }

            return {
                columns, pagination, selected, trips, formatDateTime, formatFullDate, review
            };
        }
    });
</script>