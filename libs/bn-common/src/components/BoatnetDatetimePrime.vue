<template>
  <div class="q-px-md q-py-sm">
    <div>
      <b>{{ config.displayName }}</b>
    </div>
    <div :class="{active: config.inline}">
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
        id="date"
      />
    </div>
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
  @Prop() private date!: any;

  get dateVal() {
    if (this.date) {
      return new Date(this.date);
    } else {
      return undefined;
    }
  }

  set dateVal(date: any) {
    date = moment(date).toString();
    this.$emit('update:date', date);
    this.$emit('save');
  }

  private getDate(value: string) {
    if (value === 'today') {
      return new Date();
    } else if (value === ('departureDate' || 'returnDate') && this.date) {
      return new Date(this.date);
    } else {
      return null;
    }
  }
}
</script>
<style>
.p-calendar,
.p-inputtext {
  width: 100%;
  height: 40px;
}
.active {
  height: 375px;
}

</style>
