<template>
  <div class="centered-page-item">
    <div class="q-pa-md q-gutter-sm">
      <q-banner class="bg-cyan-2 text-body1 justify-around" style="border: 1px solid black">
        <p><font size="4"><b>Declaration recieved!</b></font></p>

        <p>
          Thank you for declaring your trip.
          <b>
            Vessel {{ vessel.activeVessel['vesselName'] }}
            ({{ activeVesselId }})
          </b> is declared into declaration/s
          <b>{{ oleVessel.activeDeclarations.map(a => a.declarationCode + ':' + a.declarationDescrip).join(', ') }}</b> as of
          <b>{{ formatDateTime(oleVessel.activeDeclarations[0].transactionDate) }}</b>.
        </p>

        <p>
          If your trip started prior to the date of this declaration,
          please call the Office of Law Enforcement at 888-585-5518.
        </p>

        <p>
          Your Confirmation Number is:
          <q-banner><b>3334562</b></q-banner>
        </p>
      </q-banner>
    </div>

    <q-btn
      class="bg-primary text-white q-ma-md"
      color="primary"
      to="/declarations"
    >Return to Declarations Home</q-btn>
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

import { Vessel, OLEVessel, Declaration } from '@boatnet/bn-models';

// TODO: use confirmation number from OLE Vessel table,
// Should also have a step that holds off on confirmation
// Until insert happens succesfully, and alternate error
// text needs to be setup.
@Component
export default class Declarations extends Vue {
  @State('vessel') private vessel!: VesselState;
  @State('user') private user!: UserState;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;

  private userRoles: string[] = [];
  private authorizedVessels: Vessel[] = [];
  private oleDoc: OLEVessel = {};
  private dbReturn: any = null;
  private activeVesselId: string = '';

  private formatDateTime(date: any) {
    return moment(date).format('MM/DD/YYYY, HH:mm');
  }

  private async getOleVessel() {
    console.log('fetching declarations from couch');
    try {
      const masterDB: Client<any> = couchService.masterDB;

      const options = {
        include_docs: true,
        key: this.activeVesselId
      };
      const vessels: any = await masterDB.view<any>(
        'OLEDeclarations',
        'all_ole_vessels',
        options
      );
      for (const v of vessels.rows) {
        this.oleDoc = v.doc;
      }
      return vessels;
    } catch (err) {
      this.errorAlert(err);
    }
  }

  private get oleVessel(): OLEVessel {
    return this.oleDoc;
  }

  private created() {
    this.activeVesselId = this.vessel.activeVessel.coastGuardNumber
      ? this.vessel.activeVessel.coastGuardNumber
      : this.vessel.activeVessel.stateRegulationNumber;
    if (authService.getCurrentUser()) {
      this.userRoles = JSON.parse(
        JSON.stringify(authService.getCurrentUser()!.roles)
      );
    }
    try {
      this.dbReturn = this.getOleVessel();
    } catch (err) {
      console.log('failed couch attempt');
    }
  }
}
</script>
