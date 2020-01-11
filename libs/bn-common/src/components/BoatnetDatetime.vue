<template>
  <div>
    <boatnet-datetime-prime :config="config" :date.sync="date"></boatnet-datetime-prime>
    <boatnet-keyboard-select-list
      :val.sync="time"
      :displayName="label + ' Time'"
      keyboardType="numeric"
      mask="time"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import moment from 'moment';

@Component
export default class BoatnetDatetime extends Vue {
  @Prop() private label!: string;
  @Prop() private value!: string;

  private config = {
    showTime: false,
    timeOnly: false,
    displayName: this.label + ' Date',
    maxDate: 'today'
  };

  get date() {
    if (this.value && this.value.indexOf('-') !== -1) {
      return moment(this.value).format('YYYY/MM/DD');
    } else {
      return '';
    }
  }
  set date(dateVal: any) {
    this.update(dateVal, this.time);
  }

  get time() {
    if (!this.value) {
      return '';
    }
    if (this.value.indexOf('-') !== -1) {
      const formattedTime = moment(this.value).format('HH:mm');
      return formattedTime === '00:00' ? '' : formattedTime;
    } else {
      return this.value;
    }
  }
  set time(timeVal: string) {
    this.update(this.date, timeVal);
  }

  private update(dateVal: string, timeVal: string) {
    let formattedDateTime;
    if (dateVal.length === 0) {
      formattedDateTime = timeVal;
    } else if (timeVal.length === 0) {
      formattedDateTime = moment(dateVal).toISOString();
    } else {
      const timeArr = timeVal.split(':');
      formattedDateTime = moment(dateVal)
        .add(timeArr[0], 'h')
        .add(timeArr[1], 'm')
        .toISOString();
    }
    console.log('formatted date ' + formattedDateTime);
    this.$emit('update:value', formattedDateTime);
    this.$emit('save', formattedDateTime);
  }
}
</script>
