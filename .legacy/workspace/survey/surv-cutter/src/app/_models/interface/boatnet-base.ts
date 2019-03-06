export interface BoatnetBase {
  id: string; // UUID or unique id
  type: string; // doc type string
  createdBy: string; // username
  createdDate: BoatnetDate; // Boatnet Date
  modifiedBy?: string;
  modifiedDate?: BoatnetDate;
}
