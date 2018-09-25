import { v4 as uuid } from 'uuid';
import { Catch } from '../interface/catch';
import { User } from '../shared/user';
const moment = require('moment');

export class AshopCatch implements Catch {
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

  public constructor(init?: Partial<AshopCatch>) {
    Object.assign(this, init);
  }

  static createCatch(catchNumber: number, species: string,
    protocol: string, userheader: string) {
    return new AshopCatch({
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
export const AshopCatchConfig = {
  catchType: AshopCatch,
  cols: [
    {field: 'species', header: 'Species', type: 'string', width: '160px'},
    {field: 'totalCount', header: 'Count', type: 'number', width: '60px'},
    {field: 'totalWeight', header: 'Weight (kg)', type: 'number', uom: 'kg', width: '80px'},
    {field: 'flowScaleStart', header: 'Flow Start', type: 'number', uom: 'kg', width: '60px'},
    {field: 'flowScaleStop', header: 'Flow Stop', type: 'number', uom: 'kg', width: '60px'},
    {field: 'percentDiscard', header: '% Discard', type: 'number', width: '60px'},
    {field: 'protocol', header: 'Protocol', type: 'string', width: '120px'},
  ], grouping: 'Sample', subgrouping: 'Subsample', netGroup: false

};
