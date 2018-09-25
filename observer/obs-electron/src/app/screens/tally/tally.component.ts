import { Component, OnInit, OnDestroy } from '@angular/core';
import { StateService } from '../../_services/data/state.service';

import { trigger, transition, animate, style } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { TallyButton } from '../../_models/wcgop/tally/tally-button';
import { MatBottomSheet, MatDialog } from '@angular/material';
import { TallyHistoryComponent } from './tally-history/tally-history.component';
import { TallyHistoryChange } from '../../_models/wcgop/tally/tally-history-change';
import { AddNamedComponent } from './add-named/add-named.component';
import { DataService } from '../../_services/data/data.service';
import { getBoatnetDateFormatNow } from '../../shared/util';
import { TallyService } from '../../_services/data/tally/tally.service';
import { CountsWeightsComponent } from './counts-weights/counts-weights.component';
import { ConfirmationService } from 'primeng/api';
import { TemplateManagerComponent } from './template-manager/template-manager.component';
import { TemplateService } from '../../_services/data/tally/template.service';
import { Subscription } from 'rxjs';
// Animation based on example from:
// https://stackoverflow.com/questions/47248898/angular-4-simple-example-of-slide-in-out-animation-on-ngif

/**
 * Used to handle stages of adding a tally button
 */
enum AddTally {
  Idle,
  ChooseButton,
  ChooseNewButtonType,
  ChooseLoc
}

@Component({
  selector: 'app-tally',
  templateUrl: './tally.component.html',
  styleUrls: ['./tally.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)' }),
        animate('200ms ease-in', style({ transform: 'translateX(0%)' }))
      ])
    ])
  ]
})
export class TallyComponent implements OnInit, OnDestroy {
  allowableControlModes = new Set([
    'tally',
    'modify',
    'add-button',
    'all-tally',
    'modify-disp'
  ]);
  hideButtonTypes = new Set(['INVIS']);
  // Modes for the control row: tally, modify, ...

  isModifyMode = false;

  sourceAddButton: TallyButton;
  targetAddButton: TallyButton;
  modifyDispButton: TallyButton;
  currentExistingTypes = new Set();

  currentAddTargetLoc: number[];

  lastButtonClicked: TallyButton;

  controlMode = 'tally';
  tallyButtons: TallyButton[];
  tallyHistory: TallyHistoryChange[];
  speciesList: any[] = [];

  allTallyButtonsRow: TallyButton[];
  tallyIncDecValue = 1;
  lastIncDec: number; // track last inc/dec operation

  // Move Tally Button mode
  isPendingMove = false;

  // Delete Tally Button
  isPendingDelete = false;

  // All Tally mode
  isPendingAllTallySelect = false;

  // Weights
  isPendingWeightsSelect = false;

  // Modify Disposition
  isPendingModifyDisp = false;

  // Add Button state
  pendingAdd = AddTally.Idle;

  // Add Temp Buttons
  isPendingNewTempButton = false;
  isPendingNameTemp = false;
  TEMP_BUTTON_PREFIX = 'TMP';

  // TODO Trip and Haul #'s
  tripId = '0';
  haulId = '0';

  // Header menu subscription
  menuSub: Subscription;

  constructor(
    private stateService: StateService,
    private dataService: DataService,
    public tallyService: TallyService,
    public templateService: TemplateService,
    private http: HttpClient,
    private tallyHistorySheet: MatBottomSheet,
    private pickCodeSheet: MatBottomSheet,
    public countsWeightsDialog: MatDialog,
    public templateManagerDialog: MatDialog,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.stateService.setStateName('tally');

    this.tallyHistory = new Array();
    this.dataService.getSpecies().then(speciesList => {
      this.speciesList = speciesList;
      console.log(`Loaded ${this.speciesList.length} species codes from DB.`);
      this.tallyService
        .fetchTallyInfo(this.tripId, this.haulId)
        .then(buttons => {
          this.tallyButtons = buttons;
          this.tallyService.setUniqueCodes(
            this.getUniqueCodes(this.tallyButtons)
          );
        });
      this.tallyService
        .loadTallyHistoryFromDB(this.tripId, this.haulId)
        .then(history => {
          if (history) {
            this.tallyHistory = history;
          }
        });
    });

    this.menuSub = this.stateService.menuTriggered.subscribe(menuItem => {
      if (menuItem === 'template-manager') {
        this.openTemplateManager();
      }
    });
  }

