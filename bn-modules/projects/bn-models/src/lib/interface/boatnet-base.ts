import { BoatnetDate } from '../types/boatnet-date';
/**
 * Base interface for Boatnet DB Entries
 */
export interface BoatnetBase {
  id: string; // UUID or unique id
  type: string; // doc type string
  created_by: string; // username
  created_date: BoatnetDate; // Boatnet Date
  modified_by?: string;
  modified_date?: BoatnetDate;
}
