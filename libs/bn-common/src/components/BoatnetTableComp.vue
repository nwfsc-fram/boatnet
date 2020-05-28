<template>
  <span>
    <b class="col-2">{{config.name}}</b>
    <boatnet-table
      :data="data"
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
      :settings="dialogSettings"
      :show.sync="showDialog"
      @save="action === 'add' ? saveAdd() : saveEdit()"
    >
     <div style="display: flex; flex-flow: column wrap; align-items: stretch;">
          <div v-for="config1 of config.formConfig" :key="config.formConfig.indexOf(config1)">
            <boatnet-common-input-component :config="config1" :model="currRow"></boatnet-common-input-component>
          </div>
        </div>
    </boatnet-input-dialog>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit, Watch } from 'vue-property-decorator';
import moment from 'moment';
import { TripState, AppSettings, BoatnetConfig } from '@boatnet/bn-common';
import { Action, Getter, State } from 'vuex-class';
import { get, } from 'lodash';

@Component
export default class BoatnetTableComp extends Vue {
  @Prop({ default: () => [] }) private data!: any[];
  @Prop() private configName!: string;

  private selected: any[] = [];
  private showDialog: boolean = false;
  private action = '';
  private index: number = -1;

  private currRow: any = {};

  @Getter('appConfig', { namespace: 'appSettings' })
  private appConfig!: BoatnetConfig;
  private config: any;

  @Getter('appMode', { namespace: 'appSettings' })
  private appMode!: AppSettings;

  private created() {
    this.config = get(this.appConfig, this.configName);
    if (this.config.width) {
      this.dialogSettings.width = this.config.width;
    }
    if (this.config.height) {
      this.dialogSettings.height = this.config.height;
    }
  }

  private dialogSettings = {
    title: this.action ? (this.action === 'add' ? 'Add ' + this.config.name : 'Edit ' + this.config.name) : '',
    width: 600,
    height: 600,
    confirmationLabel: 'Yes'
  };

  private selectTicket(row: any) {
    this.selected = row ? [row] : [];
    this.currRow = row ? row : {};
    this.index = this.currRow ? this.data.indexOf(this.currRow) : -1;
  }

  private addRow() {
    this.currRow = {};
    this.action = 'add';
    this.showDialog = true;
  }

  private editRow() {
    this.action = 'edit';
    this.showDialog = true;
    if (this.selected.length > 0) {
      const temp = JSON.stringify(this.currRow);
      this.currRow = JSON.parse(temp);
    }
  }

  private deleteRow() {
    if (this.selected.length > 0) {
      this.data.splice(this.index, 1);
      this.$emit('update:data', this.data);
      this.$emit('save');
    }
  }

  private saveAdd() {
    this.data.push(this.currRow);
    this.$emit('update:data', this.data);
    this.showDialog = false;
    this.$emit('save');
  }

  private saveEdit() {
    this.data.splice(this.index, 1, this.currRow);
    this.showDialog = false;
    this.$emit('update:data', this.data);
    this.$emit('save');
    this.selected = [];
  }

  @Watch('action')
  private handler2(newVal: string, oldVal: string) {
    if (newVal === 'add') {
      this.dialogSettings.title = 'Add ' + this.config.name;
      if (this.appMode.toString() === 'wcgop') {
        this.dialogSettings.confirmationLabel = 'Add';
      }
    } else if (newVal === 'edit') {
      this.dialogSettings.title = 'Edit ' + this.config.name;
      if (this.appMode.toString() === 'wcgop') {
        this.dialogSettings.confirmationLabel = 'Update';
      }
    }
  }

}
</script>