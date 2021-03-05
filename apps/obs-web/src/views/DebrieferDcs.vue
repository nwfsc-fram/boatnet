<template>
  <div>
    <div class="row">
      <div class="col">
        <p style="font-weight: bold; font-size: 20px; letter-spacing: .5px;">DCS/AFI - {{ observerName }}</p>
      </div>
      <div class="col">
        <q-select v-model="selectedYear" :options="yearOptions" outlined label="year" dense options-dense style="max-width: 300px"></q-select>
      </div>
      <div class="col">
        <q-select v-model="selectedMonth" :options="['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']" outlined label="month" dense options-dense style="max-width: 300px"></q-select>
      </div>
      <div class="col" style="text-align: right">
        <q-btn round icon="refresh" size="sm" color="primary" style="position: relative; top: 4px; margin-right: 10px" @click="refresh"></q-btn>
        <!-- <q-btn
          size="md"
          color="primary"
          dense
          style="position: relative; top: 3px"
          @click="addDcsRow"
          >add dcs row</q-btn
        > -->
      </div>
    </div>
    <prime-table
      :value="dcsRows"
      :columns="dcsColumns"
      type="DCS"
      uniqueKey="_id"
      :enableSelection="true"
      :isFullSize="true"
      :loading="loading"
      @save="save"
      @deleteRow="deleteRow"
    >
    </prime-table>

    <q-dialog v-model="deleteConfirmDialog">
      <q-card>
        <q-card-section v-if="rowToDelete">
          <b>Are you sure you want to delete this dcs row?</b>
          <br>
          <q-card bordered>
            <q-card-section style="font-weight: bold">
              <div>Trip#:  {{ rowToDelete.tripNum }}</div>
              <div>Haul #: {{ rowToDelete.haulNum }}</div>
              <div>Issue: {{ rowToDelete.issue }}</div>
              <div>AFI Flag? {{ rowToDelete.afiFlag ? 'YES' : 'NO' }}</div>
            </q-card-section>
          </q-card>
          <div style="text-align: right">
            <br>
            <q-btn class="dcs-dialog" color="red" size="md"  @click="executeDelete">delete</q-btn>
            <q-btn class="dcs-dialog" color="primary" size="md" @click="deleteConfirmDialog = false">Cancel</q-btn>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  onMounted,
  watch,
  computed,
  onBeforeMount,
} from '@vue/composition-api';
import moment from 'moment';

import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import { NoSubstitutionTemplateLiteral } from 'typescript';
import { authService } from '@boatnet/bn-auth/lib';
import { DcsRow, TripLevel, CollectionMethod, DcsErrorType, AfiFlag } from '@boatnet/bn-models';

