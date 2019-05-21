<template>
  <q-dialog v-model="show" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="red" text-color="white"/>
        <span class="q-ml-sm">{{message}}</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" @click="close"/>
        <q-btn flat label="Delete" color="primary" @click="confirmDelete"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>


<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class BoatnetDeleteDialog extends Vue {
  @Prop() private message!: string;
  @Prop({ default: false }) private show!: boolean;

  private close() {
    this.$emit('update:show', false);
  }

  private confirmDelete() {
    this.$emit('confirmDelete');
    this.close();
  }
}
</script>