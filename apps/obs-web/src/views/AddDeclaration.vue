<template>
  <div class="q-pa-md" style="max-width: 400px">
    <q-form @submit="onSubmit">

      <q-btn-toggle
        v-if="!isAuthorized(['enforcement'])"
        v-model="worksheetModel"
        spread
        toggle-color="primary"
        @input="worksheetToggled()"
        :options="[
          {label: 'Worksheet', value: true},
          {label: 'Choose ID', value: false},
      ]"
      />
      <br>

      <!-- <q-select
        label="Choose a declaration ID"
        v-model="modelID"
        v-if="!worksheetModel"
        dense
        :options="Array.from(leafValues)"
        @input="itemChosen(modelID, 5)"
        style="width: 250px; padding-bottom: 32px"
      ></q-select> -->

        <div v-if="!modelID && !worksheetModel">
          <b>Choose a declaration ID:</b>
          <q-list>
            <transition-group name="choices-list">
                <q-item class="choices-list-item" v-for="(option, index) in Array.from(leafValues)" :key="'key_' + index" :class="getChoiceClasses(index)" clickable @click="modelID = option, itemChosen(modelID, 5), scrollToTop()" manual-focus>
                    <q-item-section>
                        <b>{{ option }}</b>
                    </q-item-section>
                </q-item>
            </transition-group>
          </q-list>
        </div>

          <b v-if="model1">Selections:</b>
          <q-list dense>
          <transition-group name="selections-list">

                <q-item :class="getSelectionClasses(44)" key="44" dense  v-if="modelID">
                  <q-item-section>
                    <b>{{ modelID }}</b>
                  </q-item-section>
                  <q-item-section avatar style="cursor: pointer">
                    <q-icon name="clear" @click="modelID = '', databaseObject.showOtherGearTextBox = false, databaseObject.cartAddBool = false, databaseObject.showObsQuestion = false, model6 = null"></q-icon>
                  </q-item-section>
                </q-item>

                <q-item :class="getSelectionClasses(0)" key="0" dense  v-if="model1">
                  <q-item-section>
                    <b>{{ model1 }}</b>
                  </q-item-section>
                  <q-item-section avatar style="cursor: pointer">
                    <q-icon name="clear" @click="model1 = null, databaseObject.efpTog = null, model2 = null, mode3 = null, modelefp1 = null, modelfp2 = null, model6 = null, databaseObject.cartAddBool = false, databaseObject.showefpQ2 = false, databaseObject.showefpQ0 = false, databaseObject.showEFPNote = false, databaseObject.showefpQ1 = false, databaseObject.showBoolArr[0] = false, databaseObject.showBoolArr[1] = false, databaseObject.showObsQuestion = false, databaseObject.showOtherGearTextBox = false"></q-icon>
                  </q-item-section>
                </q-item>

                <q-item :class="getSelectionClasses(1)" key="1" dense v-if="databaseObject.efpTog">
                  <q-item-section>
                    <b>{{ databaseObject.efpTog === 'yes' ? 'EFP' : 'Non-EFP' }}</b>
                  </q-item-section>
                  <q-item-section avatar style="cursor: pointer">
                    <q-icon name="clear" @click="databaseObject.efpTog = null, model2 = null, mode3 = null, modelefp1 = null, modelfp2 = null, model6 = null, databaseObject.cartAddBool = false, databaseObject.showefpQ2 = false, databaseObject.showEFPNote = false, databaseObject.showefpQ1 = false, databaseObject.showBoolArr[0] = false, databaseObject.showBoolArr[1] = false, databaseObject.showObsQuestion = false, databaseObject.showOtherGearTextBox = false"></q-icon>
                  </q-item-section>
                </q-item>

                <q-item :class="getSelectionClasses(2)" key="2" dense v-if="model2">
                  <q-item-section>
                    <b>{{ model2 }}</b>
                  </q-item-section>
                  <q-item-section avatar style="cursor: pointer">
                    <q-icon name="clear" @click="model2 = null, mode3 = null, modelefp1 = null, modelfp2 = null, model6 = null, databaseObject.cartAddBool = false, databaseObject.showefpQ2 = false, databaseObject.showObsQuestion = false, databaseObject.showOtherGearTextBox = false"></q-icon>
                  </q-item-section>
                </q-item>

                <q-item :class="getSelectionClasses(3)" key="3" dense v-if="model3">
                  <q-item-section>
                    <b>{{ model3 }}</b>
                  </q-item-section>
                  <q-item-section avatar style="cursor: pointer">
                    <q-icon name="clear" @click="model3 = null, modelefp1 = null, modelfp2 = null, model6 = null, databaseObject.cartAddBool = false, databaseObject.showefpQ2 = false, databaseObject.showObsQuestion = false"></q-icon>
                  </q-item-section>
                </q-item>

                <q-item :class="getSelectionClasses(4)" key="4" dense v-if="modelefp1">
                  <q-item-section>
                    <b>{{ modelefp1 }}</b>
                  </q-item-section>
                  <q-item-section avatar style="cursor: pointer">
                    <q-icon name="clear" @click="modelefp1 = null, modelefp2 = null, model6 = null, databaseObject.cartAddBool = false, databaseObject.showObsQuestion = false"></q-icon>
                  </q-item-section>
                </q-item>

                <q-item :class="getSelectionClasses(5)" key="5" dense v-if="modelefp2">
                  <q-item-section>
                    <b>{{ modelefp2 }}</b>
                  </q-item-section>
                  <q-item-section avatar style="cursor: pointer">
                    <q-icon name="clear" @click="modelefp2 = null, model6 = null, databaseObject.cartAddBool = false, databaseObject.showObsQuestion = false"></q-icon>
                  </q-item-section>
                </q-item>

                <q-item :class="getSelectionClasses(7)" key="7" dense v-if="model6">
                  <q-item-section>
                    <b>{{ model6 }}</b>
                  </q-item-section>
                  <q-item-section avatar style="cursor: pointer">
                    <q-icon name="clear" @click="model6 = null, databaseObject.cartAddBool = false"></q-icon>
                  </q-item-section>
                </q-item>

                <q-item :class="getSelectionClasses(8)" key="8" dense v-if="model7">
                  <q-item-section>
                    <b>In Cook EFP: {{ model7 }}</b>
                  </q-item-section>
                  <q-item-section avatar style="cursor: pointer">
                    <q-icon name="clear" @click="model7 = null, databaseObject.cartAddBool = false"></q-icon>
                  </q-item-section>
                </q-item>
          </transition-group>
          </q-list>

        <div v-if="!model1 && worksheetModel">
          <b>Category of Declaration (fishery/landing):</b>
          <q-list>
            <transition-group name="choices-list">
                <q-item class="choices-list-item" v-for="(option, index) in options1" :key="'key_' + index" :class="getChoiceClasses(index)" clickable @click="select1(option), itemChosen(model1, 1)" manual-focus>
                    <q-item-section>
                        <b>{{ option }}</b>
                    </q-item-section>
                </q-item>
            </transition-group>
          </q-list>
        </div>

        <div v-if="databaseObject.showefpQ0 && !databaseObject.efpTog">
          <b>Is declaration for an EFP?</b>
          <q-list>
            <transition-group name="choices-list">
                <q-item class="choices-list-item" v-for="(option, index) in ['yes', 'no']" :key="'key_' + index" :class="getChoiceClasses(index)" clickable @click="choose(option), efpToggled()" manual-focus>
                    <q-item-section>
                        <b>{{ option }}</b>
                    </q-item-section>
                </q-item>
            </transition-group>
          </q-list>
        </div>

        <div v-if="databaseObject.showBoolArr[1] && !model2">
          <b>{{ row2Title }}</b>
          <q-list>
            <transition-group name="choices-list">
                <q-item class="choices-list-item" v-for="(option, index) in options2" :key="'key_' + index" :class="getChoiceClasses(index)" clickable @click="select2(option), itemChosen(model2, 2), scrollToTop()" manual-focus>
                    <q-item-section>
                        <b>{{ option }}</b>
                    </q-item-section>
                </q-item>
            </transition-group>
          </q-list>
        </div>

        <div v-if="databaseObject.showBoolArr[2] && !model3">
          <b>{{ row2Title }}</b>
          <q-list>
            <transition-group name="choices-list">
                <q-item class="choices-list-item" v-for="(option, index) in options3" :key="'key_' + index" :class="getChoiceClasses(index)" clickable @click="select3(option), itemChosen(model3, 3), scrollToTop()" manual-focus>
                    <q-item-section>
                        <b>{{ option }}</b>
                    </q-item-section>
                </q-item>
            </transition-group>
          </q-list>
        </div>

        <div v-if="databaseObject.showefpQ1 && !modelefp1">
          <b>EFP Category</b>
          <q-list>
            <transition-group name="choices-list">
                <q-item class="choices-list-item" v-for="(option, index) in efpOptions" :key="'key_' + index" :class="getChoiceClasses(index)" clickable @click="chooseEfp(option), efpCategoryChosen()" manual-focus>
                    <q-item-section>
                        <b>{{ option }}</b>
                    </q-item-section>
                </q-item>
                <q-item class="choices-list-item" :class="getChoiceClasses(efpOptions.length + 1)" key="efpOptions.length + 1">
                  <q-item-section>
                    <b>Unlisted EFP? Call OLE:&nbsp;
                    <a
                      style="color: white"
                      href="tel: 888-585-5518"
                      data-rel="external"
                    >888-585-5518</a></b>
                  </q-item-section>
                </q-item>
            </transition-group>
          </q-list>
        </div>

        <div v-if="databaseObject.showefpQ2 && !modelefp2">
          <b>EFP Category</b>
          <q-list>
            <transition-group name="choices-list">
                <q-item class="choices-list-item" v-for="(option, index) in efpOptions2" :key="'key_' + index" :class="getChoiceClasses(index)" clickable @click="chooseEfp2(option), efpDeclarationChosen()" manual-focus>
                    <q-item-section>
                        <b>{{ option }}</b>
                    </q-item-section>
                </q-item>
            </transition-group>
          </q-list>
        </div>

        <div v-if="databaseObject.showObsQuestion && !model6">
          <b>Observer Status</b>
          <q-list>
            <transition-group name="choices-list">
                <q-item class="choices-list-item" v-for="(option, index) in obsOptions" :key="'key_' + index" :class="getChoiceClasses(index)" clickable @click="select6(option), obsChosen()" manual-focus>
                    <q-item-section>
                        <b>{{ option }}</b>
                    </q-item-section>
                </q-item>
            </transition-group>
          </q-list>
        </div>

        <div v-if="databaseObject.showCookQuestion && !model7">
          <b>Declaration in the Cook EFP?</b>
          <q-list>
            <transition-group name="choices-list">
                <q-item class="choices-list-item" v-for="(option, index) in ['Yes', 'No']" :key="'key_' + index" :class="getChoiceClasses(index)" clickable @click="chooseCook(option), cookEfpChosen()" manual-focus>
                    <q-item-section>
                        <b>{{ option }}</b>
                    </q-item-section>
                </q-item>
            </transition-group>
          </q-list>
        </div>

      <!-- <q-select
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
      ></q-select> -->

      <!-- <q-select
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
      ></q-select> -->

      <!-- <q-select
        label="Declaration in the Cook EFP?"
        dense
        v-if="databaseObject.showCookQuestion"
        v-model="model7"
        :options="['Yes', 'No']"
        @input="cookEfpChosen"
        style="width: 250px; padding-bottom: 32px"
      ></q-select> -->

      <q-input
        label="Describe Activity/Gear/Fishery"
        stack-label
        v-if="databaseObject.showOtherGearTextBox"
        v-model="otherGearNote"
        filled
        type="textarea"
        lazy-rules
        :rules="[val => val.length >= 3 || 'Description required for Other Gear declaration']"
      />

      <br />

      <q-card v-if="databaseObject.cartAddBool" align="center" class="bg-primary text-white" dense>
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
import { Vessel, OLEVessel, Declaration, EFPEntry } from '@boatnet/bn-models';
import {CouchDBInfo, CouchDBCredentials, couchService} from '@boatnet/bn-couch';
import { VesselState, UserState, AlertState } from '../_store/types/types';


