import { v4 as uuid } from 'uuid';
import { Catch } from '../interface/catch';
import { User } from '../shared/user';
const moment = require('moment');
export class WcgopCatch implements Catch {
  id: string;
  type: 'catch';
  catchNumber: number;
  species: string;
  totalWeight: number;
  totalCount: number;
  protocol: string;
  catchReceptacles: string[];

  createdBy: string;
  createdDate: BoatnetDate;
  modifiedBy?: string;
  modifiedDate?: BoatnetDate;

  public constructor(init?: Partial<WcgopCatch>) {
    Object.assign(this, init);
  }

  static createCatch(
    catchNumber: number,
    species: string,
    protocol: string,
    userheader: string
  ) {
    return new WcgopCatch({
      id: uuid(),
      type: 'catch',
      catchNumber: catchNumber,
      species: species,
      totalWeight: 0,
      totalCount: 0,
      protocol: '',
      createdBy: userheader,
      createdDate: moment().format()
    });
  }
}

// TODO Todd - could valid parameters below
//  i.e. min/max range values for numbers, regex for strings, etc.
export const WcgopCatchConfig = {
  catchType: WcgopCatch,
  cols: [
    {
      field: 'disposition',
      header: 'R/D',
      type: 'string',
      width: '60px',
      visible: false
    },
    {
      field: 'weightMethod',
      header: 'WM',
      type: 'number',
      width: '60px',
      visible: false
    },
    {
      field: 'species',
      header: 'Catch',
      type: 'string',
      width: '200px',
      visible: true
    },
    {
      field: 'totalWeight',
      header: 'Wt (lbs)',
      type: 'number',
      uom: 'lbs',
      width: '80px',
      visible: true
    },
    {
      field: 'totalCount',
      header: 'Count',
      type: 'number',
      width: '60px',
      visible: true
    },
    {
      field: 'discardReason',
      header: 'Discard Reason',
      type: 'string',
      width: '120px',
      visible: true
    },
    {
      field: 'protocol',
      header: 'Protocol',
      type: 'string',
      width: '120px',
      visible: true
    },
    {
      field: 'specimenCount',
      header: 'Bio Count',
      type: 'boolean',
      width: '80px',
      visible: true
    }
  ],
  grouping: 'Sample',
  subgrouping: 'Subsample',
  netGroup: false
};
