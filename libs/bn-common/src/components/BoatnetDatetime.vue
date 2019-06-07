<template>
  <div>
    <boatnet-date :dateLabel="dateLabel" :date.sync="date"/>
    <div class="q-pt-md">
      <boatnet-keyboard-input :value.sync="time" :label="timeLabel" keyboardType="numeric" mask="time"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import moment from 'moment';

@Component
export default class BoatnetDatetime extends Vue {
  @Prop() private dateLabel!: string;
  @Prop() private timeLabel!: string;
  @Prop() private value!: string;

  get date() {
    return this.value ? moment(this.value).format('YYYY/MM/DD') : '';
  }
  set date(dateVal: string) {
    this.update(dateVal, this.time);
  }

  get time() {
    return this.value ? moment(this.value).format('HH:mm') : '';
  }
  set time(timeVal: string) {
    this.update(this.date, timeVal);
  }

  private update(dateVal: string, timeVal: string) {
    const datetime = dateVal + ' ' + timeVal;
    const formattedDateTime = moment(datetime, 'YYYY/MM/DD HH:mm').format();
    this.$emit('update:value', formattedDateTime);
    this.$emit('save', formattedDateTime);
  }
}
</script>
