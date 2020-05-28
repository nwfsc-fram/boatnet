<template>
  <div class="q-px-md q-py-sm">
    <div>
      <b>{{title}}</b>
    </div>
    <q-btn-toggle
      v-model="valueHolder" toggle-color="primary"
      :options="splitAt ? optionsList.slice(0, splitAt) : optionsList"
      @input="save"
      spread
    />

    <q-btn-toggle
      v-if="splitAt"
      v-model="valueHolder"
      toggle-color="primary"
      :options="optionsList.length - splitAt > splitAt ? optionsList.slice(splitAt, splitAt * 2) : optionsList.slice(splitAt, optionsList.length)"
      @input="save"
      spread
    />

    <q-btn-toggle
      v-if="splitAt && optionsList.length - splitAt > splitAt"
      v-model="valueHolder"
      toggle-color="primary"
      :options="optionsList.slice(splitAt * 2, optionsList.length)"
      @input="save"
      :spread="optionsList.length - (splitAt * 2) > 3"
    />

    <div v-if="this.val && showDescription">{{ getDescription() }}</div>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { get, set } from 'lodash';
import { pouchService, pouchState, PouchDBState } from '@boatnet/bn-pouch';
import { getOptions, formatDisplayValue } from '../helpers/getLookupsInfo';
import { State, Action, Getter, Mutation } from 'vuex-class';
import { AppSettings, BoatnetConfig } from '@boatnet/bn-common';

@Component
export default class BoatnetButtonToggle extends Vue {
  @Prop() private title!: string;
  @Prop() private options!: any[];
  @Prop() private val!: any;

  @Prop() private docType!: string;
  @Prop() private docTypeDb!: string;
  @Prop() private displayFields!: any;
  @Prop() private valueField!: any;
  @Prop() private showDescription!: any;
  @Prop() private splitAt!: number;
  private optionsList: any = [];

  @Getter('appMode', { namespace: 'appSettings' })
  private appMode!: AppSettings;

  private async getList() {
   if (this.docType) {
     let list: any = [];
     if (this.docTypeDb) {
       list = await getOptions(this.appMode.toString(), this.docType, this.docTypeDb, this.displayFields);
     } else {
       list = await getOptions(this.appMode.toString(), this.docType, 'user', this.displayFields);
     }
     for (const row of list) {
        const label = formatDisplayValue(row, [this.displayFields]);
        const value = this.valueField ? formatDisplayValue(row, [this.valueField]) : row.doc;
        const description = get(row, 'doc.' + 'description') ? get(row, 'doc.' + 'description') + ' ' : '';
        this.optionsList.push({ label, value, description });
      }
    } else {
      this.optionsList = this.options;
    }
  }

  private getDescription() {
    if (this.optionsList.filter((row: any) => row.value === this.val).length > 0
      && this.optionsList.filter((row: any) => row.value === this.val)[0].description) {
      return this.optionsList.filter((row: any) => row.value === this.val)[0].description;
    } else {
      return '';
    }
  }

  private created() {
    this.getList();
  }

  get valueHolder() {
    return this.val;
  }
  set valueHolder(value: any) {
    this.$emit('update:val', value);
  }

  private save() {
    this.$emit('save');
  }
}
</script>
