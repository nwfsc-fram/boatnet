<template>
  <div class="q-pa-md" style="max-width: 400px">
    <q-form @submit="onSubmit">
      <div class="row items-start q-gutter-md">
        <p>Participating in EFP?</p>
        <q-btn-toggle
          v-model="databaseObject.efpTog"
          toggle-color="primary"
          @input="efpToggled()"
          :options="[
          {label: 'Yes', value: true},
          {label: 'No', value: false},
      ]"
        />
      </div>

      <br />

      <q-btn-toggle
        v-if="!databaseObject.efpTog"
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

      <p v-if="databaseObject.showEFPNote">
        If you do not see your EFP category in the list below
        please contact the OLE office at 888-585-5518
      </p>

      <q-select
        label="Category of Declaration"
        dense
        v-if="databaseObject.showBoolArr[0]"
        v-model="model1"
        :options="options1"
        @input="itemChosen(model1, 1)"
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

      <q-select
        :label="row4Title"
        dense
        v-if="databaseObject.showBoolArr[3]"
        v-model="model4"
        :options="options4"
        @input="itemChosen(model4, 4)"
        style="width: 250px; padding-bottom: 32px"
      ></q-select>

      <q-select
        label="Species"
        dense
        v-if="databaseObject.showBoolArr[4]"
        v-model="model5"
        :options="options5"
        @input="itemChosen(model5, 5)"
        style="width: 250px; padding-bottom: 32px"
      ></q-select>

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
        @input="databaseObject.cartAddBool=true"
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

      <p v-if="showLineNote">
        <br />* Line = Hook &amp Line
        <br />** Longline = Stationary buoyed and anchored ground line with hooks
        attached, so as to fish along the seabed, does not include
        pelagic Hook &amp Line or Troll gear
      </p>

      <q-dialog v-model="exemptionPopup" persistent>
        <q-card style="width: 300px">
          <q-card-section class="row items-center">
            <span class="q-ml-sm">
              Exemptions
              <b>must</b> be made by calling the Office of Law Enforcement at
              <b>888-585-5518</b>.
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

/* tslint:disable:no-var-requires  */
// I don't think I need this still...
const dropdownTree = require('../assets/declarationsWorksheetVault.json');

@Component({})
export default class Dropdowns extends Vue {
  // This object represents the state of the worksheet
  // will probably move this into couch eventually
  public databaseObject = {
    showObsQuestion: false,
    cartAddBool: false,
    showBoolArr: [true, false, false, false, false],
    showOtherGearTextBox: false,
    decChoiceKey: '',
    // EFP stuff
    efpTog: false,
    showefpQ1: false,
    showefpQ2: false,
    showEFPNote: false
  };
  // Here are some page control variables that need
  // to be reactive, putting them into an object
  // caused problems here, but I should look into this
  // more to clean it up
  public model1: string = '';
  public model2: string = '';
  public model3: string = '';
  public model4: string = '';
  public model5: string = '';
  public model6: string = '';
  public modelID: string = '';
  public worksheetModel: boolean = true;
  public exemptionPopup: boolean = false;
  public decChoiceDisplay: string = '';
  public otherGearNote: string = '';
  // Options pulled out of the json file, this information comes from OLE
  public options1 = dropdownTree.Start;
  public obsOptions: string[] = dropdownTree['Observed Options'];
  public leafSet: Set<string> = new Set(
    Object.keys(dropdownTree['Leaf Nodes'])
  );
  public leafValues: Set<string> = new Set(
    Object.values(dropdownTree['Leaf Nodes'])
  );
  public ifqSet: Set<string> = new Set(dropdownTree['IFQ Fisheries']);
  // EFP stuff
  public modelefp1: string = '';
  public modelefp2: string = '';
  public efpOptions = Object.keys(dropdownTree.EFP);
  public efpOptions2: string[] = [];

  public confirm = false;

  // If EFP is toggled to yes, provide a different set of menus
  public efpToggled() {
    if (this.databaseObject.efpTog) {
      this.clearEntriesBelow(0);
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
    }
  }

