import { v4 as uuid } from 'uuid';
import { Catch } from '../interface/catch';
import { User } from '../shared/user';
const moment = require('moment');

export class AcousticCatch implements Catch {
  id: string;
  type: 'catch';
  catchNumber: number;
  taxonomyId?: number;
  species: string;
  totalWeight: number;
  totalCount: number;
  protocol?: string;
  catchReceptacles?: AcousticCatch[];

  createdBy: string;
  createdDate: BoatnetDate;
  modifiedBy?: string;
  modifiedDate?: BoatnetDate;

  public constructor(init?: Partial<AcousticCatch>) {
    Object.assign(this, init);
  }

  static createCatch(
    catchNumber: number,
    taxonomyId: number,
    species: string,
    protocol: string,
    username: string
  ) {
    return new AcousticCatch({
      id: uuid(),
      type: 'catch',
      catchNumber: catchNumber,
      taxonomyId: taxonomyId,
      species: species,
      totalWeight: 0,
      totalCount: 0,
      protocol: '',
      createdBy: username,
      createdDate: moment().format()
    });
  }
}

// TODO Todd - could valid parameters below
//  i.e. min/max range values for numbers, regex for strings, etc.
export const AcousticCatchConfig = {
  catchType: AcousticCatch,
  cols: [
    { field: 'species', header: 'Species', type: 'string', width: '300px' },
    { field: 'totalCount', header: 'Count', type: 'number', width: '120px' },
    {
      field: 'totalWeight',
      header: 'Weight',
      type: 'number',
      uom: 'kg',
      width: '120px'
    },
    { field: 'protocol', header: 'Protocol', type: 'string', width: '300px' }
  ],
  grouping: 'Mix',
  subgrouping: 'Submix',
  netGroup: true
};
