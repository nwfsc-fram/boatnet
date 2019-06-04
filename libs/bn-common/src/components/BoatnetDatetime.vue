<template>
  <div>
    <boatnet-date :dateLabel="dateLabel" :date.sync="date" :showDatePicker="showPopup"/>
    <q-input
      outlined
      class="q-pt-md"
      v-model="time"
      :label="timeLabel"
      mask="time"
      fill-mask
      @focus="displayKeyboard"
      data-layout="numeric"
    />
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
  @Prop() private showPopup!: boolean;

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

  private displayKeyboard(event: any) {
    this.$emit('displayKeyboard', event);
  }
}
</script>
