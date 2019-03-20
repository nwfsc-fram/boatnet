import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import VueResource from 'vue-resource'
import './registerServiceWorker';

import 'quasar/dist/quasar.min.css'; // WS- Added this after commenting out .styl imports
import './styles/quasar.styl';
import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import {
  Quasar, QLayout, QHeader, QDrawer, QPageContainer, QPage, QToolbar,
  QToolbarTitle, QBtn, QIcon, QList, QItem, QItemSection, QItemLabel, QCard, QCardSection, QCardActions, QSelect, QInput, QDate, QPopupProxy, QSlideItem, QDialog
} from 'quasar';

import UserDetails from './views/UserDetails.vue';

Vue.use(VueResource);

Vue.use(Quasar, {
  config: {},
  components: {
    QLayout, QHeader, QDrawer, QPageContainer, QPage, QToolbar, QToolbarTitle, QBtn, QIcon, QList, QItem, QItemSection, QItemLabel, QCard, QCardSection, QCardActions, QSelect, QInput, QDate, QPopupProxy, QSlideItem, QDialog
  },
  directives: {},
  plugins: {}
});

Vue.component('appUserDetails', UserDetails);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app');