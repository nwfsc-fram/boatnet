import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './_store';
import './quasar';

import 'quasar/dist/quasar.min.css';
import './styles/quasar.styl';

import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css';

import VueTouchKeyboard from 'vue-touch-keyboard';
import 'vue-touch-keyboard/dist/vue-touch-keyboard.css';
import VueCompositionApi from '@vue/composition-api';


Vue.use(VueTouchKeyboard);
Vue.use(VueCompositionApi);


Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
