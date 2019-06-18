import { Base } from '../_base/index';
import { Person } from './person';
import { TaxonomyAlias } from './taxonomy-alias';
import { Measurement, BoatnetDate, CouchID } from '../_common';
import { GearType } from './gear-type';
import { Fishery } from './fishery';
import { CatchDisposition } from './catch-disposition';

export const ProtocolTypeName = 'protocol';

declare type ObservationType = string; // TODO - Lookup
declare type BiostructureType = string; // TODO - Lookup
declare type Stratum = string; // TODO - Lookup
declare type SamplingStrategy = string; // TODO - Lookup
// Simple Random, Stratified Random, Opportunistic/Haphazard, Census

export const ProgramYearProtocolTypeName = 'program-year-protocol';
export interface ProgramYearProtocol extends Base {
  protocolName: string; // A-SHOP 2018.1, A-SHOP 2018.2
  startDate: BoatnetDate;
  endDate: BoatnetDate;
  protocols: Protocol[];
}

/*
Step 1
  protocols: [
    {
      taxonomy: canary,
      observations { sex: 100, length 100}
    }, 

Step 2 - Create new record (is this a subdivision or a new sample?)

protocols: [
    {
      taxonomy: canary,
      observations { sex: 75, length 75}
    }, 
    {
      taxonomy: canary
      observations { sex 25, length 25, weight 25}
      biostructures { age 25 }
    },


#1
SL100AW25FiOv5

What are strata?
================
-- Distributional Constraints
perHaul
perLeg
perDay
vesselColor (orange v. blue)

minLength, maxLength distribution
spatio-temporal distribution

-- Spatio-Temporal constraints
minDate, maxDate - (may be specified as season/pass)
minLatitude, maxLatitude (spatial, specified as which legs)
minDepth, maxDepth (spatial)

-- Management constraints
fisheries (WCGOP / A-SHOP)
gearType (WCGOP / A-SHOP)
disposition (WCGOP)
vesselType (mothership v. catcher processor - A-SHOP)

ProgramYearVessel {
  protocols: [
    {
      taxonomy: canary,
      name: SL75
      strata: {
        isPerHaul: yes
      }
      count: 75
      observations { sex, length }
    }, 
    {
      taxonomy: canary
      name: SL20AW20
      strata: {
        isPerHaul: yes
      }
      count: 20
      observations { sex, length, weight }
      biostructures { age }
    },
    {
      taxonomy: canary
      name: SL2AW2Ov2
      strata: {
        isPerLeg: yes
        lengthMin: 26cm
        lenghtMax: 30cm
      }
      count: 2
      observations { sex, length, weight }
      biostructures { age, ovary }
    },
    {
      taxonomy: canary
      name: SL5AW5FiOv5
      strata: {
        isPerLeg: yes
        lengthMin: 31cm
        lenghtMax: 35cm
      }
      count: 5
      observations { sex, length, weight }
      biostructures { age, ovary }
    },
    {
      taxonomy: canary
      name: SL5AW5FiOv5
      strata: {
        isPerLeg: yes
        lengthMin: 36cm
        lenghtMax: 40cm
      }
      count: 1
      observations { sex, length, weight }
      biostructures { age, ovary }
    },
    {
      taxonomy: canary
      name: SL5AW5Fi
      strata: {
        isPerHaul: yes
      }
      count: 5
      observations { sex, length, weight }
      biostructures { age, finclip }
    },
  ]
}

#2
ProgramYearVessel {
  protocols: [
    {
      taxonomy: canary,
      name: SL100
      count: 100
      observations { sex, length}
      children: [
        {
          taxonomy: canary,
          count: 25
          name: AW25
          observations { weight }
          biostructures { age }
          children: [
            {
              taxonomy: canary,
              name: StTi5
              count: 5,
              biostructures { stomach, tissue}
            },
            {
              taxonomy: canary,
              count: 5,
              biostructures { ovaries}
            },
          ]
        }
      ]
    }, 

}


#3
protocols: [
  {
    taxonomy: 'canary',
    // .. other strata
    observations: [
      {
        type: 'sex',
        count: 100
      },
      {
        type: 'length',
        count: 100
      },
      {
        type: 'weight',
        count: 25
      }
    ],
    biostructures: [
      {
        type: 'age',
        count: 25
      },
      {
        type: 'stomach',
        count: 5
      },
      {
        type: 'tissue',
        count: 5
      },
      {
        type: 'ovary',
        count: 5
      },
    ]
  }
];

*/
export interface Protocol extends Base {

  protocolName?: string; // SL100AW25 StTi+
  samplingStrategy?: SamplingStrategy;

  taxonomy: TaxonomyAlias;
  principalInvestigator: Person;      // Who

  // children?: Protocol[];

  // Strata
  fisheries?: Fishery[];  // For survey, could use Scientific Research 
  gearTypes?: GearType[];
  disposition?: CatchDisposition; 
  strata?: Stratum[];  

  observationTypes: ObservationType[];    // What
  biostructureTypes: BiostructureType[];  // What

  isSpecialProjectProtocol?: boolean;

  // Who, what, when, how

  // TODO - Next Meeting
  // 1. How do define strata?
  // 2. How do define comingled observations/structures?
  //      What am I doing on this age sample?
  //        maybe just need to define a given subsample
  // 3. How to capture a special project PI wanting standard data as well?
  //        Harvey wants a gill, but also FRAM sex, length

}
