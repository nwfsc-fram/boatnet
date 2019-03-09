// Boatnet Base interface, all stored data should inherit this.

import { BoatnetDate } from '../_common/index';

export interface Base {
  _id: string; // ID, couchDB compatible
  type: string;
  created_by: string; // Username
  created_date: BoatnetDate; // ISO 8601 date
  updated_by?: string; // Username
  updated_date?: BoatnetDate; // ISO 8601 date
  comments?: string; // Optional Comments
  legacyData?: any; // Optional legacy data from original database import
}