  // This toggle controls showing the worksheet or one
  // single dropdown with all the declarations
  public worksheetToggled() {
    this.clearEntriesBelow(0);
    if (this.worksheetModel) {
      this.databaseObject.showBoolArr[0] = true;
      this.modelID = '';
    }
  }

  // When dropdown item is chosen, use that information to
  // generate the next dropdown
  // If not using worksheet dropdown, the format is slightly different
  public itemChosen(model: any, boolIndex: number) {
    this.clearEntriesBelow(boolIndex);
    if (
      [
        'Exemption',
        '10 ‐ Haul out exemption',
        '20 ‐ Outside areas exemption',
        '30 ‐ Emergency exemption',
        '40 – Long‐term departure exemption'
      ].includes(model)
    ) {
      this.exemptionPopup = true;
      return;
    } else if (this.leafSet.has(model)) {
      this.decChoiceDisplay = dropdownTree['Leaf Nodes'][model];
    } else if (this.leafValues.has(model)) {
      this.decChoiceDisplay = model;
    } else {
      this.databaseObject.showBoolArr[boolIndex] = true;
      return;
    }
    this.databaseObject.showBoolArr.fill(false, boolIndex, 4);
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
  public handleObserverStatus() {
    if (this.ifqSet.has(this.databaseObject.decChoiceKey)) {
      this.databaseObject.showObsQuestion = true;
    } else {
      this.databaseObject.cartAddBool = true;
    }
  }

  // Clear function so when dropdowns are changed, all
  // dropdowns below are cleared/reset
  public clearEntriesBelow(index: number) {
    this.databaseObject.showBoolArr.fill(false, index, 5);
    this.databaseObject.showObsQuestion = false;
    this.databaseObject.cartAddBool = false;
    this.databaseObject.showOtherGearTextBox = false;
    this.model6 = '';
    this.otherGearNote = '';
    if (index < 1) {
      this.model1 = '';
    }
    if (index < 2) {
      this.model2 = '';
    }
    if (index < 3) {
      this.model3 = '';
    }
    if (index < 4) {
      this.model4 = '';
    }
    if (index < 5) {
      this.model5 = '';
    }
  }

  public onSubmit() {
    // To-do
    this.confirm = true;
  }

  // Question two title dependent on prior dropdown choice
  public get row2Title() {
    if (this.model1 === 'Exemption') {
      return 'Description';
    } else {
      return 'Fishery';
    }
  }

  // Question three title dependent on prior dropdown choice
  public get row3Title() {
    if (this.model2 === 'Limited Entry') {
      return 'Fishery Options';
    } else {
      return 'Gear Type';
    }
  }

  // Question three title dependent on prior dropdown choice
  public get row4Title() {
    if (this.model3 === 'IFQ/CP/CV/MS') {
      return 'Gear Type';
    } else {
      return 'Species';
    }
  }

  // See if I can get all the option getters
  // into one function
  // Fill in dropdown options for question 2
  public get options2(): any {
    if (this.model1 === '') {
      return '';
    } else {
      return dropdownTree[this.model1];
    }
  }

  // Fill in dropdown options for question 3
  public get options3(): any {
    if (this.model2 === '') {
      return '';
    } else {
      return dropdownTree[this.model2];
    }
  }

  // Fill in dropdown options for question 4
  public get options4(): any {
    if (this.model3 === '') {
      return '';
    } else {
      return dropdownTree[this.model3];
    }
  }

  // Fill in dropdown options for question 5
  public get options5(): any {
    if (this.model4 === '') {
      return '';
    } else {
      return dropdownTree[this.model4];
    }
  }

  // Fill in dropdown options for question 6
  public get showLineNote(): boolean {
    if (this.model2 === 'Open Access') {
      return true;
    } else {
      return false;
    }
  }

  // This fucnction controls the EFP version of the worksheet
  public efpCategoryChosen() {
    const efpCatOptions = dropdownTree.EFP[this.modelefp1];
    this.clearEntriesBelow(1);
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
  public efpDeclarationChosen() {
    this.decChoiceDisplay = dropdownTree['Leaf Nodes'][this.modelefp2];
    this.databaseObject.cartAddBool = true;
  }
}
</script>