  ngOnDestroy() {
    this.menuSub.unsubscribe();
  }
  /**
   * Get unique set of species codes from buttons
   * @param buttons
   */
  getUniqueCodes(buttons: TallyButton[]): Array<string> {
    const codes = new Set();
    for (const b of this.tallyButtons) {
      if (b.code) {
        codes.add(b.code);
      }
    }
    return Array.from(codes.values());
  }

  /**
   * Set control row to specific mode, reflected in UI
   * @param modeName Name of control row mode
   */
  setMode(modeName): void {
    if (this.allowableControlModes.has(modeName)) {
      this.controlMode = modeName;
      switch (modeName) {
        case 'modify':
          this.isModifyMode = true;
          break;
        case 'add-button':
          break;
        case 'all-tally':
          break;
        case 'modify-disp':
          break;
        default:
          this.isModifyMode = false;
          delete this.sourceAddButton;
          delete this.targetAddButton;
          delete this.modifyDispButton;
          this.currentExistingTypes = new Set();
          break;
      }
    } else {
      throw new Error('Invalid tally mode: ' + modeName);
    }
  }

  /**
   * Get button types that already exist, to prevent redundant button creation
   * @param code Species code
   */
  getExistingTypes(code: string): Set<string> {
    const types = new Set();
    for (const b of this.tallyButtons) {
      if (b.code === code) {
        types.add(b.type);
      }
    }
    return types;
  }

  /**
   * Return true if Add Tally handling was performed
   * @param button Button from click handler
   */
  handleAddTally(button: TallyButton): boolean {
    if (this.pendingAdd === AddTally.ChooseButton) {
      if (button.type !== 'INVIS') {
        this.onAddNewButtonChoice(button.code);
      }
      return true;
    } else if (this.pendingAdd === AddTally.ChooseLoc) {
      if (button.type === 'INVIS') {
        // Place the button
        this.isPendingNewTempButton = false;
        this.currentAddTargetLoc = button.location;
        button.code = this.targetAddButton.code;
        button.type = this.targetAddButton.type;
        this.currentExistingTypes.add(button.type); // Disable this button now that we added it
        this.pendingAdd = AddTally.ChooseNewButtonType;
      }
      this.saveLayoutToDB();
      return true;
    }
    return false;
  }

  /**
   * User chose a button code to add, advance UI
   * @param code new button code
   */
  onAddNewButtonChoice(code): void {
    this.sourceAddButton = <TallyButton>{
      code: code
    };
    this.currentExistingTypes = this.getExistingTypes(code);
    this.pendingAdd = AddTally.ChooseNewButtonType;
    this.setMode('add-button');
  }

  /**
   * User chose swap location
   * @param button target button location
   */
  handleSwapButton(button: TallyButton): boolean {
    if (this.isPendingMove) {
      if (this.lastButtonClicked && this.lastButtonClicked.pendingMove) {
        console.log(
          `Swapping buttons ${this.lastButtonClicked.location} and ${
            button.location
          }`
        );
        delete this.lastButtonClicked.pendingMove;
        const newLoc = button.location;
        button.location = this.lastButtonClicked.location;
        this.lastButtonClicked.location = newLoc;
        this.isPendingMove = false;
        this.saveLayoutToDB();
      } else {
        button.pendingMove = true;
      }
      if (this.lastButtonClicked) {
        delete this.lastButtonClicked.delta;
      }
      this.lastButtonClicked = button;
      return true;
    }
    return false;
  }

  handleDeleteButton(button: TallyButton): boolean {
    if (this.isPendingDelete && button.type !== 'INVIS') {
      const loc = button.location;
      console.log('Deleting button and count at ', loc);
      // clear tally count
      this.checkDeleteTempButton(button.code);
      this.tallyService.setTallyCount(button.code, button.type, 0);
      this.addTallyHistory(button, 0);
      this.tallyService.saveCountsToDB(this.tripId, this.haulId);
      delete button.code;
      delete button.delta;
      button.type = 'INVIS';
      button.location = loc;
      this.isPendingDelete = false;
      this.saveLayoutToDB();
      return true;
    }
    return false;
  }

  /**
   * If this is the only temp button of its type, delete from tempButtons
   * @param tmpCode temp button code
   */
  checkDeleteTempButton(tmpCode: string) {
    if (tmpCode && tmpCode.startsWith(this.TEMP_BUTTON_PREFIX)) {
      let count = 0;
      for (const button of this.tallyButtons) {
        if (button.code === tmpCode) {
          count++;
          if (count > 1) {
            return;
          }
        }
      }
      if (count === 1) {
        this.zeroCounts(tmpCode);
      }
    }
  }

