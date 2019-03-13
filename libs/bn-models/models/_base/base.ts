// Boatnet Base interface, all stored data should inherit this.

import { BoatnetDate } from '../_common/index';

export interface Base {
  _id: string; // ID, couchDB compatible
  type: string; // current pattern is to declare a xxxTypeName, see wcgop-haul
  createdBy: string; // Username
  createdDate: BoatnetDate; // ISO 8601 date
  updatedBy?: string; // Username
  updatedDate?: BoatnetDate; // ISO 8601 date
  comments?: string; // Optional Comments
  dataSource?: string; // hostname available?
  legacy?: any; // Optional legacy data from original database import
}
