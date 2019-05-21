<template>
  <div>
    <q-input
      outlined
      class="col-2"
      :label="dateLabel"
      v-model="dateVal"
      mask="date"
      fill-mask
      @focus="show"
    >
      <template min-width="290px">
        <q-popup-proxy v-if="status" :breakpoint="1024">
          <q-date v-model="dateVal" :default-year-month="defaultMonthYear" @input="hide"/>
        </q-popup-proxy>
      </template>
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer"></q-icon>
      </template>
    </q-input>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import moment from 'moment';

@Component
export default class BoatnetDate extends Vue {
  @Prop() private dateLabel!: string;
  @Prop() private date!: string;

  private status: boolean = false;
  private defaultMonthYear: string = moment().format('YYYY/MM');

  get dateVal() {
    return this.date;
  }
  set dateVal(date: string) {
    this.$emit('update:date', date);
  }

  private show() {
    this.status = true;
  }

  private hide() {
    this.status = false;
  }
}
</script>
