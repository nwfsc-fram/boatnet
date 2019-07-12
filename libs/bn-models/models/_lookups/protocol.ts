import { Base } from '../_base/index';
import { Person } from './person';
import { TaxonomyAlias } from './taxonomy-alias';
import { BoatnetDate } from '../_common';

export const ProtocolTypeName = 'protocol';

declare type ObservationType = string; // TODO - Lookup
declare type BiostructureType = string; // TODO - Lookup
declare type SamplingStrategy = string; // TODO - Lookup - Simple Random, Stratified Random,
                                        // Opportunistic/Haphazard, Census
declare type CountType = string; // LOOKUP
declare type StratumType = string; // LOOKUP

export const ProgramYearProtocolTypeName = 'program-year-protocol';
export interface ProgramYearProtocol extends Base {
  protocolName: string; // A-SHOP 2018.1, A-SHOP 2018.2
  startDate: BoatnetDate;
  endDate: BoatnetDate;
  protocols: Protocol[];
}

export interface Protocol extends Base {

  taxonomy: TaxonomyAlias;
  principalInvestigator?: Person; // Who
  name: string; // let's review - SL100AW25 StTi+
  count: number;
  countType: CountType;
  strata: StratumType[];
  observations: ObservationType[];
  biostructures: BiostructureType[];

  samplingStrategy?: SamplingStrategy; // how data were collected:  random, stratified, strange sampling, etc.

  children?: Protocol[]; // There can be a total of 3 possible depths

