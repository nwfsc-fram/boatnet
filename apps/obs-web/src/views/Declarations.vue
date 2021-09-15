<template>
  <div>
    <q-card v-if="!isAuthorized(['enforcement'])" class="bg-blue-2 q-ma-xs" style="font-weight: bold; text-align: center">
      <q-card-section>
        To make declaration/s by phone, please call <br>
        Office of Law Enforcement at
        <a
          style="color: black; font-size: 1em"
          href="tel: 888-585-5518"
          data-rel="external"
        >888-585-5518</a>
      </q-card-section>
    </q-card>

    <b v-if="vessel.activeVessel">Active Vessel:</b>
    <q-list>
      <transition-group name="selections-list">
        <q-item :class="getSelectionClasses(0)" key="0" dense v-if="vessel.activeVessel">
          <q-item-section>
            <b>{{ vessel.activeVessel.vesselName + ' (' + (vessel.activeVessel.coastGuardNumber ? vessel.activeVessel.coastGuardNumber : vessel.activeVessel.stateRegulationNumber)  + ')' }}</b>
          </q-item-section>
          <q-item-section avatar style="cursor: pointer">
            <q-icon name="clear" @click="vessel.activeVessel = undefined"></q-icon>
          </q-item-section>
        </q-item>
      </transition-group>
    </q-list>

    <div >
      <q-select
        class="centered-page-item"
        v-if="isAuthorized(['enforcement'])"
        v-model="vessel.activeVessel"
        label="Staff - Select ANY vessel"
        dense
        fill-input
        use-input
        hide-selected
        @filter="vesselsFilterFn"
        :options="vessels"
        :option-label="opt => opt.vesselName + ' (' + (opt.coastGuardNumber ? opt.coastGuardNumber : opt.stateRegulationNumber)  + ')'"
        option-value="_id"
        @click.native="vessel.activeVessel = undefined"
      ></q-select>

      <div v-else>
        <div v-if="!vessel.activeVessel">
          <b>Vessel:</b>
          <q-list>
            <transition-group name="choices-list">
                <q-item class="choices-list-item" v-for="(opt, index) in authorizedVessels" :key="'key_' + index" :class="getChoiceClasses(index)" clickable @click="vessel.activeVessel = opt" manual-focus>
                    <q-item-section>
                        <b>{{ opt.vesselName + ' (' + (opt.coastGuardNumber ? opt.coastGuardNumber : opt.stateRegulationNumber)  + ')' }}</b>
                    </q-item-section>
                </q-item>
            </transition-group>
          </q-list>
        </div>
      </div>

      <!-- <q-select
        v-else
        v-model="vessel.activeVessel"
        label="Vessel"
        dense
        fill-input
        hide-selected
        :options="authorizedVessels"
        :option-label="opt => opt.vesselName + ' (' + (opt.coastGuardNumber ? opt.coastGuardNumber : opt.stateRegulationNumber)  + ')'"
        option-value="_id"
      ></q-select> -->
    </div>

    <div class="centered-page-item" v-if="vessel.activeVessel">
      <div v-if="oleVessel !== undefined">
        <!-- <div class="centered-page-item">{{vessel.activeVessel['vesselName']}}</div>

        <br /> -->

        <q-btn class="bg-primary text-white q-ma-md" to="/declaration-cart">New Declaration</q-btn>

        <br />

        <b class="centered-page-item" v-if="vmsDeclarations.length > 0">Current Declaration(s):</b>
        <div class="q-pa-sm bg-blue-2 rounded" v-if="vmsDeclarations.length > 0">
          <span
            v-for="dec of vmsDeclarations.slice(0, 3)"
            :key="vmsDeclarations.indexOf(dec)"
            dense
            >
              <span v-if="vmsDeclarations.indexOf(dec) === 0 || (vmsDeclarations.indexOf(dec) < 0 && dec.date === vmsDeclarations[0].date)">
                <span style="font-size: .8em">{{ dec.code }}</span>
                <span style="font-size: .6em"> {{ formatDate(dec.date) }}</span>
              </span> &nbsp;
            </span>
        </div>

        <div class="centered-page-item">App Declarations</div>
        <div v-if="oleVessel !== undefined && Object.keys(oleVessel.activeDeclarations).length > 0">
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
                <div
                  style="font-size: 14px"
                >Start Date: {{ formatDateTime(obj["transactionDate"]) }}</div>
                <div
                  v-show="obj['observerStatus'] !== 'N/A'"
                  style="font-size: 14px"
                >Observer Status: {{ obj["observerStatus"] }}</div>
                <div style="font-size: 14px">Confirmation Number:</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <div v-else class="centered-page-item text-primary">No app declarations for this vessel.</div>

        <div class="centered-page-item">
          Past App Declarations
          <q-btn
            :color="getBtnColor()"
            size="sm"
            :disable="oleVessel === undefined || Object.keys(oleVessel.deactivatedDeclarations).length < 1"
            @click="setTablePref()"
          >{{ pastDecCards ? 'View As Table' : 'View As Cards'}}</q-btn>
        </div>

        <div
          v-if="oleVessel !== undefined && Object.keys(oleVessel.deactivatedDeclarations).length > 0"
        >
          <div class="row items-start" v-if="!pastDecCards">
            <q-table
              :data="oleVessel.deactivatedDeclarations"
              :columns="columns"
              :pagination.sync="pagination"
              row-key="_id"
              dense
              hide-bottom
            >
            </q-table>
          </div>

          <div class="q-pa-md column" v-else>
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
                <div
                  style="font-size: 14px"
                >Start Date: {{ formatDateTime(obj["transactionDate"]) }}</div>
                <div
                  style="font-size: 14px"
                  v-show="obj['observerStatus'] !== 'N/A'"
                >Observer Status: {{ obj["observerStatus"] }}</div>
                <div style="font-size: 14px">Confirmation Number:</div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div v-else class="centered-page-item text-primary">No past app declarations for this vessel.</div>

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
        <p class="centered-page-item text-primary">No OLEVessel Doc found</p>
      </div>
    </div>
    <div v-else>
      <p class="centered-page-item text-primary">Select a vessel</p>
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


