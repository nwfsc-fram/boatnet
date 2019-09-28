import Vue from 'vue';
import Router from 'vue-router';
// import DefaultLayout from './layouts/Default.vue';
// import Trips from './views/Trips.vue';
// import TripDetails from './views/TripDetails.vue';
// import Login from './views/Login.vue';
// import Hauls from './views/Hauls.vue';
// import Settings from './views/Settings.vue';
import { config } from './configs/ashopConfig';

import { authService } from '@boatnet/bn-auth';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  // routes: [
  //   {
  //     path: '/login',
  //     component: Login
  //   },
  //   {
  //     path: '/',
  //     component: DefaultLayout,
  //     children: [
  //       {
  //         path: '',
  //         name: 'trips',
  //         component: Trips,
  //         meta: {
  //           breadcrumb: [
  //             { name: 'Trip'}
  //           ]
  //         }
  //       },
  //       {
  //         path: '/settings',
  //         name: 'settings',
  //         component: Settings
  //       },
  //       {
  //         path: '/tripdetails/:tripNum',
  //         name: 'tripdetails',
  //         component: TripDetails,
  //         props: (route) => ({ tripNum: Number(route.params.tripNum) }),
  //         meta: {
  //           breadcrumb: [
  //             { name: 'Trip', link: '' },
  //             { name: 'tripIdPlaceholder', link: ''}
  //           ]
  //         }
  //       },
  //       {
  //         path: '/hauls',
  //         name: 'Hauls',
  //         component: Hauls,
  //         meta: {
  //           breadcrumb: [
  //             { name: 'Trip', link: '' },
  //             { name: 'tripIdPlaceholder', link: ''},
  //             { name: 'Hauls', link: ''}
  //           ]
  //         }
  //       }
  //     ]
  //   }
  // ]
  routes: config.routes
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
