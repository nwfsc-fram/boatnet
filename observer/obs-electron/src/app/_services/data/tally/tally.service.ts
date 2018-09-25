import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { HttpClient } from '@angular/common/http';

import { TallyHistoryChange } from '../../../_models/wcgop/tally/tally-history-change';
import { TallyButton } from '../../../_models/wcgop/tally/tally-button';
import { TallyDataEntry } from '../../../_models/wcgop/tally/tally-data-entry';
import { TallyData } from '../../../_models/wcgop/tally/tally-entry';
import { getBoatnetDateNow } from '../../../shared/util';
import { AuthenticationService } from '../../auth/authentication.service';
import { CountsWeightsData } from '../../../_models/wcgop/tally/counts-weights-data';
import { TemplateService } from './template.service';

@Injectable({
  providedIn: 'root'
})
export class TallyService {
  tallies: TallyData;
  buttonTypes = [
    'SFTY',
    'DOCK',
    'ACCI',
    'USED',
    'OTHR',
    'REG',
    'DROP',
    'PRED',
    'MKT',
    'RET'
  ];

  allCodes = [];

  mapCodeTypeCount = new Map<string, number>(); // map code + type to count
  mapCountsWeights = new Map<string, CountsWeightsData>();

  currentPDFInfo: { tripId: string; haulId: string; formDate: BoatnetDate } = {
    tripId: '',
    haulId: '',
    formDate: getBoatnetDateNow()
  };

  constructor(
    private authService: AuthenticationService,
    private dataService: DataService,
    private templateService: TemplateService,
    private http: HttpClient
  ) {}

  /**
   * Build key used in tally value Map
   * @param code species code
   * @param type button type (RET etc)
   */
  makeKey(code: string, type: string): string {
    return code + ' ' + type;
  }

  setUniqueCodes(codes: Array<string>): void {
    this.allCodes = codes;
    this.buildCountMap();
  }

  /**
   * Add a new species code
   * @param code button code e.g. ASRK
   */
  addNewSpeciesCode(code: string): void {
    // Create unique set to prevent adding the same code twice
    const newCodes = new Set(this.allCodes);
    console.log('Adding code', code);
    newCodes.add(code);
    this.allCodes = Array.from(newCodes);
    this.buildCountMap();
  }

  /**
   * Build map for code + type: count
   */
  buildCountMap(): void {
    for (const c of this.allCodes) {
      for (const t of this.buttonTypes) {
        if (this.mapCodeTypeCount.has(this.makeKey(c, t))) {
          continue;
        }
        this.mapCodeTypeCount.set(this.makeKey(c, t), 0);
      }
    }
    console.log(`Built count map of ${this.mapCodeTypeCount.size} buttons.`);
  }

  storeTallyData(trip: string, haul: string, tallyData: TallyDataEntry[]) {
    const id = this.getTallyId(trip, haul);
    this.dataService
      .get(id)
      .then(result => {
        console.log('Updated record ' + id);
        this.tallies = result;
        this.tallies.tallyData = tallyData;
        this.dataService.put(this.tallies.id, this.tallies);

        this.currentPDFInfo.formDate = getBoatnetDateNow();
        this.currentPDFInfo.haulId = haul;
        this.currentPDFInfo.tripId = trip;
      })
      .catch(err => {
        if (err.status === 404) {
          console.log('Create record ' + id);
          this.tallies = new TallyData();
          this.tallies.id = id;
          this.tallies.type = 'tally';
          this.tallies.created_by = this.authService.getCurrentUsername();
          this.tallies.created_date = getBoatnetDateNow();
          this.tallies.tallyData = tallyData;
          this.currentPDFInfo.formDate = this.tallies.created_date;
          this.currentPDFInfo.haulId = haul;
          this.currentPDFInfo.tripId = trip;
          this.dataService
            .put(this.tallies.id, this.tallies)
            .then(res => {
              // console.log(res);
            })
            .catch(createError => {
              console.log('Error creating record', createError);
            });
        } else {
          console.log('Fail to save tally data:', err);
          return;
        }
      });
  }

  /**
   * TODO Need to generate UUID
   * @param trip
   * @param haul
   * @param username
   */
  getTallyId(trip: string, haul: string): string {
    return `tally-${trip}-${haul}-${this.authService.getCurrentUsername()}`;
  }

  getTallyLayoutId(trip: string, haul: string, templateName?: string): string {
    const template = templateName ? '-' + templateName : '';
    return `tally-layout-${trip}-${haul}-${this.authService.getCurrentUsername()}${template}`;
  }

  getTallyHistoryId(trip: string, haul: string): string {
    return `tally-history-${trip}-${haul}-${this.authService.getCurrentUsername()}`;
  }