import { getDeclarations } from '@boatnet/bn-common';
import { couchService } from '@boatnet/bn-couch';
import { AuthState, authService } from '@boatnet/bn-auth';

/* tslint:disable:no-var-requires  */
const dropdownTree = require('../assets/declarationsWorksheetVault.json');

@Component
export default class Declarations extends Vue {
  private get oleVessel(): OLEVessel | undefined {
    if (Object.keys(this.oleDoc).length !== 0) {
      return this.oleDoc;
    } else {
      console.log('oleDoc missing');
    }
    return undefined;
  }
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
  private pastDecCards: boolean = true;
  private newGearNote: string = '';
  private activeVesselId: string = '';
  private vessels: [] = [];
  private storeNewDec: Declaration = {
    type: 'ole-declaration',
    declarationCode: 999,
    declarationDescrip: '',
    observerStatus: 'N/A'
  };
  private dualRules: any = dropdownTree['Allowed Dual Declarations'];
  private ifqSet: Set<string> = new Set(dropdownTree['IFQ Fisheries']);
  private obsOptions: string[] = dropdownTree['Observed Options'];

  private vmsDeclarations: any[] = [];

  private columns = [
    {
      name: 'declarationCode',
      label: 'Declaration Code',
      field: 'declarationCode',
      required: true,
      align: 'left',
      sortable: true
    },
    {
      name: 'declarationDescrip',
      label: 'Declaration Description',
      field: 'declarationDescrip',
      required: true,
      align: 'left',
      sortable: true
    },
    {
      name: 'activityDescrip',
      label: 'Activity Description',
      field: 'activityDescrip',
      required: false,
      align: 'left',
      sortable: false
    },
    {
      name: 'transactionDate',
      label: 'Start Date',
      field: 'transactionDate',
      required: true,
      align: 'left',
      sortable: true,
      format: (val: any) => this.formatDateTime(val)
    },
    {
      name: 'observerStatus',
      label: 'Observer Status',
      field: 'observerStatus',
      required: false,
      align: 'left',
      sortable: true
    },
    {
      name: 'confirmationNumber',
      label: 'Confirmation Number',
      field: 'confirmationNumber',
      required: false,
      align: 'left',
      sortable: true
    }
  ];

