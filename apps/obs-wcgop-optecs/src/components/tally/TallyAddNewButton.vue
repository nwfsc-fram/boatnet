<template>
  <q-btn-group spread>
    <template v-for="reason in reasons">
    <tally-control-btn control-name="asdf" color="grey-4" :key="`${reason}`" @controlclick="handleControlClick">
      {{species}}
      <br>{{reason}}
    </tally-control-btn>
    </template>
    <tally-control-btn color="red-5" textcolor="white" control-name="cancel" @controlclick="handleControlClick" >Cancel</tally-control-btn>
  </q-btn-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import TallyControlBtn from './TallyControlBtn.vue';
Vue.component('tally-control-btn', TallyControlBtn);

@Component
export default class TallyAddNewButton extends Vue {
  @Prop({ default: undefined }) public species!: string; // TODO probably pass actual record
  public reasons: string[] = [
  'SFTY',
  'DOCK',
  'ACCI',
  'USED',
  'OTHR',
  'REG',
  'DROP',
  'PRED',
  'MKT',
  'RET'
  ];


  public handleControlClick(controlName: string): void {
    switch (controlName) {
      case 'cancel':
        this.$emit('cancel');
        break;
      default:
        console.log('TODO UNHANDLED ADD NEW', controlName);
    }
  }
}
</script>
