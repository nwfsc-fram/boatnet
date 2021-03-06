<template>
  <q-dialog
    v-model="isOpen"
    persistent
  >
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">
          Tally Weights for {{ shortCode }} - {{ reason }}
        </div>
      </q-card-section>
      <q-card-section>
        <div class="text-body1">
          Current Total Tally: {{ totalCount }}
        </div>
        <div class="text-body1">
          Weighed Count: {{ weighedCount }}
        </div>
        <div class="text-body1">
          Average Weight: {{ avgWeight }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-scroll-area style="height: 200px;">
          <q-markup-table
            v-if="countsWeights"
            separator="horizontal"
            dense
            flat
            bordered
          >
            <thead>
              <tr>
                <th class="text-left">
                  Count
                </th>
                <th class="text-left">
                  Weight
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(cw, index) in countsWeights"
                :key="index"
              >
                <th class="text-left">
                  {{ cw.weighedCount }}
                </th>
                <th class="text-left">
                  {{ cw.weight }}
                </th>
                <th @click="handleDelete(index)">
                  <q-icon
                    style="font-size: 32px;"
                    name="delete_forever"
                  />
                </th>
              </tr>
            </tbody>
          </q-markup-table>
        </q-scroll-area>
      </q-card-section>
      <q-card-section>
        <q-input
          v-model.number="addCountValue"
          type="number"
          label="Count"
          style="max-width: 200px"
        />
        <q-input
          v-model.number="addWeightValue"
          type="number"
          label="Weight"
          style="max-width: 200px"
        />
      </q-card-section>
      <q-card-section>
        <q-btn
          color="green"
          :disabled="isAddDisabled"
          @click="addTallyCountWeights(false)"
        >
          Add To Tally
        </q-btn>&nbsp;&nbsp;
        <q-btn
          color="green"
          :disabled="isAddAlreadyDisabled"
          @click="addTallyCountWeights(true)"
        >
          Add (Count Already Tallied)
        </q-btn>
      </q-card-section>

      <q-card-actions
        align="right"
        class="text-primary"
      >
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

export default Vue.component('tally-weights-dialog', {
  props: {
    // For props, this seems complicated, not sure if there's a simpler way
    // https://vuejs.org/v2/guide/components-props.html
    // https://frontendsociety.com/using-a-typescript-interfaces-and-types-as-a-prop-type-in-vuejs-508ab3f83480
    buttonData: {
      type: Object,
      default: () =>  ({labels: { shortCode: '', reason: '' } })
    },
    speciesData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      selectedSpecies: null as any,
      options: [] as any[],
      isOpen: false,
      addCountValue: null,
      addWeightValue: null
    };
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
      const tallyData = this.$store.getters['tallyState/currentTallyData'];
      if (tallyData && tallyData.calculatedTotalWeighedCount) {
        return tallyData.calculatedTotalWeighedCount;
      } else {
        return 0;
      }
    },
    avgWeight(): number {
      const tallyData = this.$store.getters['tallyState/currentTallyData'];
      if (tallyData && tallyData.calculatedAverageWeight) {
        return tallyData.calculatedAverageWeight.toFixed(2);
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
    },
    isAddDisabled(): boolean {
      // TODO q-input range?
      return (
        !this.addCountValue ||
        !this.addWeightValue ||
        this.addCountValue! <= 0 ||
        this.addCountValue! <= 0
      );
    },
    isAddAlreadyDisabled(): boolean {
      // TODO q-input range?
      // TODO Calculate difference between total tally and weighed count, then restrict accordingly

      const curData = this.$store.getters['tallyState/currentTallyData'];
      let availableTallyCount = 0;
      if (curData) {
        const currentTotalCount = curData.count ? curData.count : 0;
        const currentWeighedCount = curData.calculatedTotalWeighedCount
          ? curData.calculatedTotalWeighedCount
          : 0;

        availableTallyCount = currentTotalCount - currentWeighedCount;
      }
      // console.log('AVAILABLE', availableTallyCount);
      return (
        !this.addCountValue ||
        !this.addWeightValue ||
        this.addCountValue! <= 0 ||
        this.addCountValue! <= 0 ||
        this.addCountValue! > availableTallyCount
      );
    }
  },
  methods: {
    open() {
      this.selectedSpecies = undefined;
      this.isOpen = true;
    },
    close() {
      this.$emit('cancel');
      this.addCountValue = null;
      this.addWeightValue = null;
      this.isOpen = false;
    },
    addTallyCountWeights(isAlreadyAdded: boolean) {
      if (!this.addCountValue || !this.addWeightValue) {
        console.error('Zero values, do not add CW');
        return;
      }
      const newCW = {
        weighedCount: this.addCountValue,
        weight: this.addWeightValue,
        isAddedToTally: isAlreadyAdded
      };
      const newHistory: TallyHistory = {
        type: 'Add C+Wt',
        shortCode: this.buttonData.labels.shortCode,
        reason: this.buttonData.labels.reason,
        newValue: 'c: ' + this.addCountValue + ', wt: ' + this.addWeightValue
      };
      this.$store.dispatch('tallyState/addTallyHistory', newHistory);
      this.$store.dispatch('tallyState/addTallyCountWeight', newCW);
      this.addCountValue = null;
      this.addWeightValue = null;
    },
    handleDelete(index: number) {
      const newHistory: TallyHistory = {
        type: 'Del C+Wt',
        shortCode: this.buttonData.labels.shortCode,
        reason: this.buttonData.labels.reason
        // TODO figure out what's deleted, handleDelete parms more than mere index?
        // newValue: 'c: ' + this.addCountValue + ', wt: ' + this.addWeightValue
      };
      this.$store.dispatch('tallyState/addTallyHistory', newHistory);
      this.$store.dispatch('tallyState/deleteTallyCountWeight', index);
    }
  }
});
</script>
<style scoped lang="scss">
th {
  font-size: 20px; // Not working?
}
</style>