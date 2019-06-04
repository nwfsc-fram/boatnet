<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Generate PDF - Set ID's</div>
      </q-card-section>
      <q-card-section>
        <q-input label="Trip #" v-model.number="config.tripId" type="number"></q-input>
        <q-input label="Haul #" v-model.number="config.haulId" type="number"></q-input>
        <q-input label="Catch #" v-model.number="config.catchId" type="number"></q-input>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn label="Generate PDF" @click="generatePdf" v-close-popup/>
        <q-btn flat label="Done" @click="close" v-close-popup/>
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
  }
});
</script>
