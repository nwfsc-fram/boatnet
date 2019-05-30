<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Tally Weights for {{shortCode}} - {{reason}}</div>
      </q-card-section>
      <q-card-section>
        <div class="text-body1">Current Total Tally: {{totalCount}}</div>
        <div class="text-body1">Weight Count: {{weighedCount}}</div>
        <div class="text-body1">Average Weight: x</div>
      </q-card-section>
      <q-card-section>
        <q-markup-table v-if="countsWeights" separator="horizontal" flat bordered>
          <thead>
            <tr>
              <th class="text-left">Count</th>
              <th class="text-left">Weight</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cw, index) in countsWeights" :key="index">
              <th class="text-left">{{cw.weighedCount}}</th>
              <th class="text-left">{{cw.weight}}</th>
              <th @click="handleDelete(index)">
                <q-icon style="font-size: 32px;" name="delete_forever"/>
              </th>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
      <q-btn @click="addTallyCountWeights">ADD</q-btn>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup/>
        <q-btn flat label="Done" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.component('tally-weights-dialog', {
  props: {
    // For props, this seems complicated, not sure if there's a simpler way
    // https://vuejs.org/v2/guide/components-props.html
    // https://frontendsociety.com/using-a-typescript-interfaces-and-types-as-a-prop-type-in-vuejs-508ab3f83480
    buttonData: {
      type: Object,
      default: { labels: { shortCode: '', reason: '' } }
    },
    speciesData: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      selectedSpecies: null as any,
      options: [] as any[],
      isOpen: false
    };
  },
  methods: {
    open() {
      this.selectedSpecies = undefined;
      this.isOpen = true;
    },
    close() {
      this.$emit('cancel');
      this.isOpen = false;
    },
    addTallyCountWeights() {
      const dummy = {
        weighedCount: Math.floor(Math.random() * 10),
        weight: Math.random() * 10
      };
      this.$store.commit('tallyState/addTallyCountWeight', dummy);
    },
    handleDelete(index: number) {
      this.$store.commit('tallyState/deleteTallyCountWeight', index);
    }
  },
  computed: {
    countsWeights(): string {
      return this.$store.getters['tallyState/currentCWData'];
    },
    tallyData(): any {
      return this.$store.getters['tallyState/currentTallyData'];
    },
    totalCount(): number {
      if (this.$store.getters['tallyState/currentTallyData']) {
        return this.$store.getters['tallyState/currentTallyData'].count;
      } else {
        return 0;
      }
    },
    weighedCount(): number {
      if (this.$store.getters['tallyState/currentTallyData']) {
        return this.$store.getters['tallyState/currentTallyData'].calculatedTotalWeighedCount;
      } else {
        return 0;
      }
    },
    shortCode(): string {
      return this.buttonData && this.buttonData.labels
        ? this.buttonData.labels.shortCode
        : '';
    },
    reason(): string {
      return this.buttonData && this.buttonData.labels
        ? this.buttonData.labels.reason
        : '';
    }
  }
});
</script>
<style scoped lang="scss">
th {
  font-size: 20px; // Not working?
}
</style>