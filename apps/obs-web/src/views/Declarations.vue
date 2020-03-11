<template>
  <div>
    <p>
      If you would like to make your declaration/s by phone, please call the Office
      of Law Enforcement at
      <a
        href="tel: 888-585-5518"
        data-rel="external"
      >888-585-5518</a>
    </p>
    <br />

     <div class="centered-page-item q-pa-md q-gutter-sm">
        <q-select
          v-model="vessel.activeVessel"
          label="Vessel"
          dense
          use-input
          fill-input
          hide-selected
          :options="authorizedVessels"
          :option-label="opt => opt.vesselName + ' (' + (opt.coastGuardNumber ? opt.coastGuardNumber : opt.stateRegulationNumber)  + ')'"
          option-value="_id"
        ></q-select>
      </div>

    <div class="centered-page-item" v-if="vessel.activeVessel">

      <div class="centered-page-item">{{vessel.activeVessel['vesselName']}}</div>

      <br />

      <q-btn class="bg-primary text-white q-ma-md" to="/declaration-cart">New Declaration</q-btn>

      <br />

      <div class="centered-page-item">Active Declarations</div>

      <div v-if="Object.keys(oleVessel.activeDeclarations).length > 0">
        <div class="q-pa-md column">
          <q-card
            v-for="(obj, index) in oleVessel.activeDeclarations"
            :key="index"
            class="my-card bg-primary text-white"
          >
            <q-card-section>
              <div class="text-h6">{{ obj["declarationCode"] }}</div>
              <div style="font-size: 14px">{{ obj["declarationDescrip"] }}</div>
              <div
                v-if="'activityDescrip' in obj"
                style="font-size: 14px"
                class="text-overflow: ellipsis"
              >Note: {{ obj["activityDescrip"] }}</div>
              <div style="font-size: 14px">Start Date: {{ formatDateTime(obj["transactionDate"]) }}</div>
              <div
                v-show="obj['observerStatus'] !== 'N/A'"
                style="font-size: 14px"
              >Observer Status: {{ obj["observerStatus"] }}</div>
              <div style="font-size: 14px">Confirmation Number:</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div v-else class="centered-page-item text-primary">No active declarations for this vessel.</div>
      <br />
      <div class="centered-page-item">Past Declarations</div>

      <div v-if="Object.keys(oleVessel.deactivatedDeclarations).length > 0">
        <div class="q-pa-md column">
          <q-card
            v-for="(obj, index) in oleVessel.deactivatedDeclarations"
            :key="index"
            class="my-card bg-blue-grey-4 text-white"
          >
            <q-card-section>
              <div class="row no-wrap">
                <div class="col-md-4 text-h6">{{ obj["declarationCode"] }}</div>
                <div
                  class="col-md-4 offset-9"
                  style="font-size: 18px; line-height: 4px; margin-bottom: 10px"
                >
                  <q-badge v-if="cartContains(obj)" color="green" align="top">In Cart</q-badge>
                  <q-btn
                    v-if="!cartContains(obj)"
                    class="bg-primary justify-end"
                    size="12px"
                    round
                    icon="add_shopping_cart"
                    @click="addToCart(obj)"
                  />
                </div>
              </div>
              <div style="font-size: 14px">{{ obj["declarationDescrip"] }}</div>
              <div
                v-if="'activityDescrip' in obj"
                style="font-size: 14px"
                class="text-overflow: ellipsis"
              >Note: {{ obj["activityDescrip"] }}</div>
              <div style="font-size: 14px">Start Date: {{ formatDateTime(obj["transactionDate"]) }}</div>
              <div
                style="font-size: 14px"
                v-show="obj['observerStatus'] !== 'N/A'"
              >Observer Status: {{ obj["observerStatus"] }}</div>
              <div style="font-size: 14px">Confirmation Number:</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div v-else class="centered-page-item text-primary">No past declarations for this vessel.</div>

      <q-dialog v-model="obsPrompt" persistent>
        <q-card class="q-gutter-sm">
          <q-card-section>
            <div class="text-h6">Observer status for this declaration?</div>
          </q-card-section>

          <q-select filled v-model="newObsStatus" :options="obsOptions"></q-select>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn
              flat
              label="Okay"
              :disable="newObsStatus.length < 1"
              v-close-popup
              @click="newObsChosen()"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="gearPrompt" persistent>
        <q-card class="q-gutter-sm">
          <q-card-section>
            <div class="text-h6">Describe Activity/Gear/Fishery</div>
          </q-card-section>

          <q-input
            stack-label
            v-model="newGearNote"
            filled
            type="textarea"
            lazy-rules
            :rules="[val => val.length >= 3 || 'Sufficient details required for other gear type declaration']"
          />

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn
              flat
              label="Okay"
              :disable="newGearNote.length < 3"
              v-close-popup
              @click="newOtherGearChosen()"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
    <div v-else>
      <p class="centered-page-item text-primary">No active vessel</p>
    </div>
  </div>
</template>


<script  lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { State, Action, Getter } from 'vuex-class';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { Notify } from 'quasar';
import { VesselState, UserState, AlertState } from '../_store/types/types';
import moment from 'moment';

import { Vessel, OLEVessel, Declaration } from '@boatnet/bn-models';

import { couchService } from '@boatnet/bn-couch';
import { AuthState, authService } from '@boatnet/bn-auth';

/* tslint:disable:no-var-requires  */
const dropdownTree = require('../assets/declarationsWorksheetVault.json');

@Component
export default class Declarations extends Vue {
  @State('vessel') private vessel!: VesselState;
  @State('user') private user!: UserState;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;

