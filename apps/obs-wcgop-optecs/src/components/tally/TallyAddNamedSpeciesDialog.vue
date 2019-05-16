<template>
  <q-dialog v-model="isOpen" persistent position="left">
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
        <q-btn flat label="Cancel" @click="close()"/>
        <q-btn flat label="Add" :disabled="!selectedSpecies" @click="addSpecies"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { WcgopAppState } from '../../_store/types';
import { State, Getter, Action } from 'vuex-class';
import { QBtn } from 'quasar';

import { pouchService } from '@boatnet/bn-pouch';

@Component
export default class TallyAddNamedSpeciesDialog extends Vue {
  @Prop() public speciesList!: any[];
  private selectedSpecies: any = null;
  private options: any[] = [];
  private isOpen = false;

  public open() {
    this.selectedSpecies = undefined;
    this.isOpen = true;
  }

  public close() {
    this.$emit('cancel');
    this.isOpen = false;
  }

  public addSpecies() {
    // TODO These are temporary species records.
    this.$emit('addNewSpecies', this.selectedSpecies.doc);
  }

  /**
   * Autocomplete: Search by 4-letter code and common name
   */
  private async filterFn(val: string, update: any, abort: any) {
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
</script>
