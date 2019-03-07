import Vue from 'vue';
import BoatnetHauls from './components/BoatnetHauls.vue';

const Components: any = {
  BoatnetHauls
};

Object.keys(Components).forEach((name) => {
  Vue.component(name, Components[name]);
});

export * from './models/BoatnetHaulsSettings';
export default Components;