  // isSpecialProjectProtocol?: boolean; // Do we want / need this?
  // Potentially a separate document type for special projects
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

What are strata? - Conditional / Context Constraints
================
-- Distributional Constraints
perCruise / perVessel
vesselColor (orange v. blue) (could translate into spatio-temporal constraint)
perPass
passNumber (35 in Pass 1, 33 in Pass 2)
perLeg (could translate into spatio-temporal constraint)
legNumber (e.g. 10 in leg 1, 5 in leg 2, etc.)
perHaul (could translate into spatio-temporal constraint)
perDay (could translate into spatio-temporal constraint)

biolistNumber / everyNHauls (equivalent to every nth haul (for WCGOP n = 3), random haul start)

-- Species Characteristics Constraints
observationRangePerBin (e.g. length (min, max, type), width (min, max, type), weight (min, max))
    [{min: 25, max 29}, {min 30, max 34}, ... ]

categoricalList (e.g. lifestage (eggs, juvenile, adult), sex, size grouping (e.g. small v. large hake)
  - could be multiple, simultaneous lists)


-- Spatio-Temporal Constraints
minDate, maxDate - (may be specified as season/pass)
minLatitude, maxLatitude (spatial, specified as which legs or which states (WA, OR, etc.))
  (GeoJSON, so probably include longitude)
minDepth, maxDepth (spatial)

-- Management Constraints
fisheries (WCGOP / A-SHOP)
fisheryGroup (WCGOP) - MAYBE, this turns into a depth under the hood (30 ftms splits it)
gearType (WCGOP / A-SHOP)
disposition (WCGOP)
vesselType (mothership v. catcher processor - A-SHOP)

-- No Constraints

PI/Organizations
For WCGOP (e.g.)

#1
ProgramYearVessel [{
  taxonomy: canary,
  protocols: [
    {
      name: SL75
      strata: {
        isPerHaul: yes
      }
      count: 75
      observations { sex, length }
    },
    {
      name: SL20AW20
      strata: {
        isPerHaul: yes
      }
      count: 20
      observations { sex, length, weight }
      biostructures { age }
    },
    {
      name: StTi
      strata: {
        cruise: {
          countType: all
          children: [
            childType: pass

          ]
          pass: all
            leg: [
              {count: 5, countType: max, leg: 1},
              {count: 5, countType: max, leg: 2},
            ]
              haul:
                observationRange
        }
      }

      name: StTi
      strata: {
        observationRangePerBin: {
          binType: leg,
          ranges: [
            { lengthMin: 0cm, lengthMax: 20cm, lengthType: fork, count: 4, countType: min },
            { lengthMin: 20cm, lengthMax: 29cm, lengthType: fork, count: 4, countType: min },
            { lengthMin: 30cm, lengthMax: 39cm, lengthType: fork, count: 4, countType: min },
            { lengthMin: 40cm, lengthMax: 49cm, lengthType: fork, count: 4, countType: min },
            { lengthMin: 50cm, lengthType: fork, count: 4, countType: min }
          ]
        },
        legNumber: [
          {count: 20, countType: max, leg: 1},
          {count: 20, countType: max, leg: 2},
        ],
        perObservationRangePerHaul: { count: 1, countType: max, rangeType: length },
        perHaul: { count: 2, countType: max },
      }

    },
    {
      name: SL2AW2Ov2
      strata: {
        isPerLeg: yes
        observationRange: { lengthMin: 26cm, lengthMax: 30cm, lengthType: fork }
      }
      count: 2
      observations { sex, length, weight }
      biostructures { age, ovary }
    },
    {
      name: SL5AW5FiOv5
      strata: {
        isPerLeg: yes
        observationRange: { lengthMin: 31cm, lengthMax: 35cm, lengthType: fork }
      }
      count: 5
      observations { sex, length, weight }
      biostructures { age, ovary }
    },
    {
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

#2 - Hierachy - Selected Approach
ProgramYearVessel {
  protocols: [
    {
      taxonomy: canary,
      name: SL100
      count: 100
      countType: target;  // minimum | maximum | target | as many as possible | all
      observations { sex, length }
      strata: { isPerHaul: true }
      children: [
        {
          taxonomy: canary,
          count: 25
          name: AW25
          observations { weight }
          biostructures { age }
          strata: { perHaul: true }
          children: [
            {
              taxonomy: canary,
              name: StTi5
              count: 5,
              biostructures { stomach, tissue },
              strata: {
                observationRangePerBin: {
                  binType: leg,
                  ranges: [
                    { lengthMin: 0cm, lengthMax: 20cm, lengthType: fork, count: 4, countType: min },
                    { lengthMin: 20cm, lengthMax: 29cm, lengthType: fork, count: 4, countType: min },
                    { lengthMin: 30cm, lengthMax: 39cm, lengthType: fork, count: 4, countType: min },
                    { lengthMin: 40cm, lengthMax: 49cm, lengthType: fork, count: 4, countType: min },
                    { lengthMin: 50cm, lengthType: fork, count: 4, countType: min }
                  ]
                },
                legNumber: [
                  {count: 20, countType: max, leg: 1},
                  {count: 20, countType: max, leg: 2},
                ],
                observationRangePerBin: {
                  binType: haul,
                  ranges: [
                    { lengthMin: 0cm, lengthMax: 20cm, lengthType: fork, count: 4, countType: min },
                    { lengthMin: 20cm, lengthMax: 29cm, lengthType: fork, count: 4, countType: min },
                    { lengthMin: 30cm, lengthMax: 39cm, lengthType: fork, count: 4, countType: min },
                    { lengthMin: 40cm, lengthMax: 49cm, lengthType: fork, count: 4, countType: min },
                    { lengthMin: 50cm, lengthType: fork, count: 4, countType: min }
                  ]
                },
                perHaul: { count: 2, countType: max },
              }
            },
            {
              taxonomy: canary,
              count: 5,
              biostructures { ovaries}
              strata: { isPerHaul: true, observationRange: { lengthMin: 25cm, lengthMax: 29cm, lengthType: fork }}
            },
          ]
        }
      ]
    },
}

#3 - WCGOP spreadsheet adaptation
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

  // Who, what, when, how

  // TODO - Next Meeting
  // 1. How do define strata?
  // 2. How do define comingled observations/structures?
  //      What am I doing on this age sample?
  //        maybe just need to define a given subsample
  // 3. How to capture a special project PI wanting standard data as well?
  //        Harvey wants a gill, but also FRAM sex, length