  private pagination = {
    descending: false,
    rowsPerPage: 0
  };

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
      const masterDB = couchService.masterDB;

      const options = {
        include_docs: true,
        key: this.activeVesselId
      };
      let ovessels: any = await masterDB.view(
        'OLEDeclarations',
        'all_ole_vessels',
        options
      );

      // If not ole vessle doc is returned make a new one
      if (!(ovessels.rows.length  > 0)) {
        const newDoc: OLEVessel = this.vessel.activeVessel.coastGuardNumber
        ? { type: 'olevessel',
            vesselName: this.vessel.activeVessel.vesselName,
            coastGuardNumber: this.vessel.activeVessel.coastGuardNumber,
            vesselPasscode: 1234,
            vesselDocNumber: 1234,
            lepOpenAccess: '',
            vmsTech: '',
            ifqAcct: 'Not sure what this is',
            activeDeclarations: [],
            deactivatedDeclarations: [],
            cartDeclarations: [],
            createdBy: '',
            createdDate: '',
            isDeleted: false,
            changeLog: []}
        : { type: 'olevessel',
            vesselName: this.vessel.activeVessel.vesselName,
            stateRegulationNumber: this.vessel.activeVessel.stateRegulationNumber,
            vesselPasscode: 1234,
            vesselDocNumber: 1234,
            lepOpenAccess: '',
            vmsTech: '',
            ifqAcct: 'Not sure what this is',
            activeDeclarations: [],
            deactivatedDeclarations: [],
            cartDeclarations: [],
            createdBy: '',
            createdDate: '',
            isDeleted: false,
            changeLog: []};

        // Update couch
        const uout = await masterDB.post(newDoc).then(
          setTimeout(() => {
            this.$q.notify({
              color: 'green-4',
              textColor: 'white',
              icon: 'cloud_done',
              message: 'new OLEVesssel doc created'
            });
          }, 500)
        );

        // Fetch new doc
        ovessels = await masterDB.view(
          'OLEDeclarations',
          'all_ole_vessels',
          options
        );
      }

