<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">History</div>
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

export default Vue.component('tally-history-dialog', {
  props: {
    history: {
      // this seems complicated, not sure if there's a simpler way
      // https://frontendsociety.com/using-a-typescript-interfaces-and-types-as-a-prop-type-in-vuejs-508ab3f83480
      type: Array as () => TallyHistory[]
    }
  },
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
  }
});
</script>
