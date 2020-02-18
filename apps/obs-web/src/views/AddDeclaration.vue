<template>
  <div class="q-pa-md" style="max-width: 400px">
    <q-form @submit="onSubmit">

      <q-btn-toggle
        v-model="worksheetModel"
        dense
        toggle-color="primary"
        @input="worksheetToggled()"
        :options="[
          {label: 'Declaration ID Worksheet', value: true},
          {label: 'Choose ID from dropdown', value: false},
      ]"
      />
      <br />
      <br />

      <q-select
        label="Choose a declaration ID"
        v-model="modelID"
        v-if="!worksheetModel"
        dense
        :options="Array.from(leafValues)"
        @input="itemChosen(modelID, 5)"
        style="width: 250px; padding-bottom: 32px"
      ></q-select>

      <q-select
        label="Category of Declaration (fishery/landing)"
        dense
        v-if="databaseObject.showBoolArr[0]"
        v-model="model1"
        :options="options1"
        @input="itemChosen(model1, 1)"
        style="width: 250px; padding-bottom: 32px"
      ></q-select>

      <q-select
        label="Is declaration for an EFP?"
        dense
        v-if="databaseObject.showefpQ0"
        v-model="databaseObject.efpTog"
        :options="['yes','no']"
        @input="efpToggled()"
        style="width: 250px; padding-bottom: 32px"
      ></q-select>

      <q-select
        :label="row2Title"
        dense
        v-if="databaseObject.showBoolArr[1]"
        v-model="model2"
        :options="options2"
        @input="itemChosen(model2, 2)"
        style="width: 250px; padding-bottom: 32px"
      ></q-select>

      <q-select
        :label="row3Title"
        dense
        v-if="databaseObject.showBoolArr[2]"
        v-model="model3"
        :options="options3"
        @input="itemChosen(model3, 3)"
        style="width: 250px; padding-bottom: 32px"
      ></q-select>

      <p v-if="databaseObject.showEFPNote">
        If you do not see your EFP category in the list below
        please contact the OLE office at 888-585-5518
      </p>

      <q-select
        label="EFP Category"
        dense
        v-if="databaseObject.showefpQ1"
        v-model="modelefp1"
        :options="efpOptions"
        @input="efpCategoryChosen"
        style="width: 250px; padding-bottom: 32px"
      ></q-select>

      <q-select
        label="EFP Declaration Type"
        dense
        v-if="databaseObject.showefpQ2"
        v-model="modelefp2"
        :options="efpOptions2"
        @input="efpDeclarationChosen"
        style="width: 250px; padding-bottom: 32px"
      ></q-select>

      <q-select
        label="Observer Status"
        dense
        v-if="databaseObject.showObsQuestion"
        v-model="model6"
        :options="obsOptions"
        @input="obsChosen"
        style="width: 250px; padding-bottom: 32px"
      ></q-select>

      <q-select
        label="Declaration in the Cook EFP?"
        dense
        v-if="databaseObject.showCookQuestion"
        v-model="model7"
        :options="['Yes', 'No']"
        @input="cookEfpChosen"
        style="width: 250px; padding-bottom: 32px"
      ></q-select>

      <q-input
        label="Describe Activity/Gear/Fishery"
        stack-label
        v-if="databaseObject.showOtherGearTextBox"
        v-model="otherGearNote"
        filled
        type="textarea"
        lazy-rules
        :rules="[val => val.length >= 3 || 'Sufficient details required for other gear type declaration']"
      />

      <br />

      <q-card v-if="databaseObject.cartAddBool" align="center" class="bg-light-blue-3" dense>
        <q-card-section>
          <div
            class="text-subtitle2"
          >The declaration ID for {{ decChoiceDisplay.split(' ‐ ')[1] }} is</div>
        </q-card-section>

        <q-card-section>
          <div class="text-h6">{{ decChoiceDisplay.split(' ‐ ')[0] }}</div>
        </q-card-section>
      </q-card>

      <br />

      <div style="text-align: center">
        <q-btn
          v-if="databaseObject.cartAddBool"
          label="Add To Cart"
          type="submit"
          color="primary"
        />
      </div>

      <q-dialog v-model="confirm" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <span class="q-ml-sm">
              Thank you for entering your declaration!
              It has been registered with the Office of Law Enforcement.
            </span>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Okay" color="primary" v-close-popup to="/declarations"/>
          </q-card-actions>
        </q-card>
      </q-dialog>

      <br />
      
      <p v-if="showLineNote">
        * Line = Hook &amp Line
        <br />** Longline = Stationary buoyed and anchored ground line with hooks
        attached, so as to fish along the seabed, does not include
        pelagic Hook &amp Line or Troll gear
      </p>
      <p v-if="showOpenAccNote"> † Open access defined as federal level open access </p>

      <q-dialog v-model="exemptionPopup" persistent>
        <q-card style="width: 300px">
          <q-card-section class="row items-center">
            <span class="q-ml-sm">
              Exemptions
              <b>must</b> be made by calling the Office of Law Enforcement at
              <b>
                <a href="tel: 888-585-5518" data-rel="external">888-585-5518</a>
              </b>.
            </span>
          </q-card-section>

          <q-card-actions align="center">
            <q-btn flat label="Okay" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-form>
  </div>