  storeTallyHistory(
    trip: string,
    haul: string,
    tallyHistoryData: TallyHistoryChange[]
  ) {
    const id = this.getTallyHistoryId(trip, haul);
    console.log('Store tally history', id);
    const data = {
      tallyHistoryData: tallyHistoryData
    };
    this.dataService.put(id, data);
  }

  storeTallyLayout(
    trip: string,
    haul: string,
    templateData: TallyButton[],
    templateName?: string
  ) {
    const id = this.getTallyLayoutId(trip, haul, templateName);
    console.log('Store tally layout', id);
    const data = {
      templateData: templateData
    };
    this.dataService.put(id, data);
  }

  fetchTallyLayout(
    trip: string,
    haul: string,
    templateName?: string
  ): Promise<any> {
    const id = this.getTallyLayoutId(trip, haul, templateName);
    return this.dataService.get(id);
  }

  fetchTallyHistory(trip: string, haul: string): Promise<any> {
    const id = this.getTallyHistoryId(trip, haul);
    return this.dataService.get(id);
  }

  getTallyPDFData() {
    const tallyFormData = <any>[];
    tallyFormData.push([
      'Catch',
      'Species',
      'Weight Method',
      'Tally Count',
      'Total Wt.',
      'Disp.',
      'Calculations'
    ]);

    if (this.tallies) {
      for (const d of this.tallies.tallyData) {
        const commonName = this.dataService.getSpeciesCommonName(d.speciesCode);
        tallyFormData.push([
          d.catch,
          { text: d.speciesCode + ` (${commonName})`, bold: true },
          { text: d.weightMethod ? d.weightMethod : '-', alignment: 'center'},
          { text: d.fishCount },
          { text: d.weight ? d.weight.toFixed(2) : '-', bold: true },
          { text: d.disposition, bold: true, alignment: 'center'},
          { text: d.calculations ? d.calculations : '-'}
        ]);
      }
    }

    return {
      tallyInfo: this.currentPDFInfo,
      tallyData: tallyFormData
    };
  }

  /**
   * Load tally entries from DB based on trip, haul
   */
  fetchTallyData(trip: string, haul: string): Promise<any> {
    const id = this.getTallyId(trip, haul);
    return new Promise((resolve, reject) => {
      this.dataService
        .get(id)
        .then(result => {
          if (result) {
            for (const r of result.tallyData) {
              if (r.countsWeights) {
                this.mapCountsWeights.set(
                  this.makeKey(r.speciesCode, r.disposition),
                  r.countsWeights
                );
              }
            }
          }
          resolve(result);
        })
        .catch(err => {
          console.log('Tally count data error:', err);
          resolve(undefined);
        });
    });
  }