      for (const v of ovessels.rows) {
        this.oleDoc = v.doc;
      }
      return ovessels;
    } catch (err) {
      // I want to  change this back to errorAlert, but need
      console.log(err);
      // this.errorAlert(err);
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

  // Check if declaration is already in cart
  private cartContains(newDeclaration: Declaration) {
    for (const cartDecs of this.oleVessel!.cartDeclarations!) {
      if (newDeclaration.declarationCode === cartDecs.declarationCode) {
        return true;
      }
    }
    return false;
  }

  // Check for conflicting declarations, and start to add to cart if passes
  private addToCart(copyDec: Declaration) {
    const newDeclaration = { ...copyDec };
    const okayArray: number[] = this.dualRules[newDeclaration.declarationCode];
    for (const cartDec of this.oleVessel!.cartDeclarations!) {
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

  // Reset options for declaration going into cart
  private newObsChosen() {
    this.storeNewDec.observerStatus = this.newObsStatus;
    this.newObsStatus = '';
    this.obsPrompt = false;
    this.finishAddingToCart();
  }

  // Reset options for declaration going into cart
  private newOtherGearChosen() {
    this.storeNewDec.activityDescrip = this.newGearNote;
    this.newGearNote = '';
    this.gearPrompt = false;
    this.finishAddingToCart();
  }

  private setTablePref() {
    this.pastDecCards = !this.pastDecCards;
  }

  private getBtnColor() {
    if (this.pastDecCards) {
      return 'primary';
    } else {
      return 'secondary';
    }
  }

  private formatDateTime(date: any) {
    return moment(date).format('MM/DD/YYYY, HH:mm');
  }

  private formatDate(date: any) {
    return moment(date).format('MM/DD/YYYY');
  }

  // Had to split this part out so that qdialog could finish the add
  // to cart process as well.
  private async finishAddingToCart() {
    // Add new dec to oleVessel
    if (this.oleVessel!.cartDeclarations!.length > 0) {
      this.oleVessel!.cartDeclarations = this.oleVessel!.cartDeclarations!.concat(
        this.storeNewDec
      );
    } else {
      this.oleVessel!.cartDeclarations = [this.storeNewDec];
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

  private vesselsFilterFn(val: string, update: any, abort: any) {
    update(async () => {
      try {
        const masterDb = couchService.masterDB;
        const queryOptions = {
          start_key: val.toLowerCase(),
          end_key: val.toLowerCase() + '\u9999',
          inclusive_end: true,
          descending: false,
          include_docs: true
        };

        const vessels = await masterDb.view(
          'obs_web',
          'all_vessel_names',
          queryOptions
        );
        this.vessels = vessels.rows.map((row: any) => row.doc);
      } catch (err) {
        console.log(err);
      }
    });
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

  @Watch('vessel.activeVessel')
  private async handler3(newVal: string, oldVal: string) {
    if (this.vessel.activeVessel !== undefined) {
      this.activeVesselId = this.vessel.activeVessel.coastGuardNumber
        ? this.vessel.activeVessel.coastGuardNumber
        : this.vessel.activeVessel.stateRegulationNumber;
      try {
        this.dbReturn = this.getOleVessel();
        const responseDeclarations: any = JSON.parse(await getDeclarations(this.activeVesselId) as string);
        this.vmsDeclarations = [];
        for (let row of responseDeclarations.rows) {
          let declaration: any = {};
          declaration.date = row[0];
          declaration.code = row[1];
          this.vmsDeclarations.push(declaration);

        }
        console.log(this.vmsDeclarations)
      } catch (err) {
        console.log('failed couch attempt');
      }
    } else {
      this.activeVesselId = '';
      this.oleDoc = {};
    }
  }

  private getSelectionClasses(index: number) {
    if (index % 2 === 0) {
      return 'selections-list-item bg-primary text-white rounded';
    } else {
      return 'selections-list-item bg-blue-2 rounded';
    }
  }

  private getChoiceClasses(index: number) {
    if (index % 2 === 0) {
      return 'choices-list-item bg-primary text-white rounded';
    } else {
      return 'choices-list-item bg-blue-2 rounded';
    }
  }

  private created() {
    this.getAuthorizedVessels();
    if (this.vessel.activeVessel) {
      this.activeVesselId = this.vessel.activeVessel.coastGuardNumber
        ? this.vessel.activeVessel.coastGuardNumber
        : this.vessel.activeVessel.stateRegulationNumber;

      try {
        this.dbReturn = this.getOleVessel();
      } catch (err) {
        console.log('failed couch attempt');
      }
    }
    if (authService.getCurrentUser()) {
      this.userRoles = JSON.parse(
        JSON.stringify(authService.getCurrentUser()!.roles)
      );
    }
  }
}
</script>

<style scoped>
    .trip-alert {
        background-color: #003D72;
        color: white;
        border-radius: 5px;
        padding: 5px;
    }

    .selections-list-item {
        transition: all .3s;
    }
    .selections-list-enter,
    .selections-list-leave-to {
        opacity: 0;
        transform: translateX(30px);
    }

    .choices-list-item {
        transition: all .3s;
    }
    .choices-list-enter {
        opacity: 0;
        transform: translateY(30px);
    }
    .choices-list-leave-to {
        opacity: 0;
        transform: translateY(-30px);
    }

    .rounded {
        border-radius: 5px;
        margin: 3px;
    }

    * >>> .p-inputtext {
        border: 2px solid black !important;
        cursor: pointer;
        font-weight: bold;
        padding: 6px 0;
        line-height: 2.4em;
    }

    * >>> .q-select__dropdown-icon {
        color: black !important;
    }

    * >>> .p-datepicker:not(.p-datepicker-inline) {
        z-index: 9990 !important;
    }
</style>