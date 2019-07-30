// Boatnet Base interface, all stored data should inherit this.

import { BoatnetDate, CouchID } from '../_common/index';

type BoatnetUserName = string;
export interface Base {
  _id?: CouchID; // UUID, couchDB compatible
  _rev?: string; // Couch revision
  type?: string; // current pattern is to declare a xxxTypeName, see wcgop-haul
  createdBy?: string; // Username
  createdDate?: BoatnetDate; // ISO 8601 date
  updatedBy?: BoatnetUserName; // Username
  updatedDate?: BoatnetDate; // ISO 8601 date
  uploadedBy?: BoatnetUserName; // ETL User
  uploadedDate?: BoatnetDate; // uploaded to final CouchDB
  notes?: string; // Notes/ Comments
  dataSource?: string; // hostname available?
  isDeleted?: boolean; // hide from user, show to Beth :)
  legacy?: any; // Other legacy data from original database import
}
