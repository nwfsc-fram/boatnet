import { Base } from '../_base/index';

// Ignore simple interface linting warning
// https://github.com/palantir/tslint/blob/master/docs/usage/rule-flags/index.md
/* tslint:disable:no-empty-interface */
export const SpeciesTypeName = 'species';
export interface Species extends Base {
  // TODO
  name: string;
}