  /**
   * Rename a group of Temp buttons
   * @param button button chosen to rename
   */
  handleNameTempButton(button: TallyButton): boolean {
    if (
      this.isPendingNameTemp &&
      button.code &&
      button.code.startsWith(this.TEMP_BUTTON_PREFIX)
    ) {
      const sheet = this.pickCodeSheet.open(AddNamedComponent, {
        data: { speciesList: this.speciesList }
      });
      sheet.instance.acceptText = 'CHANGE';
      sheet.afterDismissed().subscribe(code => {
        if (code) {
          this.reassignButtonCodes(button, code);
        }
        this.isPendingNameTemp = false;
      });
      return true;
    }
    return false;
  }

  /**
   * Change disposition of a button
   * @param button button chosen to rename
   */
  handleModifyDisp(button: TallyButton): boolean {
    if (this.isPendingModifyDisp && button.code) {
      this.modifyDispButton = button;
      this.setMode('modify-disp');
      this.isPendingModifyDisp = false;
      return true;
    }
    return false;
  }

  buildAllTallyButtons(code: string): void {
    this.allTallyButtonsRow = [];
    for (const type of this.tallyService.buttonTypes) {
      this.allTallyButtonsRow.push(<TallyButton>{
        code: code,
        type: type,
        count: this.tallyService.getTallyCount(code, type)
      });
    }
  }

  handleAllTally(button: TallyButton): boolean {
    if (this.isPendingAllTallySelect && button.type !== 'INVIS') {
      this.isPendingAllTallySelect = false;
      this.sourceAddButton = <TallyButton>{
        // for UI
        code: button.code
      };
      this.buildAllTallyButtons(button.code);
      this.setMode('all-tally');
      return true;
    }
    return false;
  }

  /**
   * Handle species select to add counts & weights
   * @param button
   */
  handleWeights(button: TallyButton): boolean {
    // TODO: Implement
    if (this.isPendingWeightsSelect && button.type !== 'INVIS') {
      this.isPendingWeightsSelect = false;
      const dialogRef = this.countsWeightsDialog.open(CountsWeightsComponent, {
        width: '900px',
        data: this.tallyService.getCountsWeightsData(button.code, button.type)
      });
      dialogRef.afterClosed().subscribe(result => {
        this.tallyService.setCountsWeights(button.code, button.type, result);
        this.tallyService.saveCountsToDB(this.tripId, this.haulId);
      });
      return true;
    }
    return false;
  }
  /**
   * Tally button clicks
   * @param button Tally
   */
  onButtonClick(button: TallyButton): void {
    if (this.handleAddTally(button)) {
      return;
    } else if (this.handleSwapButton(button)) {
      return;
    } else if (this.handleDeleteButton(button)) {
      return;
    } else if (this.handleAllTally(button)) {
      return;
    } else if (this.handleNameTempButton(button)) {
      return;
    } else if (this.handleModifyDisp(button)) {
      return;
    } else if (this.handleWeights(button)) {
      return;
    }

    // If we made it this far, we are performing a tally operation
    if (this.lastButtonClicked !== undefined) {
      delete this.lastButtonClicked.delta;
    }
    this.lastButtonClicked = button;

    if (button.type === 'INVIS') {
      return;
    }

    let newVal =
      this.tallyService.getTallyCount(button.code, button.type) +
      this.tallyIncDecValue;
    if (newVal < 0) {
      newVal = 0;
    }
    this.tallyService.setTallyCount(button.code, button.type, newVal);
    // Tally clicked, inc or dec
    button.delta = this.tallyIncDecValue;
    this.addTallyHistory(button, newVal);
    this.saveHistoryToDB();
    this.tallyService.saveCountsToDB(this.tripId, this.haulId);
  }

  getBadgeColor(button: TallyButton): string {
    return button.delta > 0 ? 'primary' : 'warn';
  }

  /**
   * Helper to render badge for delta
   * @param button
   */
  getBadgeText(button: TallyButton): string {
    if (button.delta === undefined) {
      return '';
    }

    return button.delta > 0 ? '+' : '-';
  }

  /**
   * Add new tally button click handler
   */
  onAddTallyButtonType(btnType: string): void {
    if (this.pendingAdd === AddTally.ChooseNewButtonType) {
      this.targetAddButton = <TallyButton>{
        code: this.sourceAddButton.code,
        type: btnType,
        count: 0
      };
      this.pendingAdd = AddTally.ChooseLoc;
    }
  }

