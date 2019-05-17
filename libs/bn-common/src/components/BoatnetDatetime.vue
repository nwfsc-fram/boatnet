<template>
  <div class="q-col-gutter-md column">
    <boatnet-date :dateLabel="dateLabel" :date.sync="date" @save="saveDateTime"/>
    <q-input
      outlined
      class="col-2"
      v-model="time"
      :label="timeLabel"
      mask="##:##"
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
    ? moment(this.value).format('YYYY/MM/DD')
    : null;
  private time: any = this.value
    ? moment(this.value).format('HH:mm')
    : null;

  private saveDateTime() {
    const datetime = this.date + ' ' + this.time;
    this.$emit('save', moment(datetime, 'YYYY/MM/DD HH:mm').format());
  }

  private displayKeyboard(event: any) {
    this.$emit('displayKeyboard', event);
  }
}
</script>
