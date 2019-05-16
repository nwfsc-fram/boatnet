<template>
  <q-dialog v-model="show" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h6">{{title}}</div>
      </q-card-section>

      <q-card-section class="row items-center">
        <div class="q-gutter-sm q-pa-md">
          <slot></slot>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="close"/>
        <q-btn flat label="Save" color="primary" @click="save"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class BoatnetInputDialog extends Vue {
  @Prop() private title!: string;
  @Prop({ default: false }) private show!: boolean;

  private close() {
    this.$emit('update:show', false);
  }

  private save() {
    this.$emit('save');
    this.close();
  }
}
</script>