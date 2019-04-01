import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import moment from 'moment';

import { alert } from '@/_store/alert.module';
import { auth } from '@/_store/auth.module';
import { Permit, OtsTarget } from '@/_store/types/types.ts';
import { BaseTrip } from '@boatnet/bn-models';

import { RootState } from '@/_store/types/types';

Vue.use(Vuex);

const activeVessel = 'Excalibur';
const activeTrip = '';
const activeUser = {
  name: '', role: '', email: '', mobile: '', home: '', address: '', city: '', state: '',
  zipcode: '', homeport: '', notification_prefs: []
};
const activePermit: string = '';
const newTrip: boolean =  false;
const targetTypes: string[] = ['Fishery', 'Vessel', 'Port Group'];

const fisheries: string[] =  [
  'EM EFP',
  'Limited Entry - Catch Shares',
  'Trawl Gear - MOD EFP',
  'Catch Shares - Shore Side Hake'
];

const permits: Permit[] = [
    { permit_number: 'GF0001', certificate_start_date: '2019-01-01T08:00:00Z',
    certificate_end_date: '2019-12-31T08:00:00Z', permit_owner: 'F/V VIGOROUS INC',
    permit_owner_address: '6533 SEAVIEW AVE NW APT 607A', permit_owner_city: 'SEATTLE',
    permit_owner_state: 'WA', permit_owner_zip: '98117', vessel_name: 'VIGOROUS',
    vessel_length: 64.33, vessel_registration_number: '250226',
    vessel_owner: 'F/V VIGOROUS INC AND GLEM FISHERIES LLC',
    vessel_owner_address: '6533 SEAVIEW AVE NW APT 607A',
    vessel_owner_city: 'SEATTLE', vessel_owner_state: 'WA',
    vessel_owner_zip: '98117', trawl_gear: 'No', longline_gear: 'Yes',
    trap_pot_gear: 'No', small_fleet: 'No', endorsed_length: 64.84,
    sablefish_endorsement: 'Yes', sablefish_tier: '1', cp_endorsement: 'No',
    ms_endorsement: 'No', mothership_catcher_vessel: 'No', whiting_percent: null,
    whiting_assignment: null, status: 'Active', goid: '2108', ghid: '9687',
    owner_on_board_exempt: 'Yes' },
    { permit_number: 'GF0002', certificate_start_date: '2019-01-01T08:00:00Z',
    certificate_end_date: '2019-12-31T08:00:00Z', permit_owner: 'ERICKSON, SHERYL ANN ',
    permit_owner_address: '602 DAWLEY ROAD', permit_owner_city: 'SEQUIM',
    permit_owner_state: 'WA', permit_owner_zip: '98382', vessel_name: 'GALLOWS POINT',
    vessel_length: 43, vessel_registration_number: 'WN2165NM',
    vessel_owner: 'OVERMAN, INGRID JOAN', vessel_owner_address:
    'PO BOX 724', vessel_owner_city: 'GRAYLAND', vessel_owner_state: 'WA',
    vessel_owner_zip: '98547', trawl_gear: 'No', longline_gear: 'Yes',
    trap_pot_gear: 'No', small_fleet: 'No', endorsed_length: 44.3,
    sablefish_endorsement: 'Yes', sablefish_tier: '3', cp_endorsement: 'No',
    ms_endorsement: 'No', mothership_catcher_vessel: 'No', whiting_percent: null,
    whiting_assignment: null, status: 'Active', goid: '10208', ghid: '9393',
    owner_on_board_exempt: 'No' },
    { permit_number: 'GF0003', certificate_start_date: '2019-01-01T08:00:00Z',
    certificate_end_date: '2019-12-31T08:00:00Z', permit_owner: 'THE THOR CORPORATION',
    permit_owner_address: '5525 SE SCENIC LN  UNIT 204', permit_owner_city: 'VANCOUVER',
    permit_owner_state: 'WA', permit_owner_zip: '98661', vessel_name: 'GOLDEN CHALICE',
    vessel_length: 56.75, vessel_registration_number: '548356',
    vessel_owner: 'GOLDEN CHALICE LLC AND QV LLC', vessel_owner_address: 'PO BOX 1729',
    vessel_owner_city: 'GIG HARBOR', vessel_owner_state: 'WA', vessel_owner_zip: '98335',
    trawl_gear: 'No', longline_gear: 'Yes', trap_pot_gear: 'No', small_fleet: 'No',
    endorsed_length: 69, sablefish_endorsement: 'Yes', sablefish_tier: '2',
    cp_endorsement: 'No', ms_endorsement: 'No', mothership_catcher_vessel: 'No',
    whiting_percent: null, whiting_assignment: null, status: 'Active',
    goid: '6216', ghid: '9847', owner_on_board_exempt: 'Yes' },
    { permit_number: 'GF0004', certificate_start_date: '2019-01-01T08:00:00Z',
    certificate_end_date: '2019-12-31T08:00:00Z',
    permit_owner: 'FLETCHER, JEFFREY L AND FLETCHER, TYNA L',
    permit_owner_address: '560 KINGS AVE', permit_owner_city: 'LAKESIDE',
    permit_owner_state: 'OR', permit_owner_zip: '97449', vessel_name: 'GINNY G',
    vessel_length: 54.1, vessel_registration_number: '630351',
    vessel_owner: 'FLETCHER, JEFFREY L AND FLETCHER, TYNA L',
    vessel_owner_address: '560 KINGS AVE', vessel_owner_city: 'LAKESIDE',
    vessel_owner_state: 'OR', vessel_owner_zip: '97449', trawl_gear: 'No',
    longline_gear: 'Yes', trap_pot_gear: 'No', small_fleet: 'No',
    endorsed_length: 35, sablefish_endorsement: 'Yes', sablefish_tier: '3',
    cp_endorsement: 'No', ms_endorsement: 'No', mothership_catcher_vessel: 'No',
    whiting_percent: null, whiting_assignment: null, status: 'Active',
    goid: '2269', ghid: '2353', owner_on_board_exempt: 'Yes' },
    { permit_number: 'GF0005', certificate_start_date: '2019-01-01T08:00:00Z',
    certificate_end_date: '2019-12-31T08:00:00Z', permit_owner: 'GREEN, MATTHEW KEONI',
    permit_owner_address: '602 15TH AVE E', permit_owner_city: 'SEATTLE', permit_owner_state: 'WA',
    permit_owner_zip: '98112', vessel_name: 'ESTHER LOUISE', vessel_length: 37.5,
    vessel_registration_number: '545715', vessel_owner: 'CARROLL, PAAVO K',
    vessel_owner_address: '184 MAIN STREET', vessel_owner_city: 'MORRO BAY',
    vessel_owner_state: 'CA', vessel_owner_zip: '93442', trawl_gear: 'No', longline_gear: 'Yes',
    trap_pot_gear: 'No', small_fleet: 'No', endorsed_length: 33, sablefish_endorsement: 'No',
    sablefish_tier: null, cp_endorsement: 'No', ms_endorsement: 'No', mothership_catcher_vessel: 'No',
    whiting_percent: null, whiting_assignment: null, status: 'Active', goid: '9531', ghid: '9532',
    owner_on_board_exempt: null },
    { permit_number: 'GF0006', certificate_start_date: '2019-01-01T08:00:00Z',
    certificate_end_date: '2019-12-31T08:00:00Z', permit_owner: 'D\'AMATO, ONOFRIO', permit_owner_address:
    '1380 N PACIFIC ST', permit_owner_city: 'OCEANSIDE', permit_owner_state: 'CA', permit_owner_zip: '92054',
    vessel_name: 'M TOO', vessel_length: 35, vessel_registration_number: '988700',
    vessel_owner: 'D\'AMATO, ONOFRIO', vessel_owner_address: '1380 N PACIFIC ST',
    vessel_owner_city: 'OCEANSIDE', vessel_owner_state: 'CA', vessel_owner_zip: '92054', trawl_gear: 'No',
    longline_gear: 'Yes', trap_pot_gear: 'No', small_fleet: 'No', endorsed_length: 32,
    sablefish_endorsement: 'No', sablefish_tier: null, cp_endorsement: 'No', ms_endorsement: 'No',
    mothership_catcher_vessel: 'No', whiting_percent: null, whiting_assignment: null, status: 'Active',
    goid: '1317', ghid: '1335', owner_on_board_exempt: null }
  ];

