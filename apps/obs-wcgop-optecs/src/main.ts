import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './_store';
import './registerServiceWorker';

// The quasar stylus imports are somewhat broken, so import css here
// As described in https://alligator.io/vuejs/css-frameworks-vuejs/
import 'quasar/dist/quasar.min.css';
import '@/assets/directional-buttons.css';
// Import what we can from the stylus files:
import './styles/quasar.styl';

import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css';


import { VueTouchKeyboard} from 'vue-touch-keyboard';

import {
  Quasar,
  QBanner,
  QBreadcrumbs,
  QBreadcrumbsEl,
  QBtn,
  QBtnGroup,
  QBtnToggle,
  QLayout,
  QHeader,
  QInput,
  QDrawer,
  QOptionGroup,
  QPageContainer,
  QPage,
  QSelect,
  QSeparator,
  QSpinner,
  QSpace,
  QTab,
  QTabs,
  QTabPanel,
  QTabPanels,
  QTable,
  QToggle,
  QToolbar,
  QToolbarTitle,
  QIcon,
  QList,
  QItem,
  QItemSection,
  QItemLabel
} from 'quasar';

Vue.use(Quasar, {
  config: {},
  components: {
    QBanner,
    QBreadcrumbs,
    QBreadcrumbsEl,
    QBtn,
    QBtnGroup,
    QBtnToggle,
    QLayout,
    QHeader,
    QInput,
    QDrawer,
    QOptionGroup,
    QPageContainer,
    QPage,
    QSelect,
    QSeparator,
    QSpinner,
    QSpace,
    QTab,
    QTabs,
    QTabPanel,
    QTabPanels,
    QTable,
    QToggle,
    QToolbar,
    QToolbarTitle,
    QIcon,
    QList,
    QItem,
    QItemSection,
    QItemLabel
  },
  directives: {},
  plugins: {}
});

Vue.config.productionTip = false;

// Vue.use(VueTouchKeyboard);

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app');