</template>

<script lang="ts">
import { State, Action, Getter, Mutation } from 'vuex-class';
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';

import moment from 'moment';
import { Client, CouchDoc, ListOptions } from 'davenport';
import { AuthState, authService } from '@boatnet/bn-auth';
import { Notify } from 'quasar';
import { Vessel, OLEVessel, Declaration} from '@boatnet/bn-models';
import {CouchDBInfo, CouchDBCredentials, couchService} from '@boatnet/bn-couch';
import { VesselState, UserState, AlertState } from '../_store/types/types';


/* tslint:disable:no-var-requires  */
// I don't think I need this still...
const dropdownTree = require('../assets/declarationsWorksheetVault.json');

@Component({})
export default class Dropdowns extends Vue {
  @State('vessel') private vessel!: VesselState;
  @State('user') private user!: UserState;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;

  // This object represents the state of the worksheet
  // will probably move this into couch eventually
  private databaseObject = {
    accept: false,
    showObsQuestion: false,
    showCookQuestion: false,
    cartAddBool: false,
    showBoolArr: [true, false, false],
    showOtherGearTextBox: false,
    decChoiceKey: '',
    efpTog: '',    // EFP stuff
    showefpQ0: false,
    showefpQ1: false,
    showefpQ2: false,
    showEFPNote: false
  };
  // Here are some page control variables that need to be reactive
  private oleDoc: OLEVessel = {};
  private dbReturn: any = null;
  private activeVesselId: string = '';
  private userRoles: string[] = [];
  private model1: string = '';
  private model2: string = '';
  private model3: string = '';
  private model6: string = '';
  private model7: string = '';
  private modelID: string = '';
  private worksheetModel: boolean = true;
  private exemptionPopup: boolean = false;
  private decChoiceDisplay: string = '';
  private otherGearNote: string = '';
  private newDeclaration: Declaration = { type: 'ole-declaration', declarationCode: 999, declarationDescrip: '', observerStatus: 'N/A' };
  // Options pulled out of the json file, this information comes from OLE
  private options1 = dropdownTree.Start;
  private obsOptions: string[] = dropdownTree['Observed Options'];
  private leafSet: Set<string> = new Set(
    Object.keys(dropdownTree['Leaf Nodes'])
  );
  private leafValues: Set<string> = new Set(
    Object.values(dropdownTree['Leaf Nodes'])
  );
  private ifqSet: Set<string> = new Set(dropdownTree['IFQ Fisheries']);
  private dualRules: any = dropdownTree['Allowed Dual Declarations'];
  // EFP stuff
  private modelefp1: string = '';
  private modelefp2: string = '';
  private efpOptions = Object.keys(dropdownTree.EFP);
  private efpOptions2: string[] = [];

  private confirm = false;

  // If EFP is toggled to yes, provide a different set of menus
  private efpToggled() {
    if (this.databaseObject.efpTog === 'yes') {
      this.clearEntriesBelow(1);
      this.worksheetModel = true;
      this.modelID = '';
      this.databaseObject.showEFPNote = true;
      this.databaseObject.showefpQ1 = true;
    } else {
      if (this.worksheetModel) {
        this.databaseObject.showBoolArr[0] = true;
      }
      this.databaseObject.showEFPNote = false;
      this.databaseObject.showefpQ1 = false;
      this.databaseObject.showefpQ2 = false;
      this.clearEntriesBelow(1);
      this.modelefp1 = '';
      this.modelefp2 = '';
      this.databaseObject.showBoolArr[1] = true;
    }
  }

