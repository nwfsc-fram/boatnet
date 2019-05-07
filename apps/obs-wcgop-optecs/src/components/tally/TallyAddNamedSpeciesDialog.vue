<template>
  <q-dialog v-model="isOpen" persistent position="left">
    <q-card style="min-width: 300px">
      <q-card-section>
        <div class="text-h6">Add Named Species</div>
      </q-card-section>

      <!-- <q-card-section>
        <q-input dense v-model="newMessage" autofocus @keyup.enter="addMessage"/>
      </q-card-section>-->

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="Cancel" @click="close()"/>
        <q-btn flat label="Add"/>
        <!-- @click="addMessage"/> -->
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';
import { WcgopAppState } from '../../_store/types';
import { State, Getter, Action } from 'vuex-class';
import { QBtn } from 'quasar';
import { TallyButtonData } from '../../_store/types';

@Component
export default class TallyAddNamedSpeciesDialog extends Vue {
  // @Prop() public enabled!: boolean;

  private isOpen = false;

  public open() {
    this.isOpen = true;
  }

  public close() {
    this.isOpen = false;
  }
}
</script>
