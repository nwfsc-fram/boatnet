<template>
  <div class="q-col-gutter-md column">
    <span v-for="(certificate, i) in certificates" :key="i">
      <q-input
        outlined
        class="col-2"
        v-model="certificates[i]"
        label="Permit/ License #"
        @focus="displayKeyboard"
        data-layout="numeric"
      >
        <template v-slot:append>
          <q-btn round dense flat 
            :icon="i != 0 ? 'clear' : 'add'"
            @click="i != 0 ? remove(i) : add()"/>
        </template>
      </q-input>
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { AlertState } from '@/_store/types';

@Component
export default class BoatnetLicenses extends Vue {
  @Prop() private certificates!: string[];
  @Action('error', { namespace: 'alert' }) private errorAlert: any;

  private displayKeyboard(event: any) {
    this.$emit('displayKeyboard', event);
  }

  private remove(index: number) {
    this.certificates.splice(index, 1);
  }

  private add() {
    if (this.certificates.length < 7) {
      this.certificates.unshift('');
    } else {
      this.errorAlert('Cannot add more than 7 licenses');
    }
  }
}
</script>


   