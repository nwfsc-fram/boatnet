// Base Catch Class, intended to be subclassed
import { Base } from './base';

// Ignore simple interface linting warning
// https://github.com/palantir/tslint/blob/master/docs/usage/rule-flags/index.md
/* tslint:disable:no-empty-interface */

export interface BaseCatch extends Base {
  // use createdDate for sequential ordering
}

// Example object for discussion purposes
// {
//   disposition: 'D',
//   weightMethod: 12,
//   catchData: [
//     {
//       speciesName: 'canary',
//       discardReason: 1
//       data: 123
//     },
//     {
//       speciesName: 'not canary',
//       data: 123
//     },
//     {
//       mixName: 'mix #1',
//       data: [
//           {
//             name: 'snail',
//             data: 123
//           },
//           {
//             name: 'abyssal crangon',
//             data: 123
//           },
//           {
//             mixName: 'submix #1',
//             data: [
//               {
//                 name: 'Insane Megafish',
//                 data: 234
//               }
//             ]
//           }
//       ]
//     }
//   ]
// }
