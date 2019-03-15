import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    activeVessel: {
      name: 'Excalibur',
    },
    permits: [],
    trips: [],
  },
  getters: {
    permits: state => {
      return state.permits
    },
    trips: state => {
      return state.trips
    },
    
  },
  mutations: {  
    updatePermits: (state, payload) => {
      state.permits = payload
    },
    updateTrips: (state, payload) => {
      state.trips = payload
    }
  },
  actions: {
    updatePermits({commit}, payload) {
      commit('updatePermits', payload);
    },
    updateTrips({commit}, payload) {
      commit('updateTrips', payload)
    } 
  },
});
