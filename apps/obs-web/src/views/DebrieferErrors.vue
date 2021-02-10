<template>
  <div>
    <div style="text-align: right">
      <q-icon name="open_in_new" size="md" v-on:click="openNewDebriefingTab" />
    </div>
    <prime-table
      :value="errorRows"
      :columns="errorColumns"
      type="Errors"
      uniqueKey="uid"
      :enableSelection="true"
      :isFullSize="isFullSize"
      :loading="loading"
      @save="save"
    >
    </prime-table>

  </div>
</template>

<script lang="ts">
import { createComponent, ref, onMounted, watch, computed, onBeforeMount } from '@vue/composition-api';
import moment from 'moment';

import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import { NoSubstitutionTemplateLiteral } from 'typescript';

export default createComponent({
  props: {
    showData: Boolean,
    isFullSize: Boolean
  },
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;
    const errorStatuses: any = [];

    const errorColumns = [
      { field: 'severity', header: 'Severity', key: 'errorSeverity', width: '80' },
      { field: 'description', header: 'Description', key: 'errorDescription', width: '80'},
      { field: 'tripNum', header: 'Trip #', key: 'errorTripNum', width: '80' },
      { field: 'dateCreated', header: 'Date Created', key: 'dateErrorCreated', width: '80' },
      { field: 'observer', header: 'Observer', key: 'errorObserver', width: '80' },
      {
        field: 'status',
        header: 'Status',
        type: 'toggle',
        listType: 'template',
        list: errorStatuses,
        // listType: 'fetch',
        // lookupKey: 'error-status',
        // lookupField: 'description',
        key: 'errorStatus',
        isEditable: true,
        width: '80'
      },
      { field: 'dateFixed', header: 'Date Fixed', key: 'dateErrorFixed', width: '80' },
      { field: 'note', header: 'Note', type: 'textArea', key: 'errorNote', isEditable: true, width: '80' }
    ];

    const loading: any = ref(false);
    const errorRows: any = ref([]);
    const errorDocs: any = ref([]);

    const openNewDebriefingTab = () => {
      const route = '/observer-web/debriefer/qa';
      window.open(route, '_blank');
    };

    const getErrors = async (tripId: number) => {
      try {
        const errorsQuery: any = await masterDB.view(
          'obs_web',
          'wcgop-trip-errors',
          {reduce: false, include_docs: true, key: tripId} as any
        );

        const errors: any = [];

        if (errorsQuery.rows.length > 0) {
          errorDocs.value.push.apply(errorDocs.value, errorsQuery.rows);
          for (const error of errorsQuery.rows[0].doc.errors) {
            error.tripNum = errorsQuery.rows[0].doc.tripNumber;
            error.note = error.notes;
            error.uid = errorsQuery.rows[0].doc._id + '_' + errorsQuery.rows[0].doc.errors.indexOf(error);
            error._rev = errorsQuery.rows[0].doc._rev;
            errors.push(error);
          }
          errorRows.value.push.apply(errorRows.value, errors);
        }
      } catch (err) {
        console.error(err);
      }
    };


    const getTripErrors = () => {
      loading.value = true;
      errorDocs.value.length = 0;
      errorRows.value = [];
      for (const trip of state.debriefer.trips) {
        getErrors(trip['legacy-tripId']);
      }
      loading.value = false;
    };

    const save = async (data: any) => {
      const id = data.uid.split('_')[0];
      const rev = data._rev;

      const errorDoc: any = errorDocs.value.find( (row: any) => row.id = id);
      const errorRow = errorDoc.doc.errors[data.uid.split('_')[1]];
      errorRow.status =  data.status;
      errorRow.notes = data.note;
      errorRow.note = data.note;
      if (data.status === 'Resolved') {
        errorRow.dateFixed = moment().format();
      } else if (data.status === 'Unresolved') {
        errorRow.dateFixed = '';
      }

      errorDoc.doc._rev = rev;
      const result = await masterDB.put(id, errorDoc.doc, rev);
      errorDoc._rev = result.rev;
      for (const row of errorRows.value) {
        if (row.uid.split('_')[0] === id) {
          row._rev = result.rev;
        }
      }
    };

    const getErrorStatuses = async () => {
      const errorStatusQueryResults = await masterDB.view(
        'obs_web',
        'all_doc_types',
        {include_docs: true, reduce: false, key: 'error-status'} as any
      )
      const activeWcgopErrorStatuses = errorStatusQueryResults.rows.filter( (row: any) => row.doc.isActive && row.doc.isWcgop);
      errorStatuses.push.apply(errorStatuses, activeWcgopErrorStatuses.map( (row: any) => row.doc.description));
    }

    onMounted( () => getErrorStatuses() );

    watch(() => state.debriefer.trips, getTripErrors);

    return {
      errorRows, errorColumns, openNewDebriefingTab, loading, save
    };
  }
});

</script>