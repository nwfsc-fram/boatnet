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
  QTh, QTr, QTd, QToggle, ClosePopup, QSplitter, QTabPanels, QTabPanel, QSpinner,
  QSpinnerBars, QSpinnerHourglass, QSpinnerRadio, QSpace, QTabs, QTab, QRouteTab, QSeparator, QInnerLoading
} from 'quasar';

import UserDetails from './views/UserDetails.vue';
import DebrieferTrips from './views/DebrieferTrips.vue';
import DebrieferOperations from './views/DebrieferOperations.vue';
import DebrieferCatches from './views/DebrieferCatches.vue';
import DebrieferCatchSpecies from './views/DebrieferCatchSpecies.vue';
import DebrieferCatchBaskets from './views/DebrieferCatchBaskets.vue';
// Vue.use(VueResource);

Vue.use(Quasar, {
  config: {},
  components: {
    QLayout, QHeader, QDrawer, QPageContainer, QPage, QToolbar,
    QToolbarTitle, QBtn, QIcon, QList, QItem, QItemSection,
    QItemLabel, QCard, QCardSection, QCardActions, QSelect,
    QInput, QDate, QTime, QPopupProxy, QSlideItem, QDialog, QSlider,
    QChip, QAvatar, QBanner, QTable, QTh, QTr, QTd, QToggle, QSplitter,
    QTabPanels, QTabPanel,   QSpinner, QSpinnerBars, QSpinnerHourglass, QSpinnerRadio, QSpace,
    QTabs, QTab, QRouteTab, QSeparator, QInnerLoading
  },
  directives: {
    ClosePopup
  },
  plugins: {}
});

Vue.component('appUserDetails', UserDetails);
Vue.component('appDebrieferTrips', DebrieferTrips);
Vue.component('appDebrieferOperations', DebrieferOperations);
Vue.component('appDebrieferCatches', DebrieferCatches);
Vue.component('appDebrieferCatchSpecies', DebrieferCatchSpecies);
Vue.component('appDebrieferCatchBaskets', DebrieferCatchBaskets);
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app');
