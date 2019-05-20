import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import moment from 'moment';

import { alert } from '@/_store/alert.module';

import { Vessel } from '@boatnet/bn-models/models/_lookups/vessel';
import { OTSTrip, OTSMessage, OTSUser, OTSTarget, WcgopTrip, Permit, Person } from '@boatnet/bn-models';

import { RootState } from '@/_store/types/types';

Vue.use(Vuex);

// const activeVessel = 'Excalibur';
// const activeTrip = '';
// const activeUser = {
//   name: '', role: '', email: '', mobile: '', home: '', address: '', city: '', state: '',
//   zipcode: '', homeport: '', notification_prefs: []
// };
// const activePermit: string = '';
// const newTrip: boolean =  false;

// export const targetTypes: string[] = ['Fishery', 'Vessel', 'Port Group'];

// export const fisheries: string[] =  [
//   'EM EFP',
//   'Limited Entry - Catch Shares',
//   'Trawl Gear - MOD EFP',
//   'Catch Shares - Shore Side Hake'
// ];

export const notificationOptions: any[] = [
  {label: 'email', value: 'email', icon: 'mail'},
  {label: 'sms/text', value: 'sms/text', icon: 'sms'},
  {label: 'app', value: 'app', icon: 'smartphone'}
];

// export const vessels: Vessel[] = [
//   {vesselName: 'Excalibur'},
//   {vesselName: 'Raven'},
//   {vesselName: 'Last Straw'}
// ];

export const permits: Permit[] = [
  {
    permitNumber: 'GF0001',
    certificateStartDate: '2019-01-01T08:00:00Z',
    permitType: 'NOAA Fisheries',
    certificateEndDate: '2019-12-31T08:00:00Z',
    owner: {
      firstName: 'F/V VIGOROUS INC',
      addressLine1: '123 Fake St.',
      city: 'Anytown',
      state: 'OH',
      zipCode: '12345'
    },
    vessel: {
      vesselName: 'VIGOROUS',
      registeredLength: {value: 99.00001, units: 'cm'},
      coastGuardNumber: '47',
    },
    isTrawlGear: true,
    isLonglineGear: true,
    isTrapPotGear: true,
    isSmallFleet: true,
    endorsedLength: 88.88,
    isSableFishEndorsed: true,
    sableFishTier: '1',
    isCpEndorsed: true,
    isMsEndorsed: true,
    isMothershipCatcherVessel: true,
    status: 'Active',
    goid: '2001',
    ghid: '1002',
    isOwnerOnBoardExempt: true
  },
];

// export const otsTargets: OTSTarget[] = [
//   {
//     _id: 'vfger34tgf', fishery: 'EM EFP', targetType: 'Fishery', target: 'Fishery Wide', rate: 40,
//     startDate: '2019-03-26T08:20:33-07:00', endDate: null
//   },
//   {
//     _id: 'dfd34rfre234', fishery: 'EM EFP', targetType: 'Vessel', target: 'Excalibur', rate: 37,
//     startDate: '2019-03-26T08:20:33-07:00', endDate: null
//   },
//   {
//     _id: 'f3ffferf42', fishery: 'EM EFP', targetType: 'Port Group', target: 'AT', rate: 25,
//     startDate: '2019-03-26T08:20:33-07:00', endDate: null
//   },
//   {
//     _id: 'wg32efrfsg', fishery: 'EM EFP', targetType: 'Port Group', target: 'AT', rate: 25,
//     startDate: '2019-03-26T08:20:33-07:00', endDate: '2019-03-29T08:20:33-07:00'
//   }
// ];

