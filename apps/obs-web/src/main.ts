import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './_store';
// import VueResource from 'vue-resource'
import './registerServiceWorker';

import 'quasar/dist/quasar.min.css'; // WS- Added this after commenting out .styl imports
import './styles/quasar.styl';
import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/mdi-v3/mdi-v3.css';
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css';
import {
  Quasar, QLayout, QHeader, QDrawer, QPageContainer, QPage, QToolbar,
  QToolbarTitle, QBtn, QIcon, QList, QItem, QItemSection, QItemLabel,
  QCard, QCardSection, QCardActions, QSelect, QInput, QDate, QTime,
  QPopupProxy, QSlideItem, QDialog, QSlider, QChip, QAvatar, QBanner, QTable,
  QTh, QTr, QTd
} from 'quasar';

import UserDetails from './views/UserDetails.vue';

// Vue.use(VueResource);

Vue.use(Quasar, {
  config: {},
  components: {
    QLayout, QHeader, QDrawer, QPageContainer, QPage, QToolbar,
    QToolbarTitle, QBtn, QIcon, QList, QItem, QItemSection,
    QItemLabel, QCard, QCardSection, QCardActions, QSelect,
    QInput, QDate, QTime, QPopupProxy, QSlideItem, QDialog, QSlider,
    QChip, QAvatar, QBanner, QTable, QTh, QTr, QTd
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
