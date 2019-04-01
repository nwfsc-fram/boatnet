import Vue from 'vue';
import Router from 'vue-router';
import DefaultLayout from './layouts/Default.vue';
import Settings from './views/Settings.vue';
import Login from './views/Login.vue';
import Trips from './views/Trips.vue';
import TripDetails from './views/TripDetails.vue';
import Hauls from './views/Hauls.vue';
import HaulDetails from './views/HaulDetails.vue';

import { authService } from '@boatnet/bn-auth';

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
          component: Trips
        },
        {
          path: '/tripdetails/:tripNum',
          name: 'tripdetails',
          component: TripDetails,
          props: (route) => ({ tripNum: Number(route.params.tripNum) })
        },
        {
          path: '/settings',
          name: 'settings',
          component: Settings
        },
        {
          path: '/hauls',
          name: 'hauls',
          component: Hauls
        },
        {
          path: '/hauldetails/:haulNum',
          name: 'hauldetails',
          component: HaulDetails,
          props: (route) => ({ haulNum: Number(route.params.haulNum) })
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