// export const trips: WcgopTrip[] = [
//   { _id: '123456', type: 'trip', tripNum: 3, isSelected: false,
//     vessel: {vesselName: 'Excalibur', coastGuardNumber: 'fgr243rt'},
//     departureDate: '2018/08/03 10:01 AM', returnDate: '2019/05/16',
//     departurePort: {name: 'Newport'} , returnPort: {name: 'same as start'},
//     fishery: {name: 'Limited Entry - Catch Shares'},
//     tripStatus: {description: 'Open'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 2, isSelected: true,
//     vessel: {vesselName: 'Excalibur', coastGuardNumber: 'fgr243rt'},
//     departureDate: '9/9/2018 10:01 AM', returnDate: '9/17/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Limited Entry - Catch Shares'},
//     tripStatus: {description: 'Closed'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 1, isSelected: false,
//     vessel: {vesselName: 'Excalibur', coastGuardNumber: 'fgr243rt'},
//     departureDate: '10/23/2018 10:01 AM', returnDate: '10/31/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Limited Entry - Catch Shares'},
//     tripStatus: {description: 'Open'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 5, isSelected: true,
//     vessel: {vesselName: 'Excalibur', coastGuardNumber: 'fgr243rt'},
//     departureDate: '11/7/2018 10:01 AM', returnDate: '11/23/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Catch Shares - Shore Side Hake'},
//     tripStatus: {description: 'Open'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 4, isSelected: false,
//     vessel: {vesselName: 'Excalibur', coastGuardNumber: 'fgr243rt'},
//     departureDate: '12/1/2018 10:01 AM', returnDate: '12/15/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Trawl Gear - MOD EFP'},
//     tripStatus: {description: 'Closed'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 2, isSelected: true,
//     vessel: {vesselName: 'Ms Julie', coastGuardNumber: 'fgr243rt'},
//     departureDate: '9/9/2018 10:01 AM', returnDate: '9/17/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Catch Shares - Shore Side Hake'},
//     tripStatus: {description: 'Closed'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 1, isSelected: false,
//     vessel: {vesselName: 'Ms Julie', coastGuardNumber: 'fgr243rt'},
//     departureDate: '10/23/2018 10:01 AM', returnDate: '10/31/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Trawl Gear - MOD EFP'},
//     tripStatus: {description: 'Closed'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 3, isSelected: true,
//     vessel: {vesselName: 'Ms Julie', coastGuardNumber: 'fgr243rt'},
//     departureDate: '11/7/2018 10:01 AM', returnDate: '11/23/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Limited Entry - Catch Shares'},
//     tripStatus: {description: 'Closed'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 4, isSelected: true,
//     vessel: {vesselName: 'Last Straw', coastGuardNumber: 'fgr243rt'},
//     departureDate: '11/7/2018 10:01 AM', returnDate: '11/23/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Catch Shares - Shore Side Hake'},
//     tripStatus: {description: 'Closed'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 3, isSelected: false,
//     vessel: {vesselName: 'Last Straw', coastGuardNumber: 'fgr243rt'},
//     departureDate: '12/1/2018 10:01 AM', returnDate: '12/15/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Catch Shares - Shore Side Hake'},
//     tripStatus: {description: 'Closed'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 2, isSelected: false,
//     vessel: {vesselName: 'Last Straw', coastGuardNumber: 'fgr243rt'},
//     departureDate: '12/1/2018 10:01 AM', returnDate: '12/15/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Catch Shares - Shore Side Hake'},
//     tripStatus: {description: 'Closed'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 1, isSelected: true,
//     vessel: {vesselName: 'Last Straw', coastGuardNumber: 'fgr243rt'},
//     departureDate: '9/9/2018 10:01 AM', returnDate: '9/17/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Trawl Gear - MOD EFP'},
//     tripStatus: {description: 'Closed'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 4, isSelected: false,
//     vessel: {vesselName: 'Raven', coastGuardNumber: 'fgr243rt'},
//     departureDate: '10/23/2018 10:01 AM', returnDate: '10/31/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Limited Entry - Catch Shares'},
//     tripStatus: {description: 'Closed'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 5, isSelected: true,
//     vessel: {vesselName: 'Raven', coastGuardNumber: 'fgr243rt'},
//     departureDate: '11/7/2018 10:01 AM', returnDate: '11/23/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Catch Shares - Shore Side Hake'},
//     tripStatus: {description: 'Closed'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 3, isSelected: false,
//     vessel: {vesselName: 'Raven', coastGuardNumber: 'fgr243rt'},
//     departureDate: '8/03/2018 10:01 AM', returnDate: '8/20/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Trawl Gear - MOD EFP'},
//     tripStatus: {description: 'Closed'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 2, isSelected: true,
//     vessel: {vesselName: 'Raven', coastGuardNumber: 'fgr243rt'},
//     departureDate: '9/9/2018 10:01 AM', returnDate: '9/17/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Limited Entry - Catch Shares'},
//     tripStatus: {description: 'Closed'}
//   },
//   { _id: '123456', type: 'trip', tripNum: 1, isSelected: false,
//     vessel: {vesselName: 'Raven', coastGuardNumber: 'fgr243rt'},
//     departureDate: '10/23/2018 10:01 AM', returnDate: '10/31/2018 3:33 PM',
//     departurePort: {name: 'Newport'}, returnPort: {name: 'same as start'},
//     fishery: {name: 'Limited Entry - Catch Shares'},
//     tripStatus: {description: 'Closed'}
//   },
// ];

export const users: Person[] = [
  {
    firstName: 'Seth', lastName: "Gerou", userName: 'seth-test', applicationRoles: ['Captain'], workEmail: 'user@noaa.gov',
    cellPhone: '2065551212', homePhone: '4322221232', port: {name: 'Seattle'}
  },
  // {
  //   name: 'Melina Shak', roles: ['Captain'], email: 'user@noaa.gov',
  //   mobile: 2065551212, home: 4322221232, homeport: {name: 'Seattle'}
  // },
  // {
  //   name: 'Nick Schaffer', roles: ['Observer'], email: 'user@noaa.gov',
  //   mobile: 2065551212, home: 4322221232, homeport: {name: 'Seattle'}
  // },
  // {
  //   name: 'Neil Riley', roles: ['Staff'], email: 'user@noaa.gov',
  //   mobile: 2065551212, home: 4322221232, homeport: {name: 'Seattle'}
  // },
  // {
  //   name: 'Will Smith', roles: ['Provider'], email: 'user@noaa.gov',
  //   mobile: 2065551212, home: 4322221232, homeport: {name: 'Seattle'}
  // }
];

export const roles = ['Captain', 'Observer', 'Staff', 'Provider', 'Permit Owner'];

export const usStates = [
  'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA',
  'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA',
  'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
  'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
  'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export const portGroups = [
  'AT',
  'BB',
  'CB',
  'CC',
  'EA',
  'FB',
  'LA',
  'MB',
  'MT',
  'NB',
  'NP',
  'SB',
  'SF',
  'ZZ'
];

