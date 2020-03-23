<template>
  <q-dialog v-model="showDialog">
    <q-card style="width: 400px; max-width: 80vw; height: 550px">
      <q-card-section>
        <div class="text-h6" style="text-align: center">Edit Cruise Info</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="text-body2" style="color: #027be3">Departure Date:</div>
        <pCalendar v-model="startDate" />
        <div class="text-body2" style="color: #027be3">End Date:</div>
        <pCalendar v-model="endDate" />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Save" @click="save" />
        <q-btn flat label="Close" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { createComponent, computed } from '@vue/composition-api';
import Vue from 'vue';
import { couchService } from '@boatnet/bn-couch';
import { Client } from 'davenport';
import moment from 'moment';

export default createComponent({
  props: {
    showDialog: Boolean,
    cruise: Object
  },

  setup(props, context) {
    const store = context.root.$store;
    const state = store.state;
    const masterDB: Client<any> = couchService.masterDB;

    const startDate = computed({
      get: () => {
        const startDateHolder = props.cruise ? props.cruise.startDate : null;
        return startDateHolder ? new Date(startDateHolder) : null;
      },
      set: (val) => {
        updateDate(val, 'startDate');
      }
    });

    const endDate = computed({
      get: () => {
        const endDateHolder = props.cruise ? props.cruise.endDate : null;
        return endDateHolder ? new Date(endDateHolder) : null;
      },
      set: (val) => {
        updateDate(val, 'endDate');
      }
    });

    function updateDate(date: any, field: string) {
      const tempCruise = props.cruise ? props.cruise : {};
      tempCruise[field] = moment(date).format();
      context.emit('update:cruise', tempCruise);
    }

    function save() {
      const cruise = props.cruise ? props.cruise : {};
      masterDB.put(cruise._id, cruise, cruise._rev).then((response: any) => {
        const tempCruise = props.cruise ? props.cruise : {};
        tempCruise._id = response.id;
        tempCruise._rev = response.rev;
        context.emit('update:cruise', tempCruise);
      });
      closeDialog();
    }

    function closeDialog() {
      context.emit('update:showDialog', false);
    }

    return {
      closeDialog,
      save,
      startDate,
      endDate
    };
  }
});
</script>

<style>
body .p-inputtext {
  background-color: white !important;
}
</style>