  private userRoles: string[] = [];
  private authorizedVessels: Vessel[] = [];
  private oleDoc: OLEVessel = {};
  private dbReturn: any = null;
  private obsPrompt: boolean = false;
  private newObsStatus: string = '';
  private gearPrompt: boolean = false;
  private newGearNote: string = '';
  private activeVesselId: string = '';
  private storeNewDec: Declaration = {
    type: 'ole-declaration',
    declarationCode: 999,
    declarationDescrip: '',
    observerStatus: 'N/A'
  };
  private dualRules: any = dropdownTree['Allowed Dual Declarations'];
  private ifqSet: Set<string> = new Set(dropdownTree['IFQ Fisheries']);
  private obsOptions: string[] = dropdownTree['Observed Options'];

  private async getAuthorizedVessels() {
    this.authorizedVessels = [];

    const masterDb: Client<any> = couchService.masterDB;

    const queryOptions = {
      key: 'vessel-permissions',
      reduce: false,
      include_docs: true
    };
    const permissionsQuery: any = await masterDb.view(
      'obs_web',
      'all_doc_types',
      queryOptions
    );

    console.log(permissionsQuery);

    const permissionsDoc = permissionsQuery.rows[0].doc;

    const vesselPermissions = [];

    for (const vessel of permissionsDoc.vesselAuthorizations) {
      for (const person of vessel.authorizedPeople) {
        if (person === this.user.activeUserAlias._id) {
          vesselPermissions.push(vessel.vesselIdNum);
        }
      }
    }

    for (const vesselId of vesselPermissions) {
      const vesselQueryOptions = {
        key: vesselId,
        reduce: false,
        include_docs: true
      };

      const vesselQuery: any = await masterDb.view(
        'obs_web',
        'all_vessel_nums',
        vesselQueryOptions
      );

      this.authorizedVessels.push(vesselQuery.rows[0].doc);
    }
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

  private isAuthorized(authorizedRoles: string[]) {
    for (const role of authorizedRoles) {
      if (this.userRoles.includes(role)) {
        return true;
      }
    }
    return false;
  }

  private cartContains(newDeclaration: Declaration) {
    for (const cartDecs of this.oleVessel.cartDeclarations!) {
      if (newDeclaration.declarationCode === cartDecs.declarationCode) {
        return true;
      }
    }
    return false;
  }

  // Check for conflicting declarations, and add to cart if passes
  private addToCart(copyDec: Declaration) {
    const newDeclaration = { ...copyDec };
    const okayArray: number[] = this.dualRules[newDeclaration.declarationCode];
    for (const cartDec of this.oleVessel.cartDeclarations!) {
      if (!okayArray.includes(cartDec.declarationCode)) {
        this.$q.notify({
          color: 'red-5',
          textColor: 'white',
          icon: 'warning',
          message:
            'Declaration ' +
            newDeclaration.declarationCode +
            ' is incompatible with Declaration ' +
            cartDec.declarationCode +
            ' in the cart.'
        });
        return;
      }
    }
    // Store new dec for insertion later
    delete newDeclaration.transactionDate;
    this.storeNewDec = newDeclaration;

    // If observer question applies, ask user again to provide
    if (this.ifqSet.has(String(newDeclaration.declarationCode))) {
      this.obsPrompt = true;
      return;
    } else if (String(newDeclaration.declarationCode) === '269') {
      this.gearPrompt = true;
      return;
    } else {
      this.finishAddingToCart();
    }
  }

  private newObsChosen() {
    this.storeNewDec.observerStatus = this.newObsStatus;
    this.newObsStatus = '';
    this.obsPrompt = false;
    this.finishAddingToCart();
  }

  private newOtherGearChosen() {
    this.storeNewDec.activityDescrip = this.newGearNote;
    this.newGearNote = '';
    this.gearPrompt = false;
    this.finishAddingToCart();
  }

  // Had to split this part out so that qdialog could finish the add
  // to cart process as well.
  private async finishAddingToCart() {
    // Add new dec to oleVessel
    if (this.oleVessel.cartDeclarations!.length > 0) {
      this.oleVessel.cartDeclarations = this.oleVessel.cartDeclarations!.concat(
        this.storeNewDec
      );
    } else {
      this.oleVessel.cartDeclarations = [this.storeNewDec];
    }

    // Update couch
    const masterDB = couchService.masterDB;
    const out = await masterDB.post(this.oleVessel).then(
      setTimeout(() => {
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Added to Cart'
        });
      }, 500)
    );

    // Refetch doc
    try {
      this.dbReturn = this.getOleVessel();
    } catch (err) {
      console.log('failed couch attempt');
    }
  }

  private formatDateTime(date: any) {
    return moment(date).format('MM/DD/YYYY, HH:mm');
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

  private get oleVessel(): OLEVessel {
    return this.oleDoc;
  }

  @Watch('vessel.activeVessel')
  private async handler3(newVal: string, oldVal: string) {
    this.activeVesselId = this.vessel.activeVessel.coastGuardNumber
      ? this.vessel.activeVessel.coastGuardNumber
      : this.vessel.activeVessel.stateRegulationNumber;
    try {
      this.dbReturn = this.getOleVessel();
    } catch (err) {
      console.log('failed couch attempt');
    }
  }

  private created() {
    this.getAuthorizedVessels();
    if (this.vessel.activeVessel) {
      this.activeVesselId = this.vessel.activeVessel.coastGuardNumber
        ? this.vessel.activeVessel.coastGuardNumber
        : this.vessel.activeVessel.stateRegulationNumber;
    }
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
