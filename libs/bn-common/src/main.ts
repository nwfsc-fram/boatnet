import Vue from 'vue';
import BoatnetHauls from './components/BoatnetHauls.vue';
import BoatnetTrips from './components/BoatnetTrips.vue';

const Components: any = {
  BoatnetHauls,
  BoatnetTrips
};

Object.keys(Components).forEach((name) => {
  Vue.component(name, Components[name]);
});

export * from './models/BoatnetHaulsSettings';
export * from './models/BoatnetTripsSettings';
export default Components;
