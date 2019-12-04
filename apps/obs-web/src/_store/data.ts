import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import moment from 'moment';

import { alert } from '@/_store/alert.module';

import { Vessel } from '@boatnet/bn-models';
import { OTSTrip, OTSMessage, OTSUser, OTSTarget, WcgopTrip, Permit, Person } from '@boatnet/bn-models';

import { RootState } from '@/_store/types/types';

Vue.use(Vuex);

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

