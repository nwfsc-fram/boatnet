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
import '@quasar/extras/mdi-v5/mdi-v5.css';
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css';
import {
  Quasar, QLayout, QHeader, QDrawer, QPageContainer, QPage, QToolbar, QTooltip,
  QToolbarTitle, QBar, QBtn, QBtnToggle, QIcon, QList, QItem, QItemSection, QItemLabel,
  QCard, QCardSection, QCardActions, QSelect, QInput, QDate, QTime,
  QPopupProxy, QSlideItem, QSlideTransition, QDialog, QSlider, QChip, QAvatar, QBanner, QTable,
  QPopupEdit, QCheckbox, QTh, QTr, QTd, QToggle, ClosePopup, QSplitter, QTabPanels,
  QTabPanel, QScrollArea, QSpinner, QSpinnerBars, QSpinnerHourglass, QSpinnerRadio,
  QSpace, QTabs, QTab, QRouteTab, QSeparator, QInnerLoading, QSpinnerPuff,
  Notify, QLinearProgress, QCircularProgress, QExpansionItem, QField, QForm, QBadge,
  QUploader, QFab, QFabAction, QMenu
} from 'quasar';

import 'primevue/resources/themes/nova/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import PrimeVue from 'primevue/config';

import UserDetails from './views/UserDetails.vue';
import DebrieferAssessment from './views/DebrieferAssessment.vue';
import DebrieferDcs from './views/DebrieferDcs.vue';
import DebrieferErrors from './views/DebrieferErrors.vue';
import DebrieferWcgopData from './views/DebrieferWcgopData.vue';
import DebrieferAshopData from './views/DebrieferAshopData.vue';
import DebrieferCruises from './views/DebrieferCruises.vue';
import DebrieferTrips from './views/DebrieferTrips.vue';
import DebrieferOperations from './views/DebrieferOperations.vue';
import DebrieferCatches from './views/DebrieferCatches.vue';
import DebrieferBiospecimens from './views/DebrieferBiospecimens.vue';
import DebrieferDialog from './views/DebrieferDialog.vue';
import DebrieferSummary from './views/DebrieferSummary.vue';
import DebrieferLayoutAshop from './views/DebrieferLayoutAshop.vue';
import DebrieferWcgopSearch from './views/DebrieferWcgopSearch.vue';
import DebrieferWcgopEvaluation from './views/DebrieferWcgopEvaluation.vue';
import CruiseDialog from './views/CruiseDialog.vue';
import ViewImage from './views/ViewImage.vue';
import VCalendar from 'v-calendar';
// Vue.use(VueResource);

import VueCompositionApi from '@vue/composition-api';
import { colors } from 'quasar';

import 'vue2-timepicker/dist/VueTimepicker.css';

colors.setBrand('primary', '#007EC6');
colors.setBrand('secondary', '#153547');

Vue.use(Quasar, {
  config: {},
  components: {
    QLayout, QHeader, QDrawer, QPageContainer, QPage, QToolbar, QTooltip,
    QToolbarTitle, QBar, QBtn, QBtnToggle, QIcon, QList, QItem, QItemSection,
    QItemLabel, QCard, QCardSection, QCardActions, QSelect,
    QInput, QDate, QTime, QPopupProxy, QSlideItem, QSlideTransition, QDialog, QSlider,
    QChip, QAvatar, QBanner, QTable, QPopupEdit, QCheckbox, QTh, QTr, QTd,
    QToggle, QSplitter, QTabPanels, QTabPanel, QScrollArea, QSpinner,
    QSpinnerBars, QSpinnerHourglass, QSpinnerRadio, QSpace, QTabs, QTab,
    QRouteTab, QSeparator, QInnerLoading, QSpinnerPuff, QLinearProgress,
    QCircularProgress, QExpansionItem, QField, QForm,  QBadge, QUploader,
    QFab, QFabAction, QMenu
  },
  directives: {
    ClosePopup
  },
  plugins: {
    Notify
  }
});

Vue.use(PrimeVue);
Vue.use(VueCompositionApi);
Vue.use(VCalendar);

Vue.component('appUserDetails', UserDetails);
Vue.component('appDebrieferAssessment', DebrieferAssessment);
Vue.component('appDebrieferDcs', DebrieferDcs);
Vue.component('appDebrieferErrors', DebrieferErrors);
Vue.component('appDebrieferDialog', DebrieferDialog);
Vue.component('appDebrieferSummary', DebrieferSummary);
Vue.component('appDebrieferCruises', DebrieferCruises);
Vue.component('appDebrieferTrips', DebrieferTrips);
Vue.component('appDebrieferOperations', DebrieferOperations);
Vue.component('appDebrieferCatches', DebrieferCatches);
Vue.component('appDebrieferBiospecimens', DebrieferBiospecimens);
Vue.component('appDebrieferWcgopData', DebrieferWcgopData);
Vue.component('appDebrieferAshopData', DebrieferAshopData);
Vue.component('appDebrieferLayoutAshop', DebrieferLayoutAshop);
Vue.component('appDebrieferWcgopSearch', DebrieferWcgopSearch);
Vue.component('appDebrieferWcgopEvaluation', DebrieferWcgopEvaluation);
Vue.component('appCruiseDialog', CruiseDialog);
Vue.component('appViewImage', ViewImage);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app');
