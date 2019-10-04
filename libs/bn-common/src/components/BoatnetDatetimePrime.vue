<template>
  <div class="q-pa-sm">
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
Vue.component('pCalendar', Calendar);

@Component
export default class BoatnetDatetimePrime extends Vue {
  @Prop() private config!: string;
  @Prop() private date!: string;
  @Prop() private model!: string;

  get dateVal() {
    if (this.date) {
      return new Date(this.date);
    } else {
      return undefined;
    }
  }

  set dateVal(date: any) {
    this.$emit('update:date', moment(date).format());
  }

  private getDate(value: string) {
    if (value === 'today') {
      return new Date();
    } else if (value === ('departureDate' || 'returnDate') && this.model[value]) {
        return new Date(this.model[value]);
    } else {
        return null;
    }
  }
}
</script>