const otsTargets: OtsTarget[] = [
  {
    fishery: 'EM EFP', targetType: 'Fishery', target: 'Fishery Wide', rate: 40,
    startDate: '2019-03-26T08:20:33-07:00'
  },
  {
    fishery: 'EM EFP', targetType: 'Vessel', target: 'Excalibur', rate: 37,
    startDate: '2019-03-26T08:20:33-07:00'
  },
  {
    fishery: 'EM EFP', targetType: 'Port Group', target: 'AT', rate: 25,
    startDate: '2019-03-26T08:20:33-07:00'
  },
  {
    fishery: 'EM EFP', targetType: 'Port Group', target: 'AT', rate: 25,
    startDate: '2019-03-26T08:20:33-07:00', endDate: '2019-03-29T08:20:33-07:00'
  },
];

const trips = [
  {
    type: 'trip', trip_num: '3', vessel: 'Excalibur', coast_guard_number: 'fgr243rt',
    start_date: '8/03/2018 10:01 AM', end_date: '8/20/2018 3:33 PM', is_open: false,
    selected: false, start_port: 'Newport', end_port: 'same as start', messages: [],
    id: '123456', permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares',
      }, ]
  },
  {
    type: 'trip', trip_num: '2', vessel: 'Excalibur', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares'
      },
      {
        id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something',
        fishery: 'Trawl Gear - MOD EFP'
      },
      {
        id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something',
        fishery: 'Catch Shares - Shore Side Hake'
      },
    ], start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM',
    is_open: false, selected: true, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
  {
    type: 'trip', trip_num: '1', vessel: 'Excalibur', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares'
      },
      {
        id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something',
        fishery: 'Trawl Gear - MOD EFP'
      },
      {
        id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something',
        fishery: 'Catch Shares - Shore Side Hake'
      }
    ], start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM',
    is_open: false, selected: false, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
  {
    type: 'trip', trip_num: '5', vessel: 'Excalibur', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something',
        fishery: 'Catch Shares - Shore Side Hake'
      }]
    , start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM',
    is_open: true, selected: true, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
  {
    type: 'trip', trip_num: '4', vessel: 'Excalibur', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares'
      },
      {
        id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something',
        fishery: 'Trawl Gear - MOD EFP'
      }
    ], start_date: '12/1/2018 10:01 AM', end_date: '12/15/2018 3:33 PM',
    is_open: true, selected: false, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
  {
    type: 'trip', trip_num: '2', vessel: 'Ms Julie', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares'
      },
      {
        id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something',
        fishery: 'Trawl Gear - MOD EFP'
      },
      {
        id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something',
        fishery: 'Catch Shares - Shore Side Hake'
      }
    ], start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM',
    is_open: false, selected: true, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
  {
    type: 'trip', trip_num: '1', vessel: 'Ms Julie', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares'
      },
      {
        id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something',
        fishery: 'Trawl Gear - MOD EFP'
      },
      {
        id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something',
        fishery: 'Catch Shares - Shore Side Hake'
      }
    ], start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM',
    is_open: false, selected: false, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
  {
    type: 'trip', trip_num: '3', vessel: 'Ms Julie', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares'
      },
      {
        id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something',
        fishery: 'Trawl Gear - MOD EFP'
      },
      {
        id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something',
        fishery: 'Catch Shares - Shore Side Hake'
      }
    ], start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM',
    is_open: true, selected: true, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
  {
    type: 'trip', trip_num: '4', vessel: 'Last Straw', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares'
      },
      {
        id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something',
        fishery: 'Trawl Gear - MOD EFP'
      },
      {
        id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something',
        fishery: 'Catch Shares - Shore Side Hake'
      }
    ], start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM',
    is_open: true, selected: true, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
  {
    type: 'trip', trip_num: '3', vessel: 'Last Straw', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares'
      },
      {
        id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something',
        fishery: 'Trawl Gear - MOD EFP'
      },
      {
        id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something',
        fishery: 'Catch Shares - Shore Side Hake'
      }
    ], start_date: '12/1/2018 10:01 AM', end_date: '12/15/2018 3:33 PM',
    is_open: true, selected: false, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
  {
    type: 'trip', trip_num: '2', vessel: 'Last Straw', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares'
      },
      {
        id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something',
        fishery: 'Trawl Gear - MOD EFP'
      },
      {
        id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something',
        fishery: 'Catch Shares - Shore Side Hake'
      }
    ], start_date: '12/1/2018 10:01 AM', end_date: '12/15/2018 3:33 PM',
    is_open: false, selected: false, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
  {
    type: 'trip', trip_num: '1', vessel: 'Last Straw', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares'
      },
      {
        id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something',
        fishery: 'Trawl Gear - MOD EFP'
      },
      {
        id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something',
        fishery: 'Catch Shares - Shore Side Hake'
      }
    ], start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM',
    is_open: false, selected: true, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
  {
    type: 'trip', trip_num: '4', vessel: 'Raven', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares'
      },
      {
        id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something',
        fishery: 'Trawl Gear - MOD EFP'
      },
      {
        id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something',
        fishery: 'Catch Shares - Shore Side Hake'
      }
    ], start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM',
    is_open: false, selected: false, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
  {
    type: 'trip', trip_num: '5', vessel: 'Raven', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares'
      },
      {
        id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something',
        fishery: 'Trawl Gear - MOD EFP'
      },
      {
        id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something',
        fishery: 'Catch Shares - Shore Side Hake'
      }
    ], start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM',
    is_open: true, selected: true, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
  {
    type: 'trip', trip_num: '3', vessel: 'Raven', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares'
      },
      {
        id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something',
        fishery: 'Trawl Gear - MOD EFP'
      },
      {
        id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something',
        fishery: 'Catch Shares - Shore Side Hake'
      }
    ], start_date: '8/03/2018 10:01 AM', end_date: '8/20/2018 3:33 PM',
    is_open: false, selected: false, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
  {
    type: 'trip', trip_num: '2', vessel: 'Raven', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares'
      },
      {
        id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something',
        fishery: 'Trawl Gear - MOD EFP'
      },
      {
        id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something',
        fishery: 'Catch Shares - Shore Side Hake'
      }
    ], start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM',
    is_open: false, selected: true, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
  {
    type: 'trip', trip_num: '1', vessel: 'Raven', coast_guard_number: 'fgr243rt',
    permits: [
      {
        id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares'
      },
      {
        id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something',
        fishery: 'Trawl Gear - MOD EFP'
      },
      {
        id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something',
        fishery: 'Catch Shares - Shore Side Hake'
      }
    ], start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM',
    is_open: false, selected: false, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456'
  },
];

const users = [
  {
    name: 'Seth Gerou', roles: ['Captain'], email: 'user@noaa.gov',
    mobile: 2065551212, home: 4322221232, homeport: 'Seattle'
  },
  {
    name: 'Melina Shak', roles: ['Captain'], email: 'user@noaa.gov',
    mobile: 2065551212, home: 4322221232, homeport: 'Seattle'
  },
  {
    name: 'Nick Schaffer', roles: ['Observer'], email: 'user@noaa.gov',
    mobile: 2065551212, home: 4322221232, homeport: 'Seattle'
  },
  {
    name: 'Neil Riley', roles: ['Staff'], email: 'user@noaa.gov',
    mobile: 2065551212, home: 4322221232, homeport: 'Seattle'
  },
  {
    name: 'Will Smith', roles: ['Provider'], email: 'user@noaa.gov',
    mobile: 2065551212, home: 4322221232, homeport: 'Seattle'
  }
];

const roles = ['Captain', 'Observer', 'Staff', 'Provider', 'Permit Owner'];

const usStates = [
  'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA',
  'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA',
  'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
  'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
  'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const portGroups = [
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

const ports = [
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
