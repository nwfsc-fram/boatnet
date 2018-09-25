// import { Categories, Programs, Positions } from './_models/shared/values';

export enum Categories { Survey, Observer }
export enum Programs { Trawl, Hake, HookAndLine, WCGOP, ASHOP }
export enum GearTypes { Trawl, FixedGear }
export enum Positions { First, Second, Third }

// Hake Survey Example
// export const Settings = {
//   category: Categories.Survey,
//   program: Programs.Hake,
//   position: Positions.First
// };

// WCGOP Observer Example
export const Settings = {
  category: Categories.Observer,
  program: Programs.WCGOP,
  position: Positions.First
};

// A-SHOP Observer Example
// export const Settings = {
//   category: Categories.Observer,
//   program: Programs.ASHOP,
//   position: Positions.First
// };
