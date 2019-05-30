<template>
  <q-dialog v-model="isOpen" persistent :position="position">
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Select Species</div>
      </q-card-section>
      <q-select
        outlined
        class="col-2"
        v-model="selectedSpecies"
        label="Species Code / Name"
        use-input
        fill-input
        hide-selected
        clearable
        input-debounce="50"
        :options="options"
        option-value="label"
        @filter="filterFn"
        data-layout="normal"
      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">No results</q-item-section>
          </q-item>
        </template>
      </q-select>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" v-close-popup/>
        <q-btn flat label="Add" :disabled="!selectedSpecies" @click="addSpecies" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.component('boatnet-add-species-dialog', {
  props: {
    // https://vuejs.org/v2/guide/components-props.html
    speciesList: {
      // this seems complicated, not sure if there's a simpler way
      // https://frontendsociety.com/using-a-typescript-interfaces-and-types-as-a-prop-type-in-vuejs-508ab3f83480
      type: Array as () => any[]
    },
    position: {
      type: String,
      default: 'center'
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
    addSpecies() {
      this.$emit('addNewSpecies', this.selectedSpecies.doc);
    },
    async filterFn(val: string, update: any, abort: any) {
      update(async () => {
        const valUpper = val.toUpperCase();
        this.options = this.speciesList
          .filter((s: any) => {
            return (
              s.key.startsWith(valUpper) ||
              s.value.commonName.toUpperCase().indexOf(valUpper) > -1
            );
          })
          .map((s: any) => {
            return {
              label: s.key + ': ' + s.value.commonName,
              ...s
            };
          });
      });
    }
  }
});
</script>