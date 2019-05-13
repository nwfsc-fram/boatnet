<template>
  <div class="q-col-gutter-md column">
    <q-input
      outlined
      class="col-2"
      :label="dateLabel"
      v-model="date"
      mask="date"
      fill-mask
      @focus="show"
      debounce="500"
      @input="saveDateTime"
    >
      <template min-width="290px">
        <q-popup-proxy v-if="status" :breakpoint="1024">
          <q-date v-model="date" :default-year-month="defaultMonthYear" @input="hide"/>
        </q-popup-proxy>
      </template>
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer"></q-icon>
      </template>
    </q-input>
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

  private status: boolean = false;
  private defaultMonthYear: string = moment().format('YYYY/MM');
  private date: any = this.value
    ? moment(this.value, 'YYYY/MM/DD').format('YYYY/MM/DD')
    : null;
  private time: any = this.value
    ? moment(this.value, 'HH:mm:ss').format('HH:mm:ss')
    : null;

  private show() {
    this.status = true;
  }

  private hide() {
    this.status = false;
    this.saveDateTime();
  }

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
