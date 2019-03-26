import Vue from 'vue';
import Vuex from 'vuex';
import moment from 'moment';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    activeVessel: 'Excalibur',
    activeTrip: '',
    activeUser: { name: '', role: '', email: '', mobile: '', home: '', address: '', city: '', state: '', zipcode: '', homeport: '', notification_prefs: [] },
    permits: [],
    activePermit: '',
    newTrip: false,
    targetTypes: ['Fishery', 'Vessel', 'Port Group'],
    fisheries: ['EM EFP', 'Limited Entry - Catch Shares', 'Trawl Gear - MOD EFP', 'Catch Shares - Shore Side Hake'],
    otsTargets: [
      {fishery: 'EM EFP', targetType: 'Fishery', target: 'Fishery Wide', rate: 40, startDate: '2019-03-26T08:20:33-07:00', endDate: null},
      {fishery: 'EM EFP', targetType: 'Vessel', target: 'Excalibur', rate: 37, startDate: '2019-03-26T08:20:33-07:00', endDate: null },
      {fishery: 'EM EFP', targetType: 'Port Group', target: 'AT', rate: 25, startDate: '2019-03-26T08:20:33-07:00', endDate: null},
      {fishery: 'EM EFP', targetType: 'Port Group', target: 'AT' , rate: 25, startDate: '2019-03-26T08:20:33-07:00', endDate: '2019-03-29T08:20:33-07:00'},
    ],
    trips: [
      { type: 'trip', trip_num: '3', vessel: 'Excalibur', coast_guard_number: 'fgr243rt', 
      start_date: '8/03/2018 10:01 AM', end_date: '8/20/2018 3:33 PM', is_open: false,
      selected: false, start_port: 'Newport', end_port: 'same as start', messages: [], 
      id: '123456', permits: [
        { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something',
        fishery: 'Limited Entry - Catch Shares', },] },
      { type: 'trip', trip_num: '2', vessel: 'Excalibur', coast_guard_number: 'fgr243rt',
        permits: [
          { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares' },
          { id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP' },
          { id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake' },
      ], start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM', is_open: false, selected: true, start_port: 'Newport',
      end_port: 'same as start', messages: [], id: '123456' },
      { type: 'trip', trip_num: '1', vessel: 'Excalibur', coast_guard_number: 'fgr243rt',
      permits: [
        { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares' },
        { id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP' },
        { id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake' }
      ], start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM', is_open: false, selected: false, start_port: 'Newport',
      end_port: 'same as start', messages: [], id: '123456' },
      { type: 'trip', trip_num: '5', vessel: 'Excalibur', coast_guard_number: 'fgr243rt',
      permits: [
        { id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake' }]
      , start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM', is_open: true, selected: true, start_port: 'Newport',
      end_port: 'same as start', messages: [], id: '123456' },
      { type: 'trip', trip_num: '4', vessel: 'Excalibur', coast_guard_number: 'fgr243rt',
      permits: [
        { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares' },
        { id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP' }
      ], start_date: '12/1/2018 10:01 AM', end_date: '12/15/2018 3:33 PM', is_open: true, selected: false, start_port: 'Newport',
      end_port: 'same as start', messages: [], id: '123456' },
      { type: 'trip', trip_num: '2', vessel: 'Ms Julie', coast_guard_number: 'fgr243rt',
      permits: [
        { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares' },
        { id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP' },
        { id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake' }
      ], start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM', is_open: false, selected: true, start_port: 'Newport',
      end_port: 'same as start', messages: [], id: '123456' },
      { type: 'trip', trip_num: '1', vessel: 'Ms Julie', coast_guard_number: 'fgr243rt',
      permits: [
        { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares' },
        { id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP' },
        { id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake' }
      ], start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM', is_open: false, selected: false, start_port: 'Newport',
      end_port: 'same as start', messages: [], id: '123456' },
    { type: 'trip', trip_num: '3', vessel: 'Ms Julie', coast_guard_number: 'fgr243rt',
    permits: [
      { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares' },
      { id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP' },
      { id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake' }
    ], start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM', is_open: true, selected: true, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456' },
    { type: 'trip', trip_num: '4', vessel: 'Last Straw', coast_guard_number: 'fgr243rt',
    permits: [
      { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares' },
      { id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP' },
      { id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake' }
    ], start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM', is_open: true, selected: true, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456' },
    { type: 'trip', trip_num: '3', vessel: 'Last Straw', coast_guard_number: 'fgr243rt',
    permits: [
      { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares' },
      { id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP' },
      { id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake' }
    ], start_date: '12/1/2018 10:01 AM', end_date: '12/15/2018 3:33 PM', is_open: true, selected: false, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456' },
    { type: 'trip', trip_num: '2', vessel: 'Last Straw', coast_guard_number: 'fgr243rt',
    permits: [
      { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares' },
      { id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP' },
      { id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake' }
    ], start_date: '12/1/2018 10:01 AM', end_date: '12/15/2018 3:33 PM', is_open: false, selected: false, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456' },
    { type: 'trip', trip_num: '1', vessel: 'Last Straw', coast_guard_number: 'fgr243rt',
    permits: [
      { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares' },
      { id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP' },
      { id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake' }
    ], start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM', is_open: false, selected: true, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456' },
    { type: 'trip', trip_num: '4', vessel: 'Raven', coast_guard_number: 'fgr243rt',
    permits: [
      { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares' },
      { id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP' },
      { id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake' }
    ], start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM', is_open: false, selected: false, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456' },
    { type: 'trip', trip_num: '5', vessel: 'Raven', coast_guard_number: 'fgr243rt',
    permits: [
      { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares' },
      { id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP' },
      { id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake' }
    ], start_date: '11/7/2018 10:01 AM', end_date: '11/23/2018 3:33 PM', is_open: true, selected: true, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456' },
    { type: 'trip', trip_num: '3', vessel: 'Raven', coast_guard_number: 'fgr243rt',
    permits: [
      { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares' },
      { id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP' },
      { id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake' }
    ], start_date: '8/03/2018 10:01 AM', end_date: '8/20/2018 3:33 PM', is_open: false, selected: false, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456' },
    { type: 'trip', trip_num: '2', vessel: 'Raven', coast_guard_number: 'fgr243rt',
    permits: [
      { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares' },
      { id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP' },
      { id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake' }
    ], start_date: '9/9/2018 10:01 AM', end_date: '9/17/2018 3:33 PM', is_open: false, selected: true, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456' },
    { type: 'trip', trip_num: '1', vessel: 'Raven', coast_guard_number: 'fgr243rt',
    permits: [
      { id: 'A21rv35', type: 'permit', uscg_num: 'sdr234', state_reg: 'something', fishery: 'Limited Entry - Catch Shares' },
      { id: 'W32be87', type: 'permit', uscg_num: 'abc123', state_reg: 'something', fishery: 'Trawl Gear - MOD EFP' },
      { id: 'N11es32', type: 'permit', uscg_num: '777qwe', state_reg: 'something', fishery: 'Catch Shares - Shore Side Hake' }
    ], start_date: '10/23/2018 10:01 AM', end_date: '10/31/2018 3:33 PM', is_open: false, selected: false, start_port: 'Newport',
    end_port: 'same as start', messages: [], id: '123456' },
    ],

    users: [
      { name: 'Seth Gerou', role: 'Captain', email: 'user@noaa.gov', mobile: 2065551212, home: 4322221232 },
      { name: 'Melina Shak', role: 'Captain', email: 'user@noaa.gov', mobile: 2065551212, home: 4322221232 },
      { name: 'Nick Schaffer', role: 'Observer', email: 'user@noaa.gov', mobile: 2065551212, home: 4322221232 },
      { name: 'Neil Riley', role: 'Staff', email: 'user@noaa.gov', mobile: 2065551212, home: 4322221232 },
      { name: 'Will Smith', role: 'Provider', email: 'user@noaa.gov', mobile: 2065551212, home: 4322221232 }
    ],

    roles: ['Captain', 'Observer', 'Staff', 'Provider', 'Permit Owner'],

    usStates: [
      'AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FM', 'FL', 'GA',
      'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA',
      'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
      'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
      'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'
    ],
    portGroups: [
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
    ],
    ports: [
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
    ]

  },
  getters: {
    permits: state => { return state.permits; },
    trips: state => { return state.trips; },
    users: state => { return state.users; },
    activeTrip: state => { return state.activeTrip; },
    activeVessel: state => { return state.activeVessel; },
    activeUser: state => { return state.activeUser; },
    openTrips: state => { 
      return state.trips.filter(
        trip => {
          return trip.vessel == state.activeVessel && trip.is_open == true
          }
        ); },
    closedTrips: state => { 
      return state.trips.filter(
        trip => {
          return trip.vessel == state.activeVessel && trip.is_open == false
          }
        ); },
    activeOTSTargets: state => { 
      return state.otsTargets.filter(
        target => {
          if (target.endDate) {
            return moment(target.endDate) >= moment()
          } else {
            return target
          }
          } 
        )
    },
    expiredOTSTargets: state => { 
      return state.otsTargets.filter(
        target => {
          if (target.endDate) {
            return moment(target.endDate) < moment()
          }
        } 
      )
    }
  },
  mutations: {
    updatePermits: (state, payload) => {
      state.permits = payload;
    },
    updateTrips: (state, payload) => {
      state.trips = payload;
    },
    updateActiveTrip: (state, payload) => {
      state.activeTrip = payload;
    },
    updateActiveVessel: (state, payload) => {
      state.activeVessel = payload;
    },
    updateActiveUser: (state, payload) => {
      state.activeUser = payload;
    }

  },
  actions: {
    updatePermits({ commit }, payload) {
      commit('updatePermits', payload);
    },
    updateTrips({ commit }, payload) {
      commit('updateTrips', payload);
    },
    updateActiveTrip({ commit }, payload) {
      commit('updateActiveTrip', payload);
    },
    updateActiveVessel({ commit }, payload) {
      commit('updateActiveVessel', payload);
    },
    updateActiveUser({ commit }, payload) {
      commit('updateActiveUser', payload);
    }
  },

});
