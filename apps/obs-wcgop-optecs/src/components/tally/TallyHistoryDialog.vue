<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">History</div>
      </q-card-section>
      <q-card-section>
        <q-table dense :pagination.sync="pagination" :data="history" :columns="columns"/>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Done" @click="close" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import Vue from 'vue';
import { TallyHistory } from '../../_store/types';
import moment from 'moment';

export default Vue.component('tally-history-dialog', {
  data() {
    return {
      isOpen: false,
      pagination: { rowsPerPage: 10 },
      columns: [
        {
          name: 'eventTime',
          label: 'Time',
          field: 'eventTime',
          align: 'left',
          format: (val: any) => {
            return moment(val).format('MM/DD hh:mm');
          }
        },
        {
          name: 'type',
          label: 'Action',
          field: 'type',
          align: 'left'
        },
        {
          name: 'shortCode',
          label: 'Code',
          field: 'shortCode',
          align: 'left'
        },

        {
          name: 'reason',
          label: 'Disp.',
          field: 'reason',
          align: 'left'
        },
        {
          name: 'oldValue',
          label: 'Previous',
          field: 'oldValue',
          align: 'left'
        },
        {
          name: 'newValue',
          label: 'New Value',
          field: 'newValue',
          align: 'left'
        }
      ]
    };
  },
  methods: {
    open() {
      this.isOpen = true;
    },
    close() {
      this.$emit('cancel');
      this.isOpen = false;
    }
  },
  computed: {
    history(): TallyHistory[] {
      return this.$store.getters['tallyState/currentTallyHistory'];
    }
  }
});
</script>
