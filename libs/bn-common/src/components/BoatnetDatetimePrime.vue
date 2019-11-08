<template>
  <div class="q-px-md q-py-sm">
    <div class="text-bold">{{ config.displayName }}</div>
    <pCalendar
      v-model="dateVal"
      :showTime="config.showTime"
      :timeOnly="config.timeOnly"
      :hourFormat="config.hourFormat"
      :minDate="getDate(config.minDate)"
      :maxDate="getDate(config.maxDate)"
      :inline="config.inline"
      :touchUI="config.touch"
      onfocus="blur()"
      />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import moment from 'moment';

import Calendar from 'primevue/calendar';
import { get, set } from 'lodash';

Vue.component('pCalendar', Calendar);

@Component
export default class BoatnetDatetimePrime extends Vue {
  @Prop() private config!: any;
  @Prop() private model!: any;

  get dateVal() {
    const date = get(this.model, this.config.modelName);
    if (date) {
      return new Date(date);
    } else {
      return undefined;
    }
  }

  set dateVal(date: any) {
    const modelName = this.config ? this.config.modelName : '';
    const model: any = this.model;
    const fields = modelName.split('.');

    if (fields.length > 1) {
      const newObjName = modelName.slice(modelName.indexOf('.') + 1);
      const newObj = set({}, newObjName, date);
      Vue.set(model, fields[0], newObj);
    } else {
      Vue.set(model, modelName, date);
    }
    this.$emit('save');
  }

  private getDate(value: string) {
    const date = get(this.model, this.config.modelName);
    if (value === 'today') {
      return new Date();
    } else if (value === ('departureDate' || 'returnDate') && date) {
        return new Date(date);
    } else {
        return null;
    }
  }
}
</script>

