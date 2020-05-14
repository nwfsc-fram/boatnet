<template>
  <div class="q-gutter-md q-pa-md">
    <q-table
      title="Current EFPs"
      :data="tableData"
      :columns="columns"
      row-key="efpName"
      selection="single"
      :selected.sync="selected"
    >
      <template v-slot:top>
        <div class="text-h6 text-primary">Current EFPs</div>
        <q-space />
        <q-btn
          class="center"
          dense
          color="primary"
          label="Delete EFP"
          :disable="selected.length === 0"
          @click="deleteEFP"
        />
      </template>
    </q-table>

    <q-separator color="primary" inset />

    <div class="text-h6 text-primary">Add New EFP</div>
    <div class="row no-wrap q-gutter-md">
      <q-input v-model="newEfpName" label="EFP Name" stack-label dense style="width: 250px" />
      <q-select
        stack-label
        v-model="newDecs"
        dense
        multiple
        :options="currentDecs"
        label="Dec Codes"
        style="width: 250px"
      />
      <q-btn
        class="bg-green text-white"
        @click="saveEFP"
        :disable="(newEfpName === '') || (newDecs.length < 1)"
      >Submit</q-btn>
    </div>
  </div>
</template>

<script  lang="ts">
import { mapState } from 'vuex';
import router from 'vue-router';
import { State, Action, Getter } from 'vuex-class';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { VesselState, UserState, AlertState } from '../_store/types/types';

import moment from 'moment';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { couchService } from '@boatnet/bn-couch';
import { AuthState, authService } from '@boatnet/bn-auth';
import { Notify } from 'quasar';
import { Vessel, OLEVessel, Declaration, OLEEFPs } from '@boatnet/bn-models';

/* tslint:disable:no-var-requires  */
const dropdownTree = require('../assets/declarationsWorksheetVault.json');

interface SelectedRow {
  efpName: string;
  decCodes: string[];
}

@Component
export default class OLEEFPManagement extends Vue {
  @State('user') private user!: UserState;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;

  private userRoles: string[] = [];
  private tableData: object[] = [];
  private selected: SelectedRow[] = [];
  private newEfpName: string = '';
  private newDecs: [] = [];
  private newEFP: {} = {};
  private efpCouchDoc: OLEEFPs = { efpCollection: { temp: [] } };
  private currentDecs = Object.keys(dropdownTree['Leaf Nodes']);

  private columns = [
    {
      name: 'efpName',
      align: 'left',
      label: 'EFP Name',
      field: 'efpName',
      sortable: true
    },
    {
      name: 'decCodes',
      align: 'left',
      label: 'Declaration Codes',
      field: 'decCodes',
      sortable: true
    }
  ];

  private async updateCouchEFP() {
    // Update couch
      const masterDB = couchService.masterDB;
      const out = await masterDB.post(this.efpCouchDoc).then(
        setTimeout(() => {
          this.$q.notify({
            color: 'green-4',
            textColor: 'white',
            icon: 'cloud_done',
            message: 'EFPs updated, refetching'
          });
        }, 500)
      );

      // Refetch doc
      try {
        const options = {
          include_docs: true,
          key: null
        };
        const efpResult: any = await masterDB.view(
          'OLEDeclarations',
          'oleefps',
          options
        );

        this.efpCouchDoc = efpResult.rows[0].doc;
      } catch (err) {
        this.errorAlert(err);
      }

      this.reassignTableData();
  }

  private async saveEFP() {
    if (this.newEfpName !== '') {
      this.efpCouchDoc.efpCollection[String(this.newEfpName)] = this.newDecs;
      this.updateCouchEFP();
    }
  }

  private notifySuccess(message: string) {
    Notify.create({
      message: 'Success: ' + message,
      position: 'top-right',
      color: 'green',
      timeout: 2000,
      icon: 'check',
      multiLine: true
    });
  }

  private reassignTableData() {
    this.tableData = [];
    for (const key of Object.keys(this.efpCouchDoc.efpCollection)) {
      const obj = {
        efpName: key,
        decCodes: this.efpCouchDoc.efpCollection[key].join(', ')
      };
      this.tableData.push(obj);
    }
  }

  private async deleteEFP() {
    // delete entry
    delete this.efpCouchDoc.efpCollection[this.selected[0].efpName];

    // update and refetch couch
    await this.updateCouchEFP();

    this.selected = [];
  }

  private async created() {
    if (authService.getCurrentUser()) {
      this.userRoles = JSON.parse(
        JSON.stringify(authService.getCurrentUser()!.roles)
      );
    }

    try {
      const masterDB = couchService.masterDB;

      const options = {
        include_docs: true,
        key: null
      };
      const efpResult: any = await masterDB.view(
        'OLEDeclarations',
        'oleefps',
        options
      );

      this.efpCouchDoc = efpResult.rows[0].doc;
    } catch (err) {
      this.errorAlert(err);
    }

    this.reassignTableData();
  }
}
</script>
