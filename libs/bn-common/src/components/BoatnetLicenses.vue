<template>
  <div class="q-col-gutter-md column">
    <span v-for="(certificate, i) in certificates" :key="i">
      <q-input
        outlined
        class="col-2"
        v-model="certificate.certificateNumber"
        label="Permit/ License #"
        debounce="500"
        @input="save"
        @focus="displayKeyboard"
        data-layout="numeric"
      >
        <template v-slot:append>
          <q-btn
            round
            dense
            flat
            :icon="i != 0 ? 'clear' : 'add'"
            @click="i != 0 ? remove(i) : add()"
          />
        </template>
      </q-input>
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { Certificate } from '@boatnet/bn-models';

@Component
export default class BoatnetLicenses extends Vue {
  @Prop({ default: () => [{ certificateNumber: '', certificationId: 0 }] })
  private certificates!: Certificate[];

  private displayKeyboard(event: any) {
    this.$emit('displayKeyboard', event);
  }

  private save() {
    this.$emit('update:certificates', this.certificates);
    this.$emit('save');
  }

  private remove(index: number) {
    this.certificates.splice(index, 1);
    this.$emit('update:certificates', this.certificates);
    this.$emit('save');
  }

  private add() {
    if (this.certificates.length < 7) {
      this.certificates.unshift({});
    } else {
      this.$emit('error', 'Cannot add more than 7 licenses');
    }
  }
}
</script>