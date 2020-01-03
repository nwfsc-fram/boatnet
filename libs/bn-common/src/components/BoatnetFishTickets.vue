<template>
  <span>
    <div class="text-h6 col-2">{{config.name}}</div>
    <boatnet-table
      :data="fishTickets"
      :settings="config.tableSettings"
      :showBottom="true"
      :isCondensed="true"
      @select="selectTicket"
    />

    <div class="row q-gutter-sm q-pa-md justify-center">
      <q-btn color="primary" label="Add" @click="addRow"/>
      <q-btn color="primary" label="Edit" @click="editRow" :disabled="selected.length <= 0"/>
      <q-btn color="primary" label="Delete" @click="deleteRow" :disabled="selected.length <= 0"/>
    </div>

    <boatnet-input-dialog
      :title="action === 'add' ? 'Add ' + config.name : 'Edit ' + config.name"
      :show.sync="showDialog"
      @save="action === 'add' ? saveAdd() : saveEdit()"
    >
     <div style=" height: 200px">
          <div v-for="config1 of config.formConfig" :key="config.formConfig.indexOf(config1)">
            <boatnet-common-input-component :config="config1" :model="currFishTicket"></boatnet-common-input-component>
          </div>
        </div>
    </boatnet-input-dialog>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { WcgopFishTicket } from '@boatnet/bn-models';
import moment from 'moment';
import { TripState, AppSettings, BoatnetConfig } from '@boatnet/bn-common';
import { Action, Getter, State } from 'vuex-class';
import { get, } from 'lodash';

@Component
export default class BoatnetFishTickets extends Vue {
  @Prop({ default: () => [] }) private fishTickets!: any[];
  @Prop() private configName!: string;

  private selected: any[] = [];
  private showDialog: boolean = false;
  private action = '';
  private index: number = -1;

  private currFishTicket: any = {};

  @Getter('appConfig', { namespace: 'appSettings' })
  private appConfig!: BoatnetConfig;
  private config: any;

  private created() {
    this.config = get(this.appConfig, this.configName);
  }

  private selectTicket(row: any) {
    this.selected = row ? [row] : [];
    this.currFishTicket = row ? row : {};
    this.index = this.currFishTicket ? this.fishTickets.indexOf(this.currFishTicket) : -1;
  }

  private addRow() {
    this.currFishTicket = {};
    this.action = 'add';
    this.showDialog = true;
  }

  private editRow() {
    this.action = 'edit';
    this.showDialog = true;
    if (this.selected.length > 0) {
      const temp = JSON.stringify(this.currFishTicket);
      this.currFishTicket = JSON.parse(temp);
    }
  }

  private deleteRow() {
    if (this.selected.length > 0) {
      this.fishTickets.splice(this.index, 1);
      this.$emit('update:fishTickets', this.fishTickets);
      this.$emit('save');
    }
  }

  private saveAdd() {
    this.fishTickets.push(this.currFishTicket);
    this.$emit('update:fishTickets', this.fishTickets);
    this.showDialog = false;
    this.$emit('save');
  }

  private saveEdit() {
    this.fishTickets.splice(this.index, 1, this.currFishTicket);
    this.showDialog = false;
    this.$emit('update:fishTickets', this.fishTickets);
    this.$emit('save');
    this.selected = [];
  }
}
</script>