  checkTally(code: string, type: string): boolean {
    if (!this.mapCodeTypeCount.size) {
      // throw new Error('Invalid code/type map.');
      return false;
    } else if (this.mapCodeTypeCount.has(this.makeKey(code, type))) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Get tally count for a code + type
   * @param button
   */
  getTallyCount(code: string, type: string): number {
    if (this.checkTally(code, type)) {
      return this.mapCodeTypeCount.get(this.makeKey(code, type));
    } else {
      return undefined;
    }
  }

  /**
   * Set code + button type tally counts directly
   * @param code Species Code
   * @param type Button type (RET, etc)
   * @param count Value to set
   */
  setTallyCount(code: string, type: string, count: number): number {
    if (this.checkTally(code, type)) {
      this.mapCodeTypeCount.set(this.makeKey(code, type), count);
      return count;
    } else {
      return undefined;
    }
  }

  /**
   * Build array of TallyDataEntry and push to DB service
   */
  saveCountsToDB(tripId: string, haulId: string) {
    const tallyData = Array<TallyDataEntry>();

    const tallies = Array.from(this.mapCodeTypeCount).filter(([key, value]) => {
      return value > 0 || this.mapCountsWeights.has(key);
    });

    // Build Tally Data
    for (const [key, value] of tallies) {
      const [species, disp] = key.split(' ');
      const entry = new TallyDataEntry();
      entry.speciesCode = species;
      entry.disposition = disp;
      entry.fishCount = value;
      entry.weightMethod = 13; // TODO - hardcoded for now
      entry.countsWeights = this.mapCountsWeights.get(
        this.makeKey(species, disp)
      );
      if (entry.countsWeights) {
        entry.rollupCountsWeights();
      }
      tallyData.push(entry);
    }

    // console.log('STORED TALLY DATA', tallyData);

    // sort by disposition (RET first) then by code
    tallyData.sort((a, b) => {
      if (a.disposition === b.disposition) {
        // if equiv, sort by species code
        return a.speciesCode === b.speciesCode
          ? 0
          : +(a.speciesCode > b.speciesCode) || -1;
      }

      // special case, sort RET to top
      if (a.disposition === 'RET') {
        return -1;
      } else if (b.disposition === 'RET') {
        return 1;
      }

      // sort other dispositions normally
      if (a.disposition > b.disposition) {
        return 1;
      } else {
        return -1;
      }
    });

    // set catch #'s
    // Note: added "downlevelIteration": true to tsconfig.app.json for map iteration option
    for (const entry of tallyData.entries()) {
      entry[1].catch = entry[0] + 1;
    }
    this.storeTallyData(tripId, haulId, tallyData);
  }

  /**
   * For loading from DB, populate counts
   * @param counts
   */
  setCountsFromArray(counts: TallyDataEntry[]) {
    for (const c of counts) {
      this.setTallyCount(c.speciesCode, c.disposition, c.fishCount);
    }
  }

  /**
   * Load buttons (layout) from DB
   */
  loadTallyLayoutFromDB(tripId: string, haulId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fetchTallyLayout(tripId, haulId)
        .then(result => {
          // We don't want to load the delta value.
          for (const t of result.templateData) {
            if (t.delta) {
              delete t.delta;
              break;
            }
          }
          resolve(result.templateData);
        })
        .catch(err => {
          console.log('Tally Layout error:', err);
          resolve(undefined);
        });
    });
  }

  loadTallyHistoryFromDB(tripId: string, haulId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fetchTallyHistory(tripId, haulId)
        .then(result => {
          // console.log('Tally history loaded from databse.', result.tallyHistoryData);
          resolve(result.tallyHistoryData);
        })
        .catch(err => {
          console.log('Tally History error:', err);
          resolve(undefined);
        });
    });
  }

  saveLayoutToDB(tripId: string, haulId: string, buttons: TallyButton[]) {
    this.storeTallyLayout(tripId, haulId, buttons);
  }

  saveTallyHistoryToDB(
    tripId: string,
    haulId: string,
    history: TallyHistoryChange[]
  ) {
    this.storeTallyHistory(tripId, haulId, history);
  }

  /**
   * Clear all tally data
   */
  resetData(
    tripId: string,
    haulId: string,
    buttons: TallyButton[],
    history: TallyHistoryChange[]
  ): void {
    this.mapCodeTypeCount = new Map<string, number>();
    this.mapCountsWeights = new Map<string, CountsWeightsData>();
    this.buildCountMap();
    this.saveCountsToDB(tripId, haulId);
    this.saveLayoutToDB(tripId, haulId, buttons);
    this.saveTallyHistoryToDB(tripId, haulId, history);
  }

  /**
   * Load tally data from DB (layout from JSON if not stored)
   */
  fetchTallyInfo(tripId: string, haulId: string): Promise<TallyButton[]> {
    return new Promise<TallyButton[]>((resolve, reject) => {
      this.loadTallyLayoutFromDB(tripId, haulId)
        .then(layout => {
          if (layout) {
            console.log('Loaded tally layout from DB.');
            resolve(<TallyButton[]>layout);
          } else {
            this.templateService.loadTemplate('default')
            .then(res => {
              this.storeTallyLayout(tripId, haulId, <TallyButton[]>res);
              resolve(<TallyButton[]>res);
            })
            .catch(err => {
              reject(err);
            });
          }
        })
        .then(() => {
          this.fetchTallyData(tripId, haulId).then(data => {
            if (data) {
              this.setCountsFromArray(data.tallyData);
              this.saveCountsToDB(tripId, haulId); // populate tallyData in dataService for PDF Generation
            }
          });
        })
        .then(() => {});
    });
  }

  /**
   * Get all data and counts + weights data for a code + type
   */
  getCountsWeightsData(code: string, type: string): TallyDataEntry {
    let data;
    for (const tally of this.tallies.tallyData) {
      if (tally.speciesCode === code && tally.disposition === type) {
        data = tally;
        break;
      }
    }
    if (!data) {
      console.log('Creating tally record for', code, type);
      this.setTallyCount(code, type, 0);
      data = <TallyDataEntry>{ speciesCode: code, disposition: type };
    }
    if (!data.countsWeights) {
      console.log('Creating CW data');
      data.countsWeights = new CountsWeightsData(0, 0, 0, []);
    }
    return data;
  }

  /**
   * Set counts + weights data for a code + type
   */
  setCountsWeights(code: string, type: string, data: CountsWeightsData) {
    // console.log('setCountsWeights', code, type, data);
    this.mapCountsWeights.set(this.makeKey(code, type), data);
  }
}
