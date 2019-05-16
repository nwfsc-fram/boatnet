<template>
  <div class="q-col-gutter-md column">
    <boatnet-date :dateLabel="dateLabel" :value.sync="value"/>
    <q-input
      outlined
      class="col-2"
      v-model="time"
      :label="timeLabel"
      mask="##:##:##"
      fill-mask
      debounce="500"
      @input="saveDateTime"
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

  private date: any = this.value
    ? moment(this.value, 'YYYY/MM/DD').format('YYYY/MM/DD')
    : null;
  private time: any = this.value
    ? moment(this.value, 'HH:mm:ss').format('HH:mm:ss')
    : null;

  private saveDateTime() {
    let datetime;
    if (this.date && this.date.indexOf('_') === -1) {
      if (!moment(this.date, 'YYYY/MM/DD').isValid()) {
        this.$emit('error', 'Invalid Date');
        return;
      }
    }
    if (this.time && this.time.indexOf('_') === -1) {
      if (!moment(this.time, 'HH:mm:ss').isValid()) {
        this.$emit('error', 'Invalid Time');
        return;
      }
    }
    if (this.date && this.time && this.time.indexOf('_') === -1) {
      datetime = this.date + ' ' + this.time;
      this.$emit('save', moment(datetime, 'YYYY/MM/DD HH:mm:ss').format());
    }
  }

  private displayKeyboard(event: any) {
    this.$emit('displayKeyboard', event);
  }
}
</script>