export const ports = [
  'COLUMBIA RIVER PORTS (OREGON)',
  'WESTPORT',
  'ASTORIA',
  'COLUMBIA RIVER ABOVE BONNEVILLE DAM',
  'COLUMBIA RIVER BELOW BONNEVILLE DAM',
  'CANNON BEACH',
  'PSUEDO PORT CODE FOR COLUMBIA RIVER',
  'YOUNGS BAY ON COLUMBIA RIVER',
  'GEARHART - SEASIDE',
  'NEHALEM BAY',
  'NETARTS BAY',
  'PACIFIC CITY',
  'SAND LAKE',
  'SALMON RIVER',
  'TILLAMOOK/GARIBALDI',
  'ILWACO/CHINOOK',
  'OTHER COLUMBIA RIVER PORTS',
  'COPALIS BEACH',
  'GRAYS HARBOR',
  'OTHER WASHINGTION COASTAL PORTS',
  'WILLAPA BAY',
  'TILLAMOOK AREA PORTS',
  'ANACORTES',
  'BELLINGHAM BAY',
  'BLAINE',
  'FRIDAY HARBOR',
  'LA CONNER',
  'TACOMA',
  'OLYMPIA',
  'OTHER SOUTH PUGET SOUND PORTS',
  'SEATTLE',
  'SHELTON',
  'EVERETT',
  'FLORENCE',
  'COOS BAY',
  'BANDON',
  'WINCHESTER BAY',
  'COOS BAY AREA PORTS',
  'PORT ORFORD',
  'GOLD BEACH',
  'BROOKINGS AREA PORTS',
  'OTHER DEL NORTE COUNTY PORTS',
  'CRESCENT CITY',
  'CRESCENT CITY AREA PORTS',
  'BROOKINGS',
  'EUREKA AREA PORTS',
  'EUREKA',
  'TRINIDAD',
  'OTHER HUMBOLDT COUNTY PORTS',
  'FIELDS LANDING',
  'BODEGA BAY AREA PORTS',
  'FORT BRAGG AREA PORTS',
  'BODEGA BAY',
  'OTHER SONOMA AND MARIN COUNTY OUTER COAST PORTS',
  'OTHER MENDOCINO COUNTY PORTS',
  'TOMALES BAY',
  'ALBION',
  'POINT ARENA',
  'FORT BRAGG',
  'POINT REYES',
  'LOS ANGELES AREA PORTS',
  'SAN DIEGO AREA PORTS',
  'DANA POINT',
  'LONG BEACH',
  'NEWPORT BEACH',
  'SAN DIEGO',
  'SAN PEDRO',
  'TERMINAL ISLAND',
  'WILLMINGTON',
  'OCEANSIDE',
  'OTHER SAN DIEGO COUNTY PORTS',
  'Other LA and Orange Cnty Ports',
  'OTHER SAN LUIS OBISPO COUNTY PORTS',
  'MORRO BAY',
  'AVILA',
  'SAN SIMEON',
  'MORRO BAY AREA PORTS',
  'OTHER SANTA CRUZ AND MONTEREY COUNTY PORTS',
  'MOSS LANDING',
  'MILL CREEK',
  'SANTA CRUZ',
  'BIG CREEK',
  'MONTEREY AREA PORTS',
  'MONTEREY',
  'SEQUIM',
  'PORT ANGELES',
  'OTHER NORTH PUGET SOUND PORTS',
  'NEAH BAY',
  'LA PUSH',
  'PORT TOWNSEND',
  'WALDPORT',
  'SILETZ BAY',
  'NEWPORT',
  'DEPOE BAY',
  'NEWPORT AREA PORTS',
  'YACHATS',
  'SANTA BARBARA AREA PORTS',
  'VENTURA',
  'SANTA BARBARA',
  'OXNARD',
  'OTHER SANTA BARBARA AND VENTURA COUNTY PORTS',
  'PORT HUENEME',
  'RICHMOND',
  'SAN FRANCISCO',
  'PRINCETON / HALF MOON BAY',
  'OTHER S. F. BAY AND SAN MATEO COUNTY PORTS',
  'OAKLAND',
  'BERKELEY',
  'ALAMEDA',
  'SAUSALITO',
  'SAN FRANCISCO AREA PORTS',
  'FISH AT SEA, CALIFORNIA',
  'OTHER OR UNKNOWN CALIFORNIA PORTS',
  'ALL CALIFORNIA PORTS',
  'FISH AT SEA, CALIFORNIA',
  'OTHER OR UNKNOWN CALIFORNIA PORTS',
  'ALL OREGON PORTS',
  'FISH AT SEA, OREGON',
  'OTHER OR UNKNOWN OREGON PORTS',
  'LANDED IN WASHINGTON; TRANSPORTED TO OREGON',
  'FISH AT SEA, OREGON',
  'OTHER OR UNKNOWN OREGON PORTS',
  'ALL WASHINGTON PORTS',
  'FISH AT SEA, WASHINGTON',
  'FISH AT SEA, WASHINGTON',
  'COLUMBIA RIVER PORTS (WASHINGTON)',
  'CATCHER-PROCESSOR LANDINGS IN WASHINGTON STATE',
  'WASHINGTON COASTAL PORTS',
  'NORTH PUGET SOUND PORTS',
  'SOUTH PUGET SOUND PORTS',
  'OTHER OR UNKNOWN WASHINGTON PORTS',
  'CATCHER-PROCESSOR LANDINGS IN WASHINGTON STATE',
  'OTHER OR UNKNOWN WASHINGTON PORTS',
];