/* tslint:disable:no-var-requires  */
const dropdownTree = require('../assets/declarationsWorksheetVault.json');


// This is the monster set of code, for the declaration worksheet
@Component({})
export default class Dropdowns extends Vue {
  @State('vessel') private vessel!: VesselState;
  @State('user') private user!: UserState;
  @Action('error', { namespace: 'alert' }) private errorAlert: any;

  // This object represents the state of the worksheet
  // could probably move this into couch
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
  // I think this prevents them from being able to live in
  // couch but I may be wrong about that.
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
  private efpCollection: EFPEntry = {};
  private efpOptions: string[] = [];
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

  // Observer dropdown chosen
  private obsChosen() {
    this.databaseObject.cartAddBool = true;
    this.newDeclaration.observerStatus = this.model6;
  }

  // Cook EFP can be naviagated to through federal permits
  // while all other EFPs happen through state permits,
  // when this declaration is picked it could be as
  // a non-EFP so we have to ask explicitly
  private cookEfpChosen() {
    this.databaseObject.cartAddBool = true;
    this.newDeclaration.efpStatus = this.model7;
  }

  // When dropdown item is chosen, use that information to generate the next dropdown
  // TODO: check out controling this through the Vue config setup we're
  // using for other parts of boatnet
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
      console.log('case 2 true');
      this.decChoiceDisplay = model;
    } else {
      this.databaseObject.showBoolArr[boolIndex] = true;
      return;
    }

    // TODO: talk to OLE staff to figure out how the real good
    // fish EFP should be handled.
    this.newDeclaration.declarationCode = Number('2'.concat(
      this.decChoiceDisplay.split(' ‐ ')[0]
    ));
    this.newDeclaration.declarationDescrip = this.decChoiceDisplay.split(' ‐ ')[1].replace(/†/g, '');
    this.databaseObject.showBoolArr.fill(false, boolIndex, 3);
    this.databaseObject.decChoiceKey = model;
    this.handleObserverStatus();
    if (
      [
        'Other Gear [69]',
        '69 ‐ Other, a gear that is not listed above'
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

  // Special handeling for cook efp, if user is not under
  // federal permit branch, the normal is-efp question doesn't
  // get triggered, so we need to have an additional question
  // asking if it's under cook efp
  private handleCookEfp() {
    if (['Groundfish (line*) [35]', '35 ‐ Open access*** line gear for groundfish'].includes(this.databaseObject.decChoiceKey)
      && this.model1 !== 'Federal Permit') {
      this.databaseObject.showCookQuestion = true;
    } else {
      this.databaseObject.cartAddBool = true;
    }
  }

  // When dropdowns change, all below are cleared/reset
  // This gets a little messy with all the control variables
  // hanging around, probably possible to clean this up,
  // maybe as part of putting some of these into couch or
  // changing flow over to config style generation
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
  // indirectly by qform submit functionality. Data for which
  // dec codes are compatabile is in the
  // declarationsWorksheetVault.json file
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
    console.log('executing cart update');
    const masterDB = couchService.masterDB;

    const out = await masterDB.post(this.oleVessel).then(
      setTimeout(() => {
        this.$q.notify({
          color: 'grey-1',
          textColor: 'white',
          icon: 'cloud_done',
          message: 'cart updated'
        }),
          this.$router.push({ path: '/declaration-cart' });
      }, 500)
    );
  }

  // This block of functions used to determine title of next dropown
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

  // TODO: See if I can get all the option getters
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

  // Determine if line note should be shown on page
  private get showLineNote(): boolean {
    if (this.modelID.concat(this.model1, this.model2, this.model3).includes('*')) {
      return true;
    } else {
      return false;
    }
  }

  // Determine if open access note should be shown on page
  private get showOpenAccNote(): boolean {
    if (this.decChoiceDisplay.includes('†')) {
      return true;
    } else {
      return false;
    }
  }

  // This function controls the EFP version of the worksheet
  private efpCategoryChosen() {
    const efpCatOptions = this.efpCollection[this.modelefp1];
    this.clearEntriesBelow(2);
    this.modelefp2 = '';
    this.databaseObject.showefpQ2 = false;
    if (efpCatOptions.length === 1) {
      this.decChoiceDisplay = dropdownTree['Leaf Nodes'][efpCatOptions[0]];
      this.databaseObject.showObsQuestion = true;
      this.newDeclaration.declarationCode = Number('2'.concat(
        this.decChoiceDisplay.split(' ‐ ')[0]
      ));
      this.newDeclaration.declarationDescrip = this.decChoiceDisplay.split(' ‐ ')[1].replace(/†/g, '');

      // if listed dec is 69, make a note of what EFP it was for
      if (this.newDeclaration.declarationCode === 269) {
      this.newDeclaration.activityDescrip = `EFP - ${this.modelefp1}`;
      }
    } else {
      this.efpOptions2 = efpCatOptions;
      this.databaseObject.showefpQ2 = true;
      if (this.modelefp1 === 'Electronic Monitoring') {
        this.model6 = 'EM';
      }
      this.databaseObject.showObsQuestion = true;
    }
  }

  // First EFP dropdown chosen
  private efpDeclarationChosen() {
    this.decChoiceDisplay = dropdownTree['Leaf Nodes'][this.modelefp2];
    this.databaseObject.cartAddBool = true;
    this.newDeclaration.declarationCode = Number('2'.concat(
      this.decChoiceDisplay.split(' ‐ ')[0]
    ));
    this.newDeclaration.declarationDescrip = this.decChoiceDisplay.split(' ‐ ')[1].replace(/†/g, '');
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

  private get oleVessel(): OLEVessel {
    return this.oleDoc;
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

  private select1(option: string) {
    this.model1 = option;
  }

  private select2(option: string) {
    this.model2 = option;
  }

  private select3(option: string) {
    this.model3 = option;
  }

  private select6(option: string) {
    this.model6 = option;
  }


  private choose(option: string) {
    this.databaseObject.efpTog = option;
  }

  private chooseEfp(option: string) {
    this.modelefp1 = option;
  }

  private chooseEfp2(option: string) {
    this.modelefp2 = option;
  }

  private chooseCook(option: string) {
    this.model7 = option;
  }

  private scrollToTop() {
    window.scrollTo(0, 0);
  }

  private async created() {
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

    // Get EFPs from couch
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

      this.efpCollection = efpResult.rows[0].doc.efpCollection;
      this.efpOptions = Object.keys(this.efpCollection);
    }  catch (err) {
      this.errorAlert(err);
    }

    // if ole staff set toggle to just drop down menu
    if (this.isAuthorized(['enforcement'])) {
      this.worksheetModel = false;
      this.databaseObject.showBoolArr[0] = false;
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