  getModifyDispButtonStyle(btnType: string): any {
    return {
      'border-style': 'dashed',
      'font-size': 'small'
    };
  }

  onModifyDispType(btnType: string): void {
    this.reassignButtonType(this.modifyDispButton, btnType);
    this.reset();
  }

  getAddTallyButtonStyle(btnType: string): any {
    let extraStyle = {};
    if (this.pendingAdd === AddTally.ChooseNewButtonType) {
      extraStyle = { 'border-style': 'dashed' };
    }
    if (
      this.targetAddButton &&
      this.targetAddButton.type === btnType &&
      this.pendingAdd === AddTally.ChooseLoc
    ) {
      extraStyle = {
        'font-weight': 'bolder',
        'border-style': 'dotted'
      };
    }
    return {
      ...extraStyle,
      'font-size': 'small'
    };
  }

  /**
   * Toggle between increment and decrement
   */
  onTallyModeButton(): void {
    this.tallyIncDecValue *= -1;
  }

  /**
   * Look up desired html class for type of button
   * @param btnType Button Type, e.g. MKT, REG etc
   */
  getButtonClass(btnType: string): any {
    if (btnType === 'INVIS') {
      return {
        'invis-btn': !this.isModifyMode,
        'empty-btn': this.isModifyMode
      };
    } else {
      return btnType.toLowerCase() + '-btn';
    }
  }

  /**
   * Set style and location dynamically
   * TODO: Refactor
   * @param button Tally button
   */
  getLocationStyle(button: TallyButton): any {
    let newStyle = {};
    if (button.pendingMove) {
      newStyle = {
        'border-style': 'dashed'
      };
    } else if (
      (this.isPendingDelete ||
        this.isPendingAllTallySelect ||
        this.isPendingWeightsSelect ||
        this.isPendingModifyDisp ||
        this.pendingAdd === AddTally.ChooseButton) &&
      button.type !== 'INVIS'
    ) {
      newStyle = {
        'border-style': 'dashed'
      };
    } else if (
      this.modifyDispButton &&
      this.modifyDispButton.location === button.location
    ) {
      // pending change of disposition
      newStyle = {
        'border-style': 'dotted'
      };
    } else if (this.isPendingAdd()) {
      if (this.pendingAdd === AddTally.ChooseLoc && button.type === 'INVIS') {
        newStyle = {
          'border-style': 'double'
        };
      }
    } else if (this.isPendingNameTemp) {
      if (
        button.type !== 'INVIS' &&
        button.code.startsWith(this.TEMP_BUTTON_PREFIX)
      ) {
        newStyle = {
          'border-style': 'dashed'
        };
      }
    } else if (button.delta) {
      newStyle = {
        'font-weight': 900
      };
    }
    if (button.code && button.code.startsWith(this.TEMP_BUTTON_PREFIX)) {
      newStyle = {
        'font-style': 'italic',
        'font-weight': 300,
        ...newStyle
      };
    }
    if (!button.location) {
      return newStyle;
    } else {
      return {
        ...newStyle,
        'grid-column-start': button.location[0],
        'grid-column-end': button.location[0],
        'grid-row-start': button.location[1],
        'grid-row-end': button.location[1]
      };
    }
  }
  /**
   * Build text label for button
   * @param btn Tally button object
   */
  getTallyButtonText(btn: TallyButton): string {
    const type = this.hideButtonTypes.has(btn.type) ? '' : btn.type;
    const code = btn.code ? btn.code : '';
    const count = this.tallyService.getTallyCount(btn.code, btn.type);
    return `${code}\n${type}\n${count !== undefined ? count : ''}`;
  }

  isPendingAdd(): boolean {
    return this.pendingAdd !== AddTally.Idle;
  }

  isPendingPlacement(): boolean {
    return this.pendingAdd === AddTally.ChooseLoc;
  }

  /**
   * Top-level function to check if a control operation is underway
   */
  isPendingOperation(): boolean {
    return (
      this.isPendingAdd() ||
      this.isPendingDelete ||
      this.isPendingMove ||
      this.isPendingNameTemp ||
      this.isPendingModifyDisp ||
      this.isPendingWeightsSelect
    );
  }

  /**
   * Move Tally Button pressed - turn on only
   */
  onMoveButton(): void {
    if (this.isPendingMove) {
      this.isPendingMove = false;
    } else if (!this.isPendingOperation()) {
      this.isPendingMove = true;
    }
  }

