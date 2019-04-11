import Vue from 'vue';

// NOTE: This component has Quasar requirements.
// The host app is responsible for importing the quasar widgets used in this module.

const Components: any = {};

Object.keys(Components).forEach((name) => {
  Vue.component(name, Components[name]);
});

export * from './_services/couch.service';
export * from './_store/';
export default Components;
