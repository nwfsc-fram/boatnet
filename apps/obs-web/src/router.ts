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
import OtsTargetDetail from './views/OtsTargetDetail.vue';
import OTSManagement from './views/OTSManagement.vue';
import ManageUsers from './views/ManageUsers.vue';
import UserDetails from './views/UserDetails.vue';
import UserConfig from './views/UserConfig.vue';
import LogBookCapture from './views/LogBookCapture.vue';
import Login from './views/Login.vue';
import EMEFPManagement from './views/EMEFPManagement.vue';
import EMEFPDetails from './views/EMEFPDetails.vue';
import ObserverAssignment from './views/ObserverAssignment.vue';
import ObserverAssignmentDetail from './views/ObserverAssignmentDetail.vue';
import ObserverAvailability from './views/ObserverAvailability.vue';
import ActivityDetail from './views/ActivityDetail.vue';
import Vessels from './views/Vessels.vue';
import VesselDetails from './views/VesselDetails.vue';

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
        { path: '/debriefer', name: 'Debriefer', component: Debriefer ,
          beforeEnter: function(to, from, next) {
            if (isAuthorized(['development_staff', 'staff', 'data_steward',
                              'program_manager', 'coordinator', 'debriefer']))
              { return next(); } else { return next('/login'); }
        } },
        { path: '/permits', name: 'Permits', component: Permits,
          beforeEnter: function(to, from, next) {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']))
              { return next(); } else { return next('/login'); }
        } },
        { path: '/permits/:id', name: 'Permit Details', component: PermitDetails,
          beforeEnter: function(to, from, next) {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']))
              { return next(); } else { return next('/login'); }
        } },
        { path: '/ots-management', name: 'OTS Management', component: OTSManagement,
          beforeEnter: function(to, from, next) {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']))
              { return next(); } else { return next('/login'); }
        } },
        { path: 'ots-target-detail', name: 'OTS Target Detail', component: OtsTargetDetail,
          beforeEnter: function(to, from, next) {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']))
              { return next(); } else { return next('/login'); }
        } },
        { path: 'ots-target-detail/:id', name: 'OTS Target Detail', component: OtsTargetDetail,
          beforeEnter: function(to, from, next) {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']))
              { return next(); } else { return next('/login'); }
        } },
        { path: 'user-config', name: 'User Config', component: UserConfig },
        { path: '/manage-users', name: 'Manage Users', component: ManageUsers,
          beforeEnter: function(to, from, next) {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']))
              { return next(); } else { return next('/login'); }
        } },
        { path: '/users/:id', name: 'User Details', component: UserDetails,
        beforeEnter: function(to, from, next) {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']))
              { return next(); } else { return next('/login'); }
        } },
        { path: '/log-book-capture', name: 'Log Book Capture', component: LogBookCapture },
        { path: '/em-efp-management', name: 'EM EFP Management', component: EMEFPManagement,
          beforeEnter: function(to, from, next) {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']))
              { return next(); } else { return next('/login'); }
        } },
        { path: '/em-efp-details/:id', name: 'EM EFP Details', component: EMEFPDetails,
          beforeEnter: function(to, from, next) {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']))
              { return next(); } else { return next('/login'); }
        } },
        { path: '/observer-assignment', name: 'Observer Assignment', component: ObserverAssignment,
          beforeEnter: function(to, from, next) {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']))
              { return next(); } else { return next('/login'); }
        } },
        { path: '/observer-assignment-detail/:id', name: 'Observer Assignment Details',
        component: ObserverAssignmentDetail,
          beforeEnter: function(to, from, next) {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']))
              { return next(); } else { return next('/login'); }
        } },
        { path: '/observer-availability', name: 'Observer Availability', component: ObserverAvailability},
        { path: '/activity-detail', name: 'Activity Detail', component: ActivityDetail },
        { path: '/vessels', name: 'Vessels', component: Vessels,
          beforeEnter: function(to, from, next) {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']))
              { return next(); } else { return next('/login'); }
        } },
        { path: '/vessels/:id', name: 'Vessel Details', component: VesselDetails,
          beforeEnter: function(to, from, next) {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator']))
              { return next(); } else { return next('/login'); }
        } },
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

function isAuthorized(authorizedRoles: string[]) {
  for (const role of authorizedRoles) {
    if (authService.getCurrentUser()!.roles.includes(role)) {
      return true;
    }
  }
  return false;
}

export default router;
