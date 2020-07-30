<template>
  <div>
    <DataTable
      :value="data"
      :expandedRows.sync="expandedRows"
      :selection.sync="selectedCar"
      selectionMode="single"
      data-key="_id"
      :totalRecords="40"
      :lazy="true"
      :paginator="true"
      :rows="10"
    >
      <Column v-for="col of displayColumns" :field="col.field" :header="col.header" :key="col.field">
        <template #body="slotProps">
          <div>slotProps.</div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script lang="ts">
import {
  createComponent,
  ref,
  reactive,
  computed,
  onMounted,
  watch,
  onBeforeMount
} from '@vue/composition-api';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { get, set, findIndex } from 'lodash';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import moment from 'moment';
import { getCouchLookupInfo } from '@boatnet/bn-common/src/helpers/getLookupsInfo';

Vue.component('DataTable', DataTable);
Vue.component('Column', Column);

export default createComponent({
  props: {},
  setup(props, context) {
    const selectedCar: any = ref([]);
    const totalRecords: any = ref(100);
    const displayColumns: any[] = [
      {
        field: 'observer.firstName',
        header: 'First Name'
      },
      {
        field: 'observer.lastName',
        header: 'Last Name'
      },
      {
        field: 'year',
        header: 'Year'
      }
    ];

    const data: any[] = [
      {
        observer: {
          firstName: 'Henry',
          lastName: 'Coe'
        },
        year: 2020
      },
      {
        year: 2020
      }
    ];
    /*  const data: any[] = [
      {
        brand: 'Volkswagen',
        year: 2012,
        color: 'Orange',
        vin: 'dsad231ff',
        _id: 1
      },
      { brand: 'BMW', year: 2003, color: 'Blue', vin: 'j6w54qgh', _id: 2 },
      {
        brand: 'Mercedes',
        year: 1995,
        color: 'Orange',
        vin: 'hrtwy34',
        _id: 3
      },
      { brand: 'Volvo', year: 2005, color: 'Black', vin: 'jejtyj', _id: 4 },
      { brand: 'Honda', year: 2012, color: 'Yellow', vin: 'g43gr', _id: 5 },
      { brand: 'Jaguar', year: 2013, color: 'Orange', vin: 'greg34', _id: 6 },
      { brand: 'Ford', year: 2000, color: 'Black', vin: 'h54hw5', _id: 7 },
      { brand: 'Fiat', year: 2013, color: 'Red', vin: '245t2s', _id: 8 },
      { brand: 'Volvo', year: 2005, color: 'Black', vin: 'jejtyj', _id: 9 },
      { brand: 'Honda', year: 2012, color: 'Yellow', vin: 'g43gr', _id: 10 },
      { brand: 'Jaguar', year: 2013, color: 'Orange', vin: 'greg34', _id: 11 },
      { brand: 'Ford', year: 2000, color: 'Black', vin: 'h54hw5', _id: 12 },
      { brand: 'Fiat', year: 2013, color: 'Red', vin: '245t2s', _id: 13 }
    ];*/
    const expandedRows: any[] = [];

    onMounted(() => {
      selectedCar.value = [{ _id: '8' }];
    });

    return {
      data,
      expandedRows,
      selectedCar,
      totalRecords,
      displayColumns
    };
  }
});
</script>

<style scoped>
.p-inputtext {
  background-color: inherit !important;
}
</style>
