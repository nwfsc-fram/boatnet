import { BaseSpecimen } from '../_base';
import { CatchContent } from '../_lookups';

export const HakeSurveySpecimenTypeName = 'hake-survey-specimen';

export interface HakeSurveySpecimen extends BaseSpecimen {

  visualStomachContents?: CatchContent[]; // new in 2019

  legacy?: {
  };
}