  // This toggle controls showing the worksheet or one
  // single dropdown with all the declarations
  private worksheetToggled() {
    this.clearEntriesBelow(0);
    if (this.worksheetModel) {
      this.databaseObject.showBoolArr[0] = true;
      this.modelID = '';
    }
  }

  private obsChosen() {
    this.databaseObject.cartAddBool = true;
    this.newDeclaration.observerStatus = this.model6;
  }

  private cookEfpChosen() {
    this.databaseObject.cartAddBool = true;
    this.newDeclaration.efpStatus = this.model7;
  }

  // When dropdown item is chosen, use that information to generate the next dropdown
  private itemChosen(model: any, boolIndex: number) {
    this.clearEntriesBelow(boolIndex);
    if (['Exemptions', '10 ‐ Haul out exemption', '20 ‐ Outside areas exemption',
         '30 ‐ Emergency exemption', '40 – Long‐term departure exemption'
      ].includes(model)
    ) {
      this.exemptionPopup = true;
      return;
    } else if (model === 'Federal Permit') {
      // If federal permit need to re-direct flow to efp question
      this.databaseObject.showefpQ0 = true;
      return;
    } else if (this.leafSet.has(model)) {
      this.decChoiceDisplay = dropdownTree['Leaf Nodes'][model];
    } else if (this.leafValues.has(model)) {
      this.decChoiceDisplay = model;
    } else {
      this.databaseObject.showBoolArr[boolIndex] = true;
      return;
    }
    // need to figure out how the real good fish thing
    // should be listed.
    this.newDeclaration.declarationCode = Number('2'.concat(
      this.decChoiceDisplay.split(' ‐ ')[0]
    ));
    this.newDeclaration.declarationDescrip = this.decChoiceDisplay.split(' ‐ ')[1].replace(/†/g, '');
    this.databaseObject.showBoolArr.fill(false, boolIndex, 3);
    this.databaseObject.decChoiceKey = model;
    this.handleObserverStatus();
    if (
      [
        'Other Gear (or Activity) [69]',
        '69 ‐ A gear (or activity) that is not listed above'
      ].includes(model)
    ) {
      this.databaseObject.showOtherGearTextBox = true;
    }
  }

  // Observer status question only applies to subset of choices
  private handleObserverStatus() {
    if (this.ifqSet.has(this.databaseObject.decChoiceKey)) {
      this.databaseObject.showObsQuestion = true;
    } else {
      this.handleCookEfp();
    }
  }

  // Observer status question only applies to subset of choices
  private handleCookEfp() {
    if (['Groundfish (line*) [35]', '35 ‐ Open access*** line gear for groundfish'].includes(this.databaseObject.decChoiceKey)
      && this.model1 !== 'Federal Permit') {
      this.databaseObject.showCookQuestion = true;
    } else {
      this.databaseObject.cartAddBool = true;
    }
  }

  // When dropdowns change, all below are cleared/reset
  private clearEntriesBelow(index: number) {
    this.databaseObject.showBoolArr.fill(false, index, 3);
    this.databaseObject.showObsQuestion = false;
    this.databaseObject.showCookQuestion = false;
    this.databaseObject.cartAddBool = false;
    this.databaseObject.showOtherGearTextBox = false;
    this.model6 = '';
    this.model7 = '';
    this.otherGearNote = '';
    if (this.model1 !== 'Federal Permit' || !this.worksheetModel) {
      this.databaseObject.showefpQ0 = false;
      this.databaseObject.efpTog = '';
      this.databaseObject.showEFPNote = false;
      this.databaseObject.showefpQ1 = false;
      this.databaseObject.showefpQ2 = false;
      this.modelefp1 = '';
      this.modelefp2 = '';
    }
    if (index < 1) {
      this.model1 = '';
    }
    if (index < 2) {
      this.model2 = '';
    }
    if (index < 3) {
      this.model3 = '';
    }
  }

