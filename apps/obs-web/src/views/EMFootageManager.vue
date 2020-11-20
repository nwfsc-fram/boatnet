<template>
  <div class="q-pa-md q-gutter-md">
    <q-btn
      color="primary"
      label="new"
      @click="newFootage"
    >
    </q-btn>

    <q-table
        :data="filteredFootage"
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
          <q-input
            label="tripNum"
            v-model="filterText"
            debounce="2000"
            placeholder="Search"
            style="width:100%"
            autofocus
            :rules="[val => val.length <= 6 || 'tripNum is a 6 digit number']"
          >
              <template v-if="filterText">
                  <q-avatar dense icon="close" @click="filterText = ''"></q-avatar>
              </template>
          </q-input>
      </template>

      <template v-slot:body="props">
          <q-tr :props="props" @click.native="footageDetails(props.row)">
              <q-td key="_id"></q-td>
              <q-td key="tripNum" :props="props">{{ props.row.tripNum }}</q-td>
              <q-td key="vesselName" :props="props">{{ props.row.vesselName }}</q-td>
              <q-td key="vesselId" :props="props">{{ props.row.vesselId }}</q-td>
              <q-td key="footageAdded" :props="props">{{ props.row.footageAdded ? formatDate(props.row.footageAdded) : '' }}</q-td>
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
import moment from 'moment';

import { getTripsApiTrip, getCatchApiCatch } from '@boatnet/bn-common';

export default createComponent({
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;

    const filterText: any = ref('');

    const columns = [
            {name: 'tripNum', label: 'Trip #', field: 'tripNum', required: false, align: 'left', sortable: true},
            {name: 'vesselName', label: 'Vessel Name', field: 'vesselName', required: false, align: 'left', sortable: true},
            {name: 'vesselId', label: 'Vessel Id', field: 'vesselId', required: false, align: 'left', sortable: true},
            {name: 'footageAdded', label: 'Date Added', field: 'footageAdded', required: false, align: 'left', sortable: true},
            {name: 'filesLocation', label: 'Files Location', field: 'filesLocation', required: false, align: 'left', sortable: true}
    ];

    const selected: any = [];
    const pagination = {sortBy: 'tripNum', descending: true, rowsPerPage: 40};

    const masterDB: Client<any> = couchService.masterDB;

    const footageDocs: any[] = reactive([]);

    const footageDetails = (row: any) => {
      context.root.$router.push({path: '/em-footage-detail/' + row.tripNum});
    };

    const newFootage = (row: any) => {
      context.root.$router.push({path: '/em-footage-detail/new'});
    };

    const formatDate: any = (dateVal: any) => {
      return moment(dateVal).format('MMM DD, YYYY HH:mm');
    };

    const filteredFootage = computed(
      () => {
        if (filterText.value.length <= 6 && filterText.value.length > 0) {
          return footageDocs.filter( (doc: any) => {
            return doc.tripNum.includes(filterText.value);
          });
        } else {
          return footageDocs;
        }
      }
    )

    onMounted( async () => {
      const footageQuery = await masterDB.view(
        'TripsApi',
        'all_footage_location',
        {reduce: false, include_docs: false} as any
      );
      if (footageQuery.rows.length > 0) {
        footageQuery.rows.forEach( (row: any) => {
          footageDocs.push({
                  _id: row.id,
                  tripNum: row.key,
                  vesselName: row.value[0],
                  vesselId: row.value[1],
                  footageAdded: row.value[2],
                  filesLocation: row.value[3]
                });
        });
      }
    });

    return {
        columns, footageDocs, selected, pagination, footageDetails, filterText, newFootage, formatDate, filteredFootage
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