export const portDecoder = [
  {
    AGID: 'O',
    PCGROUP: 'AOR',
    PCID: 'CLO',
    NAME: 'COLUMBIA RIVER PORTS (OREGON)',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'W',
    PCGROUP: 'CWA',
    PCID: 'WPT',
    NAME: 'WESTPORT',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'O',
    PCGROUP: 'CLO',
    PCID: 'AST',
    NAME: 'ASTORIA',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'O',
    PCGROUP: 'CLO',
    PCID: 'CAB',
    NAME: 'COLUMBIA RIVER ABOVE BONNEVILLE DAM',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'O',
    PCGROUP: 'CLO',
    PCID: 'CBB',
    NAME: 'COLUMBIA RIVER BELOW BONNEVILLE DAM',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'O',
    PCGROUP: 'CLO',
    PCID: 'CNB',
    NAME: 'CANNON BEACH',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'O',
    PCGROUP: 'CLO',
    PCID: 'CRV',
    NAME: 'PSUEDO PORT CODE FOR COLUMBIA RIVER',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'O',
    PCGROUP: 'CLO',
    PCID: 'CYB',
    NAME: 'YOUNGS BAY ON COLUMBIA RIVER',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'O',
    PCGROUP: 'CLO',
    PCID: 'GSS',
    NAME: 'GEARHART - SEASIDE',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'O',
    PCGROUP: 'TLA',
    PCID: 'NHL',
    NAME: 'NEHALEM BAY',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'O',
    PCGROUP: 'TLA',
    PCID: 'NTR',
    NAME: 'NETARTS BAY',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'O',
    PCGROUP: 'TLA',
    PCID: 'PCC',
    NAME: 'PACIFIC CITY',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'O',
    PCGROUP: 'TLA',
    PCID: 'SLK',
    NAME: 'SAND LAKE',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'O',
    PCGROUP: 'TLA',
    PCID: 'SRV',
    NAME: 'SALMON RIVER',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'O',
    PCGROUP: 'TLA',
    PCID: 'TLL',
    NAME: 'TILLAMOOK/GARIBALDI',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'W',
    PCGROUP: 'CLW',
    PCID: 'LWC',
    NAME: 'ILWACO/CHINOOK',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'W',
    PCGROUP: 'CLW',
    PCID: 'OCR',
    NAME: 'OTHER COLUMBIA RIVER PORTS',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'W',
    PCGROUP: 'CWA',
    PCID: 'CPL',
    NAME: 'COPALIS BEACH',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'W',
    PCGROUP: 'CWA',
    PCID: 'GRH',
    NAME: 'GRAYS HARBOR',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'W',
    PCGROUP: 'CWA',
    PCID: 'OWC',
    NAME: 'OTHER WASHINGTION COASTAL PORTS',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'W',
    PCGROUP: 'CWA',
    PCID: 'WLB',
    NAME: 'WILLAPA BAY',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'O',
    PCGROUP: 'AOR',
    PCID: 'TLA',
    NAME: 'TILLAMOOK AREA PORTS',
    WCGOP_GROUP: 'AT'
  },
  {
    AGID: 'W',
    PCGROUP: 'NPS',
    PCID: 'ANA',
    NAME: 'ANACORTES',
    WCGOP_GROUP: 'BB'
  },
  {
    AGID: 'W',
    PCGROUP: 'NPS',
    PCID: 'BLL',
    NAME: 'BELLINGHAM BAY',
    WCGOP_GROUP: 'BB'
  },
  {
    AGID: 'W',
    PCGROUP: 'NPS',
    PCID: 'BLN',
    NAME: 'BLAINE',
    WCGOP_GROUP: 'BB'
  },
  {
    AGID: 'W',
    PCGROUP: 'NPS',
    PCID: 'FRI',
    NAME: 'FRIDAY HARBOR',
    WCGOP_GROUP: 'BB'
  },
  {
    AGID: 'W',
    PCGROUP: 'NPS',
    PCID: 'LAC',
    NAME: 'LA CONNER',
    WCGOP_GROUP: 'BB'
  },
  {
    AGID: 'W',
    PCGROUP: 'SPS',
    PCID: 'TAC',
    NAME: 'TACOMA',
    WCGOP_GROUP: 'BB'
  },
  {
    AGID: 'W',
    PCGROUP: 'SPS',
    PCID: 'OLY',
    NAME: 'OLYMPIA',
    WCGOP_GROUP: 'BB'
  },
  {
    AGID: 'W',
    PCGROUP: 'SPS',
    PCID: 'OSP',
    NAME: 'OTHER SOUTH PUGET SOUND PORTS',
    WCGOP_GROUP: 'BB'
  },
  {
    AGID: 'W',
    PCGROUP: 'SPS',
    PCID: 'SEA',
    NAME: 'SEATTLE',
    WCGOP_GROUP: 'BB'
  },
  {
    AGID: 'W',
    PCGROUP: 'SPS',
    PCID: 'SHL',
    NAME: 'SHELTON',
    WCGOP_GROUP: 'BB'
  },
  {
    AGID: 'W',
    PCGROUP: 'SPS',
    PCID: 'EVR',
    NAME: 'EVERETT',
    WCGOP_GROUP: 'BB'
  },
  {
    AGID: 'O',
    PCGROUP: 'CBA',
    PCID: 'FLR',
    NAME: 'FLORENCE',
    WCGOP_GROUP: 'CB'
  },
  {
    AGID: 'O',
    PCGROUP: 'CBA',
    PCID: 'COS',
    NAME: 'COOS BAY',
    WCGOP_GROUP: 'CB'
  },
  {
    AGID: 'O',
    PCGROUP: 'CBA',
    PCID: 'BDN',
    NAME: 'BANDON',
    WCGOP_GROUP: 'CB'
  },
  {
    AGID: 'O',
    PCGROUP: 'CBA',
    PCID: 'WIN',
    NAME: 'WINCHESTER BAY',
    WCGOP_GROUP: 'CB'
  },
  {
    AGID: 'O',
    PCGROUP: 'AOR',
    PCID: 'CBA',
    NAME: 'COOS BAY AREA PORTS',
    WCGOP_GROUP: 'CB'
  },
  {
    AGID: 'O',
    PCGROUP: 'BRA',
    PCID: 'ORF',
    NAME: 'PORT ORFORD',
    WCGOP_GROUP: 'CC'
  },
  {
    AGID: 'O',
    PCGROUP: 'BRA',
    PCID: 'GLD',
    NAME: 'GOLD BEACH',
    WCGOP_GROUP: 'CC'
  },
  {
    AGID: 'O',
    PCGROUP: 'AOR',
    PCID: 'BRA',
    NAME: 'BROOKINGS AREA PORTS',
    WCGOP_GROUP: 'CC'
  },
  {
    AGID: 'C',
    PCGROUP: 'CCA',
    PCID: 'ODN',
    NAME: 'OTHER DEL NORTE COUNTY PORTS',
    WCGOP_GROUP: 'CC'
  },
  {
    AGID: 'C',
    PCGROUP: 'CCA',
    PCID: 'CRS',
    NAME: 'CRESCENT CITY',
    WCGOP_GROUP: 'CC'
  },
  {
    AGID: 'C',
    PCGROUP: 'ACA',
    PCID: 'CCA',
    NAME: 'CRESCENT CITY AREA PORTS',
    WCGOP_GROUP: 'CC'
  },
  {
    AGID: 'O',
    PCGROUP: 'BRA',
    PCID: 'BRK',
    NAME: 'BROOKINGS',
    WCGOP_GROUP: 'CC'
  },
  {
    AGID: 'C',
    PCGROUP: 'ACA',
    PCID: 'ERA',
    NAME: 'EUREKA AREA PORTS',
    WCGOP_GROUP: 'EA'
  },
  {
    AGID: 'C',
    PCGROUP: 'ERA',
    PCID: 'ERK',
    NAME: 'EUREKA',
    WCGOP_GROUP: 'EA'
  },
  {
    AGID: 'C',
    PCGROUP: 'ERA',
    PCID: 'TRN',
    NAME: 'TRINIDAD',
    WCGOP_GROUP: 'EA'
  },
  {
    AGID: 'C',
    PCGROUP: 'ERA',
    PCID: 'OHB',
    NAME: 'OTHER HUMBOLDT COUNTY PORTS',
    WCGOP_GROUP: 'EA'
  },
  {
    AGID: 'C',
    PCGROUP: 'ERA',
    PCID: 'FLN',
    NAME: 'FIELDS LANDING',
    WCGOP_GROUP: 'EA'
  },
  {
    AGID: 'C',
    PCGROUP: 'ACA',
    PCID: 'BDA',
    NAME: 'BODEGA BAY AREA PORTS',
    WCGOP_GROUP: 'FB'
  },
  {
    AGID: 'C',
    PCGROUP: 'ACA',
    PCID: 'BGA',
    NAME: 'FORT BRAGG AREA PORTS',
    WCGOP_GROUP: 'FB'
  },
  {
    AGID: 'C',
    PCGROUP: 'BDA',
    PCID: 'BDG',
    NAME: 'BODEGA BAY',
    WCGOP_GROUP: 'FB'
  },
  {
    AGID: 'C',
    PCGROUP: 'BDA',
    PCID: 'OSM',
    NAME: 'OTHER SONOMA AND MARIN COUNTY OUTER COAST PORTS',
    WCGOP_GROUP: 'FB'
  },
  {
    AGID: 'C',
    PCGROUP: 'BGA',
    PCID: 'OMD',
    NAME: 'OTHER MENDOCINO COUNTY PORTS',
    WCGOP_GROUP: 'FB'
  },
  {
    AGID: 'C',
    PCGROUP: 'BDA',
    PCID: 'TML',
    NAME: 'TOMALES BAY',
    WCGOP_GROUP: 'FB'
  },
  {
    AGID: 'C',
    PCGROUP: 'BGA',
    PCID: 'ALB',
    NAME: 'ALBION',
    WCGOP_GROUP: 'FB'
  },
  {
    AGID: 'C',
    PCGROUP: 'BGA',
    PCID: 'ARE',
    NAME: 'POINT ARENA',
    WCGOP_GROUP: 'FB'
  },
  {
    AGID: 'C',
    PCGROUP: 'BGA',
    PCID: 'BRG',
    NAME: 'FORT BRAGG',
    WCGOP_GROUP: 'FB'
  },
  {
    AGID: 'C',
    PCGROUP: 'BDA',
    PCID: 'RYS',
    NAME: 'POINT REYES',
    WCGOP_GROUP: 'FB'
  },
  {
    AGID: 'C',
    PCGROUP: 'ACA',
    PCID: 'LAA',
    NAME: 'LOS ANGELES AREA PORTS',
    WCGOP_GROUP: 'LA'
  },
  {
    AGID: 'C',
    PCGROUP: 'ACA',
    PCID: 'SDA',
    NAME: 'SAN DIEGO AREA PORTS',
    WCGOP_GROUP: 'LA'
  },
  {
    AGID: 'C',
    PCGROUP: 'LAA',
    PCID: 'DNA',
    NAME: 'DANA POINT',
    WCGOP_GROUP: 'LA'
  },
  {
    AGID: 'C',
    PCGROUP: 'LAA',
    PCID: 'LGB',
    NAME: 'LONG BEACH',
    WCGOP_GROUP: 'LA'
  },
  {
    AGID: 'C',
    PCGROUP: 'LAA',
    PCID: 'NWB',
    NAME: 'NEWPORT BEACH',
    WCGOP_GROUP: 'LA'
  },
  {
    AGID: 'C',
    PCGROUP: 'SDA',
    PCID: 'SD',
    NAME: 'SAN DIEGO',
    WCGOP_GROUP: 'LA'
  },
  {
    AGID: 'C',
    PCGROUP: 'LAA',
    PCID: 'SP',
    NAME: 'SAN PEDRO',
    WCGOP_GROUP: 'LA'
  },
  {
    AGID: 'C',
    PCGROUP: 'LAA',
    PCID: 'TRM',
    NAME: 'TERMINAL ISLAND',
    WCGOP_GROUP: 'LA'
  },
  {
    AGID: 'C',
    PCGROUP: 'LAA',
    PCID: 'WLM',
    NAME: 'WILLMINGTON',
    WCGOP_GROUP: 'LA'
  },
  {
    AGID: 'C',
    PCGROUP: 'SDA',
    PCID: 'OCN',
    NAME: 'OCEANSIDE',
    WCGOP_GROUP: 'LA'
  },
  {
    AGID: 'C',
    PCGROUP: 'SDA',
    PCID: 'OSD',
    NAME: 'OTHER SAN DIEGO COUNTY PORTS',
    WCGOP_GROUP: 'LA'
  },
  {
    AGID: 'C',
    PCGROUP: 'LAA',
    PCID: 'OLA',
    NAME: 'Other LA and Orange Cnty Ports',
    WCGOP_GROUP: 'LA'
  },
  {
    AGID: 'C',
    PCGROUP: 'MRA',
    PCID: 'OSL',
    NAME: 'OTHER SAN LUIS OBISPO COUNTY PORTS',
    WCGOP_GROUP: 'MB'
  },
  {
    AGID: 'C',
    PCGROUP: 'MRA',
    PCID: 'MRO',
    NAME: 'MORRO BAY',
    WCGOP_GROUP: 'MB'
  },
  {
    AGID: 'C',
    PCGROUP: 'MRA',
    PCID: 'AVL',
    NAME: 'AVILA',
    WCGOP_GROUP: 'MB'
  },
  {
    AGID: 'C',
    PCGROUP: 'MRA',
    PCID: 'SIM',
    NAME: 'SAN SIMEON',
    WCGOP_GROUP: 'MB'
  },
  {
    AGID: 'C',
    PCGROUP: 'ACA',
    PCID: 'MRA',
    NAME: 'MORRO BAY AREA PORTS',
    WCGOP_GROUP: 'MB'
  },
  {
    AGID: 'C',
    PCGROUP: 'MNA',
    PCID: 'OCM',
    NAME: 'OTHER SANTA CRUZ AND MONTEREY COUNTY PORTS',
    WCGOP_GROUP: 'MT'
  },
  {
    AGID: 'C',
    PCGROUP: 'MNA',
    PCID: 'MOS',
    NAME: 'MOSS LANDING',
    WCGOP_GROUP: 'MT'
  },
  {
    AGID: 'C',
    PCGROUP: 'MNA',
    PCID: 'MCR',
    NAME: 'MILL CREEK',
    WCGOP_GROUP: 'MT'
  },
  {
    AGID: 'C',
    PCGROUP: 'MNA',
    PCID: 'CRZ',
    NAME: 'SANTA CRUZ',
    WCGOP_GROUP: 'MT'
  },
  {
    AGID: 'C',
    PCGROUP: 'MNA',
    PCID: 'BCR',
    NAME: 'BIG CREEK',
    WCGOP_GROUP: 'MT'
  },
  {
    AGID: 'C',
    PCGROUP: 'ACA',
    PCID: 'MNA',
    NAME: 'MONTEREY AREA PORTS',
    WCGOP_GROUP: 'MT'
  },
  {
    AGID: 'C',
    PCGROUP: 'MNA',
    PCID: 'MNT',
    NAME: 'MONTEREY',
    WCGOP_GROUP: 'MT'
  },
  {
    AGID: 'W',
    PCGROUP: 'NPS',
    PCID: 'SEQ',
    NAME: 'SEQUIM',
    WCGOP_GROUP: 'NB'
  },
  {
    AGID: 'W',
    PCGROUP: 'NPS',
    PCID: 'PAG',
    NAME: 'PORT ANGELES',
    WCGOP_GROUP: 'NB'
  },
  {
    AGID: 'W',
    PCGROUP: 'NPS',
    PCID: 'ONP',
    NAME: 'OTHER NORTH PUGET SOUND PORTS',
    WCGOP_GROUP: 'NB'
  },
  {
    AGID: 'W',
    PCGROUP: 'NPS',
    PCID: 'NEA',
    NAME: 'NEAH BAY',
    WCGOP_GROUP: 'NB'
  },
  {
    AGID: 'W',
    PCGROUP: 'CWA',
    PCID: 'LAP',
    NAME: 'LA PUSH',
    WCGOP_GROUP: 'NB'
  },
  {
    AGID: 'W',
    PCGROUP: 'NPS',
    PCID: 'TNS',
    NAME: 'PORT TOWNSEND',
    WCGOP_GROUP: 'NB'
  },
  {
    AGID: 'O',
    PCGROUP: 'NPA',
    PCID: 'WLD',
    NAME: 'WALDPORT',
    WCGOP_GROUP: 'NP'
  },
  {
    AGID: 'O',
    PCGROUP: 'NPA',
    PCID: 'SLZ',
    NAME: 'SILETZ BAY',
    WCGOP_GROUP: 'NP'
  },
  {
    AGID: 'O',
    PCGROUP: 'NPA',
    PCID: 'NEW',
    NAME: 'NEWPORT',
    WCGOP_GROUP: 'NP'
  },
  {
    AGID: 'O',
    PCGROUP: 'NPA',
    PCID: 'DPO',
    NAME: 'DEPOE BAY',
    WCGOP_GROUP: 'NP'
  },
  {
    AGID: 'O',
    PCGROUP: 'AOR',
    PCID: 'NPA',
    NAME: 'NEWPORT AREA PORTS',
    WCGOP_GROUP: 'NP'
  },
  {
    AGID: 'O',
    PCGROUP: 'NPA',
    PCID: 'YAC',
    NAME: 'YACHATS',
    WCGOP_GROUP: 'NP'
  },
  {
    AGID: 'C',
    PCGROUP: 'ACA',
    PCID: 'SBA',
    NAME: 'SANTA BARBARA AREA PORTS',
    WCGOP_GROUP: 'SB'
  },
  {
    AGID: 'C',
    PCGROUP: 'SBA',
    PCID: 'VEN',
    NAME: 'VENTURA',
    WCGOP_GROUP: 'SB'
  },
  { AGID: 'C', PCGROUP: 'SBA', PCID: 'SB', NAME: 'SANTA BARBARA' },
  {
    AGID: 'C',
    PCGROUP: 'SBA',
    PCID: 'OXN',
    NAME: 'OXNARD',
    WCGOP_GROUP: 'SB'
  },
  {
    AGID: 'C',
    PCGROUP: 'SBA',
    PCID: 'OBV',
    NAME: 'OTHER SANTA BARBARA AND VENTURA COUNTY PORTS',
    WCGOP_GROUP: 'SB'
  },
  {
    AGID: 'C',
    PCGROUP: 'SBA',
    PCID: 'HNM',
    NAME: 'PORT HUENEME',
    WCGOP_GROUP: 'SB'
  },
  {
    AGID: 'C',
    PCGROUP: 'SFA',
    PCID: 'RCH',
    NAME: 'RICHMOND',
    WCGOP_GROUP: 'SF'
  },
  { AGID: 'C', PCGROUP: 'SFA', PCID: 'SF', NAME: 'SAN FRANCISCO' },
  {
    AGID: 'C',
    PCGROUP: 'SFA',
    PCID: 'PRN',
    NAME: 'PRINCETON / HALF MOON BAY',
    WCGOP_GROUP: 'SF'
  },
  {
    AGID: 'C',
    PCGROUP: 'SFA',
    PCID: 'OSF',
    NAME: 'OTHER S. F. BAY AND SAN MATEO COUNTY PORTS',
    WCGOP_GROUP: 'SF'
  },
  {
    AGID: 'C',
    PCGROUP: 'SFA',
    PCID: 'OAK',
    NAME: 'OAKLAND',
    WCGOP_GROUP: 'SF'
  },
  {
    AGID: 'C',
    PCGROUP: 'SFA',
    PCID: 'BKL',
    NAME: 'BERKELEY',
    WCGOP_GROUP: 'SF'
  },
  {
    AGID: 'C',
    PCGROUP: 'SFA',
    PCID: 'ALM',
    NAME: 'ALAMEDA',
    WCGOP_GROUP: 'SF'
  },
  {
    AGID: 'C',
    PCGROUP: 'SFA',
    PCID: 'SLT',
    NAME: 'SAUSALITO',
    WCGOP_GROUP: 'SF'
  },
  {
    AGID: 'C',
    PCGROUP: 'ACA',
    PCID: 'SFA',
    NAME: 'SAN FRANCISCO AREA PORTS',
    WCGOP_GROUP: 'SF'
  },
  {
    AGID: 'C',
    PCGROUP: 'ACA',
    PCID: 'AS2',
    NAME: 'FISH AT SEA, CALIFORNIA',
    WCGOP_GROUP: 'ZZ',
  },
  {
    AGID: 'C',
    PCGROUP: 'ACA',
    PCID: 'CA2',
    NAME: 'OTHER OR UNKNOWN CALIFORNIA PORTS',
    WCGOP_GROUP: 'ZZ'
  },
  {
    AGID: 'C',
    PCGROUP: 'ALP',
    PCID: 'ACA',
    NAME: 'ALL CALIFORNIA PORTS',
    WCGOP_GROUP: 'ZZ'
  },
  {
    AGID: 'C',
    PCGROUP: 'AS2',
    PCID: 'ASC',
    NAME: 'FISH AT SEA, CALIFORNIA',
    WCGOP_GROUP: 'ZZ',
  },
  {
    AGID: 'C',
    PCGROUP: 'CA2',
    PCID: 'OCA',
    NAME: 'OTHER OR UNKNOWN CALIFORNIA PORTS',
    WCGOP_GROUP: 'ZZ'
  },
  {
    AGID: 'O',
    PCGROUP: 'ALP',
    PCID: 'AOR',
    NAME: 'ALL OREGON PORTS',
    WCGOP_GROUP: 'ZZ'
  },
  {
    AGID: 'O',
    PCGROUP: 'AOR',
    PCID: 'AS4',
    NAME: 'FISH AT SEA, OREGON',
    WCGOP_GROUP: 'ZZ',
  },
  {
    AGID: 'O',
    PCGROUP: 'AOR',
    PCID: 'OR4',
    NAME: 'OTHER OR UNKNOWN OREGON PORTS',
    WCGOP_GROUP: 'ZZ'
  },
  {
    AGID: 'O',
    PCGROUP: 'AOR',
    PCID: 'WAL',
    NAME: 'LANDED IN WASHINGTON; TRANSPORTED TO OREGON',
    WCGOP_GROUP: 'ZZ'
  },
  {
    AGID: 'O',
    PCGROUP: 'AS4',
    PCID: 'ASO',
    NAME: 'FISH AT SEA, OREGON',
    WCGOP_GROUP: 'ZZ',
  },
  {
    AGID: 'O',
    PCGROUP: 'OR4',
    PCID: 'OOR',
    NAME: 'OTHER OR UNKNOWN OREGON PORTS',
    WCGOP_GROUP: 'ZZ'
  },
  {
    AGID: 'W',
    PCGROUP: 'ALP',
    PCID: 'AWA',
    NAME: 'ALL WASHINGTON PORTS',
    WCGOP_GROUP: 'ZZ'
  },
  {
    AGID: 'W',
    PCGROUP: 'AS5',
    PCID: 'ASW',
    NAME: 'FISH AT SEA, WASHINGTON',
    WCGOP_GROUP: 'ZZ',
    undefined: ''
  },
  {
    AGID: 'W',
    PCGROUP: 'AWA',
    PCID: 'AS5',
    NAME: 'FISH AT SEA, WASHINGTON',
    WCGOP_GROUP: 'ZZ',
  },
  {
    AGID: 'W',
    PCGROUP: 'AWA',
    PCID: 'CLW',
    NAME: 'COLUMBIA RIVER PORTS (WASHINGTON)',
    WCGOP_GROUP: 'ZZ'
  },
  {
    AGID: 'W',
    PCGROUP: 'AWA',
    PCID: 'CP5',
    NAME: 'CATCHER-PROCESSOR LANDINGS IN WASHINGTON STATE',
    WCGOP_GROUP: 'ZZ'
  },
  {
    AGID: 'W',
    PCGROUP: 'AWA',
    PCID: 'CWA',
    NAME: 'WASHINGTON COASTAL PORTS',
    WCGOP_GROUP: 'ZZ'
  },
  {
    AGID: 'W',
    PCGROUP: 'AWA',
    PCID: 'NPS',
    NAME: 'NORTH PUGET SOUND PORTS',
    WCGOP_GROUP: 'ZZ'
  },
  {
    AGID: 'W',
    PCGROUP: 'AWA',
    PCID: 'SPS',
    NAME: 'SOUTH PUGET SOUND PORTS',
    WCGOP_GROUP: 'ZZ'
  },
  {
    AGID: 'W',
    PCGROUP: 'AWA',
    PCID: 'WA5',
    NAME: 'OTHER OR UNKNOWN WASHINGTON PORTS',
    WCGOP_GROUP: 'ZZ'
  },
  {
    AGID: 'W',
    PCGROUP: 'CP5',
    PCID: 'WCP',
    NAME: 'CATCHER-PROCESSOR LANDINGS IN WASHINGTON STATE',
    WCGOP_GROUP: 'ZZ'
  },
  {
    AGID: 'W',
    PCGROUP: 'WA5',
    PCID: 'OWA',
    NAME: 'OTHER OR UNKNOWN WASHINGTON PORTS',
    WCGOP_GROUP: 'ZZ'
  }];

// export const EM_EFP = [
//   {
//     vessel_name: 'Alex', USCG: '580568', LEP: 'GF0084',
//     EFP_Type: 'Leipzig', Gear: ['Bottom trawl, midwater'],
//     Sector: null, EM_EFP_Number: 'EM-34', Notes: null
//   },
//   {
//     vessel_name: 'Alyssa Ann', USCG: '976374', LEP: 'GF0875',
//     EFP_Type: 'Eder', Gear: ['Pot'],
//     Sector: null, EM_EFP_Number: 'EM-04', Notes: null
//   },
//   {
//     vessel_name: 'Arctic Fury', USCG: '996920', LEP: 'GF0675',
//     EFP_Type: 'Whiting', Gear: ['Midwater trawl'],
//     Sector: 'Both', EM_EFP_Number: 'EM-38', Notes: null
//   }];
