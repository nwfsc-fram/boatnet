import Vue from 'vue';
import Router from 'vue-router';
import DefaultLayout from './layouts/Default.vue';
import Home from './views/Home.vue';
import About from './views/About.vue';
import Debriefer from './views/Debriefer.vue';
import Trips from './views/Trips.vue';
import TripDetails from './views/TripDetails.vue';
import Permits from './views/Permits.vue';
import PermitDetails from './views/PermitDetails.vue';
import OTSManagement from './views/OTSManagement.vue';
import OtsTargetDetail from './views/OtsTargetDetail.vue';
import OTSManagementRedo from './views/OTSManagementRedo.vue';
import OTSDashboard from './views/OTSDashboard.vue';
import ManageUsers from './views/ManageUsers.vue';
import UserDetails from './views/UserDetails.vue';
import UserConfig from './views/UserConfig.vue';
import LogBookCapture from './views/LogBookCapture.vue';
import Login from './views/Login.vue';
import EMEFPManagement from './views/EMEFPManagement.vue';
import EMEFPDetails from './views/EMEFPDetails.vue';

import { authService } from '@boatnet/bn-auth';

Vue.use(Router);

// export default new Router({

//   routes: [
//     {
//       path: '/',
//       component: DefaultLayout,
//       children: [
//         { path: '', name: 'Home', component: Home },
//         { path: '/about', name: 'About', component: About },
//         { path: '/trips', name: 'Trips', component: Trips},
//         { path: '/trips/:id', name: 'Trip Detail', component: TripDetails },
//         { path: '/debriefer', redirect: '' },
//         { path: '/permits', name: 'Permits', component: Permits},
//         { path: '/permits/:id', name: 'Permit Details', component: PermitDetails },
//         { path: '/ots-management', name: 'OTS Management', component: OTSManagement },
//         { path: 'user-config', name: 'User Config', component: UserConfig },
//         { path: '/manage-users', name: 'Manage Users', component: ManageUsers },
//         { path: '/users/:id', name: 'User Details', component: UserDetails},
//         { path: '/log-book-capture', name: 'Log Book Capture', component: LogBookCapture }
//       ]
//     }
//   ],
//   mode: 'history'
// });

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
        { path: '', name: 'Home', component: Home },
        { path: '/about', name: 'About', component: About },
        { path: '/trips', name: 'Trips', component: Trips},
        { path: '/trips/:id', name: 'Trip Detail', component: TripDetails },
        { path: '/debriefer', name: 'Debriefer', component: Debriefer},
        { path: '/permits', name: 'Permits', component: Permits},
        { path: '/permits/:id', name: 'Permit Details', component: PermitDetails },
        { path: '/ots-management', name: 'OTS Management', component: OTSManagementRedo },
        // { path: '/ots-management/:id', name: 'OTS Management', component: OtsTargetDetail },
        { path: 'ots-target-detail', name: 'OTS Target Detail', component: OtsTargetDetail },
        { path: 'ots-target-detail/:id', name: 'OTS Target Detail', component: OtsTargetDetail },
        { path: '/ots-dashboard', name: 'OTS Dashboard', component: OTSDashboard },
        { path: 'user-config', name: 'User Config', component: UserConfig },
        { path: '/manage-users', name: 'Manage Users', component: ManageUsers },
        { path: '/users/:id', name: 'User Details', component: UserDetails},
        { path: '/log-book-capture', name: 'Log Book Capture', component: LogBookCapture },
        { path: '/em-efp-management', name: 'EM EFP Management', component: EMEFPManagement },
        {path: '/em-efp-details/:id', name: 'EM EFP Details', component: EMEFPDetails}
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
