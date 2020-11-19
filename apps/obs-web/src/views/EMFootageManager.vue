<template>
  <div class="q-pa-md q-gutter-md">

        <q-table
            :data="footage"
            :columns="columns"
            dense
            row-key="id"
            selection="single"
            :selected.sync="selected"
            :pagination.sync="pagination"
            binary-state-sort
            hide-bottom
        >

            <template v-slot:top>
                <q-input label="tripNum" v-model="tripFilter" debounce="1000" placeholder="Search" style="width:100%" autofocus>
                    <template v-if="tripFilter">
                        <q-avatar dense icon="close" @click="tripFilter = ''"></q-avatar>
                    </template>
                </q-input>
            </template>

            <template v-slot:body="props">
                <q-tr :props="props" @click.native="footageDetails(props.row)">
                    <q-td key="_id"></q-td>
                    <q-td key="tripNum" :props="props">{{ props.row.tripNum }}</q-td>
                    <q-td key="vesselName" :props="props">{{ props.row.vesselName }}</q-td>
                    <q-td key="vesselId" :props="props">{{ props.row.vesselId }}</q-td>
                    <q-td key="dateAdded" :props="props">{{ props.row.dateAdded }}</q-td>
                    <q-td key="filesLocation" :props="props">{{ props.row.filesLocation }}</q-td>
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

import { Vue, Watch } from 'vue-property-decorator';
import {
  CouchDBInfo,
  CouchDBCredentials,
  couchService
} from '@boatnet/bn-couch';
import { Client, CouchDoc, ListOptions } from 'davenport';

import { Notify } from 'quasar';

import { getTripsApiTrip, getCatchApiCatch } from '@boatnet/bn-common';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;

    const tripFilter: any = ref(null);

    const columns = [
            {name: 'tripNum', label: 'Trip #', field: 'tripNum', required: false, align: 'left', sortable: true},
            {name: 'vesselName', label: 'Vessel Name', field: 'vesselName', required: false, align: 'left', sortable: true},
            {name: 'vesselId', label: 'Vessel Id', field: 'vesselId', required: false, align: 'left', sortable: true},
            {name: 'dateAdded', label: 'Date Added', field: 'dateAdded', required: false, align: 'left', sortable: true},
            {name: 'filesLocation', label: 'Files Location', field: 'filesLocation', required: false, align: 'left', sortable: true}
    ];

    const selected: any = [];
    const pagination = {sortBy: 'tripNum', descending: true, rowsPerPage: 40};

    const footage = [
      {_id: 'erfgjk34h52w34kjtrwhergkljfw34nrtqe', tripNum: '123334', vesselName: 'Fish Master 3000', vesselId: '0G814', dateAdded: '2020-03-05T11:32:53-08:00', filesLocation: 'V://directory/subdirectory/filesfolder'}
    ];

    const footageDetails = (row: any) => {
      context.root.$router.push({path: '/em-footage-detail/' + row.tripNum});
    };

    return {
        columns, footage, selected, pagination, footageDetails, tripFilter
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