  onDeleteButton(): void {
    if (this.isPendingDelete) {
      this.isPendingDelete = false;
    } else if (!this.isPendingOperation()) {
      this.isPendingDelete = true;
    }
  }

  onAddButton(): void {
    if (this.pendingAdd === AddTally.ChooseButton) {
      this.pendingAdd = AddTally.Idle;
    } else if (!this.isPendingOperation()) {
      this.pendingAdd = AddTally.ChooseButton;
    }
  }

  onAllTallyButton(): void {
    if (this.isPendingAllTallySelect) {
      this.isPendingAllTallySelect = false;
    } else if (!this.isPendingOperation()) {
      this.isPendingAllTallySelect = true;
    }
  }

  onWeightsButton(): void {
    if (this.isPendingWeightsSelect) {
      this.isPendingWeightsSelect = false;
    } else if (!this.isPendingOperation()) {
      this.isPendingWeightsSelect = true;
    }
  }
  /**
   * Reset states and to go home tally control row
   */
  reset(): void {
    this.pendingAdd = AddTally.Idle;
    if (this.lastButtonClicked) {
      this.lastButtonClicked.pendingMove = undefined;
    }

    this.isPendingMove = false;
    this.isPendingDelete = false;
    this.isPendingAllTallySelect = false;
    this.isPendingNameTemp = false;
    this.isPendingWeightsSelect = false;
    this.setMode('tally');
  }

  /**
   * Destroys all current tally data and resets button layout.
   * Useful for dev - not sure we want this for prod
   */
  resetAllData(): void {
    this.confirmationService.confirm({
      header: 'WARNING',
      message: 'Reset tally counts and weights?',
      accept: () => {
        this.reset();
        console.log(
          `Deleting all tally counts and weights for ${this.tripId} ${
            this.haulId
          }`
        );
        this.resetLayout(this.tallyButtons);
      }
    });
  }

  addTallyHistory(button: TallyButton, count: number): void {
    const timeStr = getBoatnetDateFormatNow('YYYY/MM/DD HH:mm:ss');
    this.tallyHistory.unshift({
      time: timeStr,
      code: button.code,
      type: button.type,
      delta: button.delta,
      newValue: count
    });
  }

  openTallyHistory(): void {
    const sheet = this.tallyHistorySheet.open(TallyHistoryComponent, {
      data: { tallyHistory: this.tallyHistory }
    });
  }

  onAddNamed(): void {
    const sheet = this.pickCodeSheet.open(AddNamedComponent, {
      data: { speciesList: this.speciesList }
    });
    sheet.afterDismissed().subscribe(code => {
      if (code) {
        this.tallyService.addNewSpeciesCode(code);
        this.onAddNewButtonChoice(code);
        if (!this.isPendingOperation()) {
          this.pendingAdd = AddTally.ChooseLoc;
        }
      }
    });
  }

  onModifyDisp(): void {
    if (!this.isPendingOperation()) {
      //    this.addNewSpeciesCode(newTempButton.code);
      //  this.onAddNewButtonChoice(newTempButton.code);
      this.isPendingModifyDisp = true;
    }
  }

  getNextTempCode(): string {
    // get max #
    let maxVal = 0;
    for (const btn of this.tallyButtons) {
      if (btn.code && btn.code.startsWith(this.TEMP_BUTTON_PREFIX)) {
        const val = parseInt(btn.code.replace(this.TEMP_BUTTON_PREFIX, ''), 10);
        if (val > maxVal) {
          maxVal = val;
        }
      }
    }

    return this.TEMP_BUTTON_PREFIX + (maxVal + 1).toString();
  }

  onAddTempSpecies(): void {
    if (!this.isPendingOperation()) {
      const newTempButton = <TallyButton>{
        code: this.getNextTempCode()
      };
      this.tallyService.addNewSpeciesCode(newTempButton.code);
      this.onAddNewButtonChoice(newTempButton.code);
      this.isPendingNewTempButton = true;
    }
  }

  onNameTempSpecies(): void {
    if (this.isPendingNameTemp) {
      this.isPendingNameTemp = false;
    } else if (!this.isPendingOperation()) {
      this.isPendingNameTemp = true;
    }
  }

