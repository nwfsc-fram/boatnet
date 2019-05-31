<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Template Manager</div>
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

export default Vue.component('tally-template-dialog', {
  data() {
    return {
      isOpen: false
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
    // history(): TallyHistory[] {
    //   return this.$store.getters['tallyState/currentTallyHistory'];
    // }
  }
});
</script>
