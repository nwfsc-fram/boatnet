
import { WcgopCatchSpecies } from '../wcgop/wcgop-catch-species';

export interface SpeciesMix {
  name: string;
  speciesItems?: WcgopCatchSpecies[];
  mixes?: SpeciesMix[];
}

// Experiment with a Mix/ Submix
// this.exampleCatch = {
//     _id: '1',
//     type: WcgopCatchTypeName,
//     createdBy: 'test',
//     createdDate: moment().format(),
//     species: [
//       {
//         name: 'Mix 1',
//         speciesItems: [
//           {
//             species: {
//               _id: '1',
//               name: 'Abyssal Crangon',
//               type: SpeciesTypeName,
//               createdBy: 'test',
//               createdDate: moment().format()
//             },
//             discardReason: '12'
//           }
//         ],
//         mixes: [
//           {
//             name: 'Submix 1',
//             speciesItems: [
//               {
//                 species: {
//                   _id: '2asdf',
//                   name: 'Ultimate Crangon',
//                   type: SpeciesTypeName,
//                   createdBy: 'test',
//                   createdDate: moment().format()
//                 },
//                 discardReason: '12'
//               }
//             ]
//           }
//         ]
//       },
//       {
//         name: 'Mix 2'
//       }
//     ]
//   };