  tempButtonsExist(): boolean {
    for (const b of this.tallyButtons) {
      if (b.code && b.code.startsWith(this.TEMP_BUTTON_PREFIX)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Reassign and merge a button type. Does not delete duplicate (merged) buttons.
   * @param origButton Button to change
   * @param newType New type to merge
   */
  reassignButtonType(origButton: TallyButton, newType: string): void {
    if (origButton && newType) {
      console.log(`Change ${origButton.type} to ${newType}`);
      const oldType = origButton.type;

      for (const b of this.tallyButtons) {
        if (
          b.type === oldType &&
          b.code === origButton.code &&
          b.location === origButton.location
        ) {
          const currentCount = this.tallyService.getTallyCount(b.code, oldType);
          const existCount = this.tallyService.getTallyCount(b.code, newType);
          this.tallyService.setTallyCount(
            b.code,
            newType,
            existCount + currentCount
          ); // Set new type count
          this.tallyService.setTallyCount(b.code, oldType, 0); // Clear old type count
          const newTotal = existCount + currentCount;
          b.type = newType;

          this.addTallyHistory(
            // Zero-out old code
            <TallyButton>{ code: b.code, delta: -currentCount, type: oldType },
            0
          );
          this.addTallyHistory(
            // Increment new code
            <TallyButton>{ code: b.code, delta: currentCount, type: newType },
            newTotal
          );

          this.saveHistoryToDB();
          break;
        }
      }
    }
    this.saveLayoutToDB();
  }

  private saveHistoryToDB() {
    this.tallyService.saveTallyHistoryToDB(
      this.tripId,
      this.haulId,
      this.tallyHistory
    );
  }

  private saveLayoutToDB() {
    this.tallyService.saveLayoutToDB(
      this.tripId,
      this.haulId,
      this.tallyButtons
    );
  }

  /**
   * Reassign and merge a button code. Does not delete duplicate (merged) buttons.
   * @param origButton Button code to change
   * @param newCode New code to merge
   */
  reassignButtonCodes(origButton: TallyButton, newCode: string): void {
    if (origButton && newCode) {
      const oldCode = origButton.code;
      for (const b of this.tallyButtons) {
        if (b.code === oldCode) {
          const currentCount = this.tallyService.getTallyCount(oldCode, b.type);
          const existCount = this.tallyService.getTallyCount(newCode, b.type);
          let newCount = currentCount;
          if (existCount !== undefined) {
            // merge counts
            this.tallyService.setTallyCount(
              newCode,
              b.type,
              existCount + currentCount
            );
            newCount = existCount + currentCount;
          } else {
            this.tallyService.addNewSpeciesCode(newCode);
            this.tallyService.setTallyCount(newCode, b.type, currentCount);
          }
          b.code = newCode;
          this.reviseHistoryCode(
            b.type,
            oldCode,
            newCode,
            currentCount,
            newCount
          );
        }
      }

      // delete temp tally button (fired for first temp button)
      // so temp #'s are reused
      this.zeroCounts(oldCode);
      this.saveLayoutToDB();
      this.saveHistoryToDB();
    }
  }

  zeroCounts(buttonCode: string): void {
    // Reset counts to 0 for a specific button code (e.g. TMP1)
    for (const type of this.tallyService.buttonTypes) {
      this.tallyService.setTallyCount(buttonCode, type, 0);
    }
  }

  reviseHistoryCode(
    type: string,
    oldCode: string,
    newCode: string,
    newDelta: number,
    newTotal: number
  ) {
    console.log(`History revision: ${oldCode} -> ${newCode}`);
    // No longer changing code of TMP buttons in history.
    this.addTallyHistory(
      <TallyButton>{ code: oldCode, delta: -newDelta, type: type },
      0
    );
    this.addTallyHistory(
      <TallyButton>{ code: newCode, delta: newDelta, type: type },
      newTotal
    );
  }

  openTemplateManager() {
    console.log('Opening template manager');
    const dialogRef = this.templateManagerDialog.open(
      TemplateManagerComponent,
      {
        width: '800px',
        data: this.tallyButtons
      }
    );
    dialogRef.afterClosed().subscribe(newButtons => {
      if (newButtons) {
        this.resetLayout(newButtons);
      }
      // this.tallyService.setCountsWeights(button.code, button.type, result);
      // this.tallyService.saveCountsToDB(this.tripId, this.haulId);
    });
  }

  resetLayout(buttons: TallyButton[]) {
    this.tallyHistory = new Array<TallyHistoryChange>();
    this.tallyButtons = <TallyButton[]>buttons;
    this.tallyService.setUniqueCodes(this.getUniqueCodes(this.tallyButtons));
    this.tallyService.resetData(
      this.tripId,
      this.haulId,
      this.tallyButtons,
      this.tallyHistory
    );
  }
}
