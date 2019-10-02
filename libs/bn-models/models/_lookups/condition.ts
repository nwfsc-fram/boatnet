import { Base } from '../_base';

export const ConditionTypeName = 'condition';

export interface Condition extends Base {
  description?: string;
  animalCode?: string; 
  animalDescription?: string;

  legacy?: {
    conditionCode?: string;
  };
}
