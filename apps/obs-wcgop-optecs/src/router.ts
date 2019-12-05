import Vue from 'vue';
import Router from 'vue-router';
import DefaultLayout from './layouts/Default.vue';
import Settings from './views/Settings.vue';
import Login from './views/Login.vue';
import Trips from './views/Trips.vue';
import TripDetails from './views/TripDetails.vue';
import Hauls from './views/Hauls.vue';
import HaulDetails from './views/HaulDetails.vue';
import Tally from './views/Tally.vue';
import Catch from './views/Catch.vue';
import DynamicTripDetails from './views/DynamicTripDetails.vue';

import { authService } from '@boatnet/bn-auth';

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
          path: '',
          name: 'trips',
          component: Trips,
          meta: {
            breadcrumb: [
              { name: 'Trip'}
            ]
          }
        },
        {
          path: '/tripdetails/:tripNum',
          name: 'tripdetails',
          component: TripDetails,
          props: (route) => ({ tripNum: Number(route.params.tripNum) }),
          meta: {
            breadcrumb: [
              { name: 'Trip', link: '' },
              { name: 'tripIdPlaceholder', link: ''}
            ]
          }
        },
        {
          path: '/dynamictripdetails',
          name: 'dynamictripdetails',
          component: DynamicTripDetails,
          props: (route) => ({ tripNum: Number(route.params.tripNum) }),
          meta: {
            breadcrumb: [
              { name: 'Trip', link: '' },
              { name: '4', link: '' },
              { name: 'Dynamic Trip Details', link: ''}
            ]
          }
        },
        {
          path: '/settings',
          name: 'settings',
          component: Settings
        },
        {
          path: '/hauls',
          name: 'hauls',
          component: Hauls,
          meta: {
            breadcrumb: [
              { name: 'Trip', link: '' },
              { name: 'tripIdPlaceholder', link: ''},
              { name: 'Hauls', link: '/hauls'}
            ]
          }
        },
        {
          path: '/hauldetails/:haulNum',
          name: 'hauldetails',
          component: HaulDetails,
          props: (route) => ({ haulNum: Number(route.params.haulNum) }),
          meta: {
            breadcrumb: [
              { name: 'Trip', link: '' },
              { name: 'tripIdPlaceholder', link: '/tripdetails/'},
              { name: 'Hauls', link: '/hauls'},
              { name: 'haulIdPlaceholder', link: ''}
            ]
          }
        },
        {
          path: '/catch',
          name: 'catch',
          component: Catch,
          meta: {
            breadcrumb: [
              { name: 'Trip', link: '' },
              { name: 'tripIdPlaceholder', link: ''},
              { name: 'Hauls', link: '/hauls'},
              { name: 'haulIdPlaceholder', link: ''},
              { name: 'Catch', link: '/catch'}
            ]
          }
        },
        {
          path: '/tally',
          name: 'tally',
          component: Tally,
          meta: {
            breadcrumb: [
              { name: 'Trip', link: '' },
              { name: '#x', link: '/tripdetails/'},
              { name: 'Hauls', link: '/hauls'},
              { name: '#y', link: ''},
              { name: 'Catch', link: '/catch'},
              { name: '#z', link: ''}
            ]
          }
        }
      ]
    }, // otherwise redirect to home
    { path: '*', redirect: '/' }
  ]
});

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const logged = authService.isLoggedIn();

  if (authRequired && !logged) {
    return next('/login');
  }
  next();
});

export default router;
