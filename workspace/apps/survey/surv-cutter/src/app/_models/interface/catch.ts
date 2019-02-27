import { BoatnetBase } from './boatnet-base';

export interface Catch extends BoatnetBase {
  type: 'catch';
  catchNumber: number;
  taxonomyId?: number;
  species: string;
  totalWeight: number;
  totalCount: number;
  protocol?: string;
  catchReceptacles?: any[];
}
