import Vue from 'vue';
import Router from 'vue-router';
import DefaultLayout from './layouts/Default.vue';
import Trips from './views/Trips.vue';
import TripDetails from './views/TripDetails.vue';
import Login from './views/Login.vue';
import Hauls from './views/Hauls.vue';
import Settings from './views/Settings.vue';

import { authService } from '@boatnet/bn-auth';
import store from './_store';

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
<<<<<<< HEAD
              { name: 'Trip' }
=======
              { name: 'Trip'}
>>>>>>> 0cf2898d9a728d7d68a97a417fb3c34e3e52c283
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
<<<<<<< HEAD
              { name: 'tripIdPlaceholder', link: '' }
=======
              { name: 'tripIdPlaceholder', link: ''}
>>>>>>> 0cf2898d9a728d7d68a97a417fb3c34e3e52c283
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
<<<<<<< HEAD
              { name: 'tripIdPlaceholder', link: '' },
              { name: 'Hauls', link: '' }
=======
              { name: 'tripIdPlaceholder', link: ''},
              { name: 'Hauls', link: ''}
>>>>>>> 0cf2898d9a728d7d68a97a417fb3c34e3e52c283
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

<<<<<<< HEAD
  const validPages = store.getters['appSettings/appConfig'] ?
    store.getters['appSettings/appConfig'].validAppViews : null;

  if (authRequired && !logged) {
    return next('/login');
  } else if (to.name && validPages && !validPages.includes(to.name)) {
    next(false);
  } else {
    next();
=======
  const validPages = store.getters['appSettings/appConfig'].validAppViews;

  if (authRequired && !logged) {
    return next('/login');
  } else if (to.name && !validPages.includes(to.name)) {
    next(false);
  } else {
     next();
>>>>>>> 0cf2898d9a728d7d68a97a417fb3c34e3e52c283
  }
});

export default router;
