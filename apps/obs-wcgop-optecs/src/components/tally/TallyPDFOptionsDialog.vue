<template>
  <q-dialog
    v-model="isOpen"
    persistent
  >
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">
          Generate PDF - Set ID's
        </div>
      </q-card-section>
      <q-card-section>
        <q-input
          v-model.number="config.tripId"
          label="Trip #"
          type="number"
        />
        <q-input
          v-model.number="config.haulId"
          label="Haul #"
          type="number"
        />
        <q-input
          v-model.number="config.catchId"
          label="Catch #"
          type="number"
        />
      </q-card-section>
      <q-card-actions
        align="right"
        class="text-primary"
      >
        <q-btn
          v-close-popup
          label="Generate PDF"
          @click="generatePdf"
        />
        <q-btn
          v-close-popup
          flat
          label="Done"
          @click="close"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { TallyHistory } from '../../_store/types';
import moment from 'moment';

function getReasonClass(val: string) {
  return 'bg-gray-2';
}

export default Vue.component('tally-pdf-dialog', {
  data() {
    return {
      isOpen: false,
      config: {
        tripId: 0,
        haulId: 0,
        catchId: 0
      }
    };
  },
  computed: {
    inputsOK(): boolean {
      console.log('WTF');
      return (
        this.config.tripId !== null &&
        this.config.haulId !== null &&
        this.config.catchId !== null
      );
    }
  },
  methods: {
    open() {
      this.isOpen = true;
    },
    close() {
      this.$emit('cancel');
      this.isOpen = false;
    },
    generatePdf() {
      this.$emit('generatePdf', this.config);
      this.close();
    }
  }
});
</script>
