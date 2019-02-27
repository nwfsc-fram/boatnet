import { BoatnetBase, BoatnetDate } from '@boatnet/bn-models';

export class Specimen implements BoatnetBase {
  id: string;
  type: 'specimen';
  created_by: string;
  created_date: BoatnetDate;
  specimen_type: string;
  sex: string;
  lineal?: {
    lineal_type: string;
    lineal_cm: number;
  };
  weight?: {
    weight_kg: number;
  };
  alpha_value?: string;
  numeric_value?: number;
  labels?: {
    whole_specimen?: string;
    age?: string;
    age_structure?: string;
    ovary?: string;
    tissue?: string;
    stomach?: string;
    finclip?: string;
    cutting?: string;
  };
  viability?: string;
  lifestage?: string;
  population?: string;
  num_specimens: number;
  // TODO protocol type used?
  location?: {
    latitude_dd: number;
    longitude_dd: number;
  };
  // TODO Photographs?
}
