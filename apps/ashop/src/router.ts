import Vue from 'vue';
import Router from 'vue-router';
import DefaultLayout from './layouts/Default.vue';
import Trips from './views/Trips.vue';
import TripDetails from './views/TripDetails.vue';
import EndTrip from './views/EndTrip.vue';
import Login from './views/Login.vue';
import Hauls from './views/Hauls.vue';
import HaulDetails from './views/HaulDetails.vue';
import Settings from './views/Settings.vue';
import NonFishingDays from './views/NonFishingDays.vue';
import NonFishingDayDetails from './views/NonFishingDayDetails.vue';
import Cruise from './views/Cruise.vue';

import { authService } from '@boatnet/bn-auth';
import store from './_store';

// Note: Jenkins build will update this dbConfig.ts file for Prod/ Stage/ Dev etc.
import dbConfig from './config/dbConfig';
authService.setDBConfig(dbConfig);

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      component: Login
    },
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '/cruise',
          name: 'cruise',
          component: Cruise,
          meta: {
            breadcrumb: []
          }
        },
        {
          path: '',
          name: 'trips',
          component: Trips,
          meta: {
            breadcrumb: [
              { name: 'Trip' }
            ]
          }
        },
        {
          path: '/settings',
          name: 'settings',
          component: Settings
        },
        {
          path: '/tripdetails/:tripNum',
          name: 'tripdetails',
          component: TripDetails,
          props: (route: any) => ({ tripNum: Number(route.params.tripNum) }),
          meta: {
            breadcrumb: [
              { name: 'Trip', link: '' },
              { name: 'tripIdPlaceholder', link: '' }
            ]
          }
        },
        {
          path: '/endtrip/:tripNum',
          name: 'endtrip',
          component: EndTrip,
          props: (route: any) => ({ tripNum: Number(route.params.tripNum) }),
          meta: {
            breadcrumb: [
              { name: 'Trip', link: '' },
              { name: 'tripIdPlaceholder', link: '' }
            ]
          }
        },
        {
          path: '/hauls',
          name: 'Hauls',
          component: Hauls,
          meta: {
            breadcrumb: [
              { name: 'Trip', link: '' },
              { name: 'tripIdPlaceholder', link: '' },
              { name: 'Hauls', link: '' }
            ]
          }
        },
        {
          path: '/hauldetails/:haulNum',
          name: 'HaulDetails',
          component: HaulDetails,
          meta: {
            breadcrumb: [
              { name: 'Trip', link: '' },
              { name: 'tripIdPlaceholder', link: '' },
              { name: 'Hauls', link: '/hauls' },
              { name: 'haulIdPlaceholder', link: ''}
            ]
          }
        },
        {
          path: '/nonFishingDays',
          name: 'NonFishingDays',
          component: NonFishingDays,
          meta: {
            breadcrumb: [
              { name: 'Trip', link: '' },
              { name: 'Non Fishing Days', link: '/nonFishingDays' }
            ]
          }
        },
        {
          path: '/nonFishingDays/:nonFishingDayNum',
          name: 'NonFishingDayDetails',
          component: NonFishingDayDetails,
          meta: {
            breadcrumb: [
              { name: 'Trip', link: '' },
              { name: 'Non Fishing Days', link: '/nonFishingDays' },
              { name: 'nonFishingDayPlaceholder', link: '' }
            ]
           }
        }
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  // redirect to previous page if trying to access page not listed in config for that app
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const logged = authService.isLoggedIn();

  if (authRequired && !logged) {
    return next('/login');
  } else {
    next();
  }
});

export default router;