  // add declaration to cart
  private async onSubmit() {
    this.databaseObject.accept = false;
    if (this.otherGearNote.length > 0) {
      this.newDeclaration.activityDescrip = this.otherGearNote;
    }
    this.checkNewDec();

    if (!this.databaseObject.accept) {
      return;
    } else {
      if (this.oleVessel.cartDeclarations!.length > 0) {
      this.oleVessel.cartDeclarations = this.oleVessel.cartDeclarations!.concat(
        this.newDeclaration
      );
      } else {
        this.oleVessel.cartDeclarations = [this.newDeclaration];
      }
      await this.cartUpdate();
    }
  }

  // Check for conflicting declarations, required fields checked
  // indirectly by qform
  private checkNewDec() {
    const okayArray: number[] = this.dualRules[this.newDeclaration.declarationCode];
    console.log(okayArray);
    for (const cartDec of this.oleVessel.cartDeclarations!) {
      if (!okayArray.includes(cartDec.declarationCode)) {
        if (cartDec.declarationCode === 269) {
          this.$q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Declaration ' + this.newDeclaration.declarationCode +
                    ' is incompatible with Declaration ' +
                    cartDec.declarationCode + ' in the cart. Please put all Other' +
                    ' Gear descriptions in one declaration.'
          });
        } else {
          this.$q.notify({
            color: 'red-5',
            textColor: 'white',
            icon: 'warning',
            message: 'Declaration ' + this.newDeclaration.declarationCode +
                    ' is incompatible with Declaration ' +
                    cartDec.declarationCode + ' in the cart.'
          });
        }
        return;
      }
    }
    this.databaseObject.accept = true;
  }

  // Add declaration to cart in couch doc
  private async cartUpdate() {
    const masterDB = couchService.masterDB;

    const out = await masterDB.post(this.oleVessel).then(
      setTimeout(() => {
        this.$q.notify({
          color: 'green-4',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'Submitted'
        }),
          this.$router.push({ path: '/declaration-cart' });
      }, 500)
    );
  }

  // This block of functions to determine title of next dropown
  private get row2Title() {
    if (this.model1 === 'Exemptions') {
      return 'Description';
    } else if (this.model1 === 'State Permit') {
      return 'Species/Gear';
    } else {
      return 'Gear Type';
    }
  }

  private get row3Title() {
    if (this.model2 === 'Midwater Trawl') {
      return 'Midwater Fishery Options';
    } else {
      return 'Fixed Gear Fishey Options';
    }
  }

  // See if I can get all the option getters
  // into one function
  // Fill in dropdown options for question 2
  private get options2(): any {
    if (this.model1 === '') {
      return '';
    } else {
      return dropdownTree[this.model1];
    }
  }

  // Fill in dropdown options for question 3
  private get options3(): any {
    if (this.model2 === '') {
      return '';
    } else {
      return dropdownTree[this.model2];
    }
  }

  private get showLineNote(): boolean {
    if (this.modelID.concat(this.model1, this.model2, this.model3).includes('*')) {
      return true;
    } else {
      return false;
    }
  }

  private get showOpenAccNote(): boolean {
    if (this.decChoiceDisplay.includes('†')) {
      return true;
    } else {
      return false;
    }
  }

  // This fucnction controls the EFP version of the worksheet
  private efpCategoryChosen() {
    const efpCatOptions = dropdownTree.EFP[this.modelefp1];
    this.clearEntriesBelow(2);
    this.modelefp2 = '';
    this.databaseObject.showefpQ2 = false;
    if (efpCatOptions.length === 1) {
      this.decChoiceDisplay = dropdownTree['Leaf Nodes'][efpCatOptions[0]];
      this.databaseObject.showObsQuestion = true;
    } else {
      this.efpOptions2 = efpCatOptions;
      this.databaseObject.showefpQ2 = true;
      this.model6 = 'EM';
      this.databaseObject.showObsQuestion = true;
    }
  }

  // First EFP dropdown chosen
  private efpDeclarationChosen() {
    this.decChoiceDisplay = dropdownTree['Leaf Nodes'][this.modelefp2];
    this.databaseObject.cartAddBool = true;
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