export default createComponent({
  props: {
    showData: Boolean,
    isFullSize: Boolean,
  },
  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;

    const dcsColumns = [
      {
        field: 'actions',
        header: '',
        key: 'actions',
        width: '60',
        type: 'actions',
      },
      {
        field: 'tripNum',
        header: 'Trip #',
        key: 'tripNum',
        width: '60',
        isEditable: true,
        type: 'text',
      },
      {
        field: 'haulNum',
        header: 'Haul #',
        key: 'haulNum',
        width: '60',
        isEditable: true,
        type: 'text',
      },
      {
        field: 'collectionMethod',
        header: 'Collection Method',
        key: 'collectionMethod',
        width: '80',
        isEditable: true,
        type: 'toggle',
        listType: 'template',
        list: Object.values(CollectionMethod),
      },
      {
        field: 'createdDate',
        header: 'Date Added',
        key: 'createdDate',
        width: '80',
        isEditable: true,
        type: 'date'
      },
      {
        field: 'level',
        header: 'Level',
        key: 'level',
        width: '60',
        isEditable: true,
        type: 'toggle',
        listType: 'template',
        list: Object.values(TripLevel),
      },
      {
        field: 'issue',
        header: 'Issue',
        key: 'issue',
        width: '150',
        isEditable: true,
        type: 'textArea',
      },
      {
        field: 'dcsErrorType',
        header: 'Error Type',
        key: 'dcsErrorType',
        width: '80',
        isEditable: true,
        type: 'toggle',
        listType: 'template',
        list: Object.values(DcsErrorType),
      },
      {
        field: 'afiFlag',
        header: 'AFI Flag',
        key: 'afiFlag',
        width: '80',
        isEditable: true,
        type: 'toggle',
        listType: 'template',
        list: Object.values(AfiFlag),
      },
      {
        field: 'afiDate',
        header: 'AFI Date',
        key: 'afiDate',
        width: '80',
        isEditable: true,
        type: 'date'
      },
      {
        field: 'observerNotes',
        header: 'Observer Notes',
        key: 'observerNotes',
        width: '120',
        isEditable: true,
        type: 'textArea'
      },
    ];

    const loading: any = ref(false);
    const dcsRows: any = ref([]);
    const observerName: any = ref('');
    const selectedYear: any = ref(moment().format('YYYY'));
    const selectedMonth: any = ref(moment().format('MMMM'));

    const yearOptions: any = ref([]);

    const getYearOptions = () => {
      const firstYear = '2000';
      const currentYear = moment().format('YYYY');
      for (let i = parseInt(firstYear, 10); i <= parseInt(currentYear, 10); i++) {
        yearOptions.value.unshift(i.toString());
      }
    };

    const getDcsRows = async () => {
      let startDate = '';
      let endDate = '';

      if (selectedMonth.value === 'All') {
        startDate = moment().year(selectedYear.value).month(0).date(1).hour(0).minute(0).second(0).format();
        endDate = moment(startDate).endOf('year').format();
      } else {
        startDate = moment().year(selectedYear.value).month(selectedMonth.value).date(1).hour(0).minute(0).second(0).format();
        endDate = moment(startDate).endOf('month').format();
      }
      dcsRows.value.length = 0;
      loading.value = true;
      const dcsRowsQuery = await masterDB.view('obs_web', 'dcs-rows', {
        include_docs: true,
        reduce: false,
        start_key: [state.debriefer.observer, startDate],
        end_key: [state.debriefer.observer, endDate]
      } as any);
      dcsRows.value.push.apply(
        dcsRows.value,
        dcsRowsQuery.rows.map((row: any) => row.doc)
      );
      loading.value = false;
      getObserverName();
    };

    const getObserverName = async () => {
      const observer = await masterDB.get(state.debriefer.observer);
      observerName.value = observer.firstName + ' ' + observer.lastName;
    };

    const addDcsRow = async () => {
      const newRow = {
        type: 'dcs-row',
        observerId: state.debriefer.observer,
        tripNum: '',
        haulNum: '',
        collectionMethod: '',
        createdDate: moment().format(),
        createdBy: authService.getCurrentUser()!.username,
        level: '',
        issue: '',
        dcsErrorType: '',
        afiFlag: '',
        afiDate: moment().format(),
        observerNotes: ''
      };
      dcsRows.value.unshift(newRow);
    };

    const save = async (rowData: any) => {
        const user = authService.getCurrentUser()!.username;
        rowData.updatedBy = user;
        rowData.updatedDate = moment().format();
        if (rowData._id) {
            const response: any = await masterDB.put(rowData._id, rowData, rowData._rev);
            const editedRow = dcsRows.value.find( (row: any) => row._id === response.id );
            for (const attrib of Object.keys(rowData)) {
              editedRow[attrib] = rowData[attrib];
            }
            editedRow._rev = response.rev;
        } else {
            const response = await masterDB.post(rowData);
            const editedRow = dcsRows.value.find ((row: any) => !row._id);
            for (const attrib of Object.keys(rowData)) {
              editedRow[attrib] = rowData[attrib];
            }
            editedRow._id = response.id;
            editedRow._rev = response.rev;
        }
    };

    const refresh = () => {
      getDcsRows();
    };

    const deleteConfirmDialog: any = ref(false);
    const rowToDelete: any = ref(null);
    const deleteRow = (row: any) => {
      rowToDelete.value = row;
      deleteConfirmDialog.value = true;
    };
    const executeDelete = async () => {
      try {
        await masterDB.delete(rowToDelete.value._id, rowToDelete.value._rev);
        deleteConfirmDialog.value = false;
      } catch (err) {
        deleteConfirmDialog.value = false;
        console.error(err);
      }
      getDcsRows();
    };

    onMounted( () => {
      getYearOptions();
    });

    watch(() => state.debriefer.observer, getDcsRows);

    watch(() => selectedYear.value, (newVal, oldVal) => {
      if (oldVal && oldVal !== newVal) {
        getDcsRows();
      }
    });

    watch(() => selectedMonth.value, (newVal, oldVal) => {
      if (oldVal && oldVal !== newVal) {
        getDcsRows();
      }
    });

    return {
      addDcsRow,
      dcsRows,
      dcsColumns,
      loading,
      save,
      observerName,
      refresh,
      selectedYear,
      selectedMonth,
      yearOptions,
      deleteRow,
      rowToDelete,
      deleteConfirmDialog,
      executeDelete
    };
  },
});
</script>

<style scoped>

  .dcs-dialog {
    margin: 5px !important;
  }

</style>