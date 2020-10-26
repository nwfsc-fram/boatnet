import Vue from 'vue';
import Router from 'vue-router';
import DefaultLayout from './layouts/Default.vue';
import PublicLayout from './layouts/Public.vue';
import AllTrips from './views/AllTrips.vue';
import Help from './views/Help.vue';
import Home from './views/Home.vue';
import LookupEditor from './views/LookupEditor.vue';
import Debriefer from './views/Debriefer.vue';
import DebrieferLayout from './views/DebrieferLayout.vue';
import DebrieferTableExpanded from './views/DebrieferTableExpanded.vue';
import Trips from './views/Trips.vue';
import TripDetails from './views/TripDetails.vue';
import Permits from './views/Permits.vue';
import PermitDetails from './views/PermitDetails.vue';
import Declarations from './views/Declarations.vue';
import AddDeclaration from './views/AddDeclaration.vue';
import DeclarationCart from './views/DeclarationCart.vue';
import DeclarationReceipt from './views/DeclarationReceipt.vue';
import OLEEFPManagement from './views/OLEEFPManagement.vue';
import OtsTargetDetail from './views/OtsTargetDetail.vue';
import OTSManagement from './views/OTSManagement.vue';
import ManageUsers from './views/ManageUsers.vue';
import UserDetails from './views/UserDetails.vue';
import UserConfig from './views/UserConfig.vue';
import LogMissingTrip from './views/LogMissingTrip.vue';
import Login from './views/Login.vue';
import EMEFPManagement from './views/EMEFPManagement.vue';
import EMEFPDetails from './views/EMEFPDetails.vue';
import EMDataCompare from './views/EMDataCompare.vue';
import EMTaskManagement from './views/EMTaskManagement.vue';
import EMRateManagement from './views/EMRateManagement.vue';
import ObserverAssignment from './views/ObserverAssignment.vue';
import ObserverAssignmentDetail from './views/ObserverAssignmentDetail.vue';
import ObserverAvailability from './views/ObserverAvailability.vue';
import ActivityDetail from './views/ActivityDetail.vue';
import Vessels from './views/Vessels.vue';
import VesselDetails from './views/VesselDetails.vue';
import ELogbook from './views/ELogbook.vue';
import CouchViews from './views/CouchViews.vue';
import OtsTrips from './views/OtsTrips.vue';
import OtsTripHistory from './views/OtsTripHistory.vue';
import ViewHauls from './views/ViewHauls.vue';
import ViewImage from './views/ViewImage.vue';
import RackBiospecimens from './views/RackBiospecimens.vue';
import ObserverDebrieferAssignment from './views/ObserverDebrieferAssignment.vue';
import MissedTripLog from './views/MissedTripLog.vue';
import EmExpansions from './views/EmExpansions.vue';
import EMApiPortal from './views/EMApiPortal.vue';
import EMReview from './views/EMReview.vue';

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
        { path: 'em-expansions', component: EmExpansions }, // temp - delete eventually
        { path: '', name: 'Home', component: Home },
        { path: '/lookup-editor', name: 'Lookup Editor', component: LookupEditor,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward',
              'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        { path: '/couch-views', name: 'Couch Views', component: CouchViews,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward',
              'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        { path: '/view-hauls', name: 'View Hauls', component: ViewHauls,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward',
              'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        { path: '/trips', name: 'Trips', component: Trips },
        { path: '/trips/:id', name: 'Trip Detail', component: TripDetails },
        { path: '/rack', name: 'Rack Biospecimens', component: RackBiospecimens },
        { path: '/assign', name: 'Observer Debriefer Assignment', component: ObserverDebrieferAssignment },
        {
          path: '/debriefer', name: 'Debriefer', component: DebrieferLayout,
        },
        {
          path: '/table/:tableType', name: 'Table', component: DebrieferTableExpanded,
          props: (route) => ({ tableType: String(route.params.tableType)})
        },
        {
          path: '/declarations', name: 'Declaration', component: Declarations
        },
        {
          path: '/new-declaration', name: 'New Declaration', component: AddDeclaration
        },
        {
          path: '/declaration-cart', name: 'Declaration Cart', component: DeclarationCart
        },
        {
          path: '/declaration-receipt', name: 'Declaration Receipt', component: DeclarationReceipt
        },
        {
          path: '/ole-efp-management', name: 'OLE EFP Management', component: OLEEFPManagement,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['enforcement'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/permits', name: 'Permits', component: Permits,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/permits/:id', name: 'Permit Details', component: PermitDetails,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/ots-management', name: 'OTS Management', component: OTSManagement,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/ots-target-detail', name: 'OTS Target Detail', component: OtsTargetDetail,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/ots-target-detail/:id', name: 'OTS Target Detail', component: OtsTargetDetail,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/ots-trips', name: 'OTS Trips', component: OtsTrips,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/ots-trip-history/:id', name: 'OTS Trip History', component: OtsTripHistory,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/missed-trips', name: 'Missed Trip Log', component: MissedTripLog,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        { path: '/user-config', name: 'User Config', component: UserConfig },
        {
          path: '/manage-users', name: 'Manage Users', component: ManageUsers,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/users/:id', name: 'User Details', component: UserDetails,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        { path: '/log-missing-trip', name: 'Log Missing Trip', component: LogMissingTrip },
        { path: '/e-logbook/:id', name: 'E Logbook', component: ELogbook,
        beforeEnter: (to, from, next) => {
          if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        { path: '/em-review/:id', name: 'EM Review', component: EMReview,
        beforeEnter: (to, from, next) => {
          if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/em-efp-management', name: 'EM EFP Management', component: EMEFPManagement,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/em-efp-details/:id', name: 'EM EFP Details', component: EMEFPDetails,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/em-data-compare/', name: 'EM Data Comparison', component: EMDataCompare,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/em-task-management/', name: 'EM Task Management', component: EMTaskManagement,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/em-api-portal/:id/:type', name: 'EM API Portal', component: EMApiPortal,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/em-api-portal/', name: 'EM API Portal', component: EMApiPortal,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/em-rate-management/', name: 'EM Rate Management', component: EMRateManagement,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/view-image/', name: 'View Image', component: ViewImage,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/all-trips', name: 'All Trips', component: AllTrips,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer', 'observer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/observer-assignment', name: 'Observer Assignment', component: ObserverAssignment,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/observer-assignment-detail/:id', name: 'Observer Assignment Details',
          component: ObserverAssignmentDetail,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        { path: '/observer-availability', name: 'Observer Availability', component: ObserverAvailability },
        { path: '/activity-detail', name: 'Activity Detail', component: ActivityDetail },
        {
          path: '/vessels', name: 'Vessels', component: Vessels,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        {
          path: '/vessels/:id', name: 'Vessel Details', component: VesselDetails,
          beforeEnter: (to, from, next) => {
            if (isAuthorized(['development_staff', 'staff', 'data_steward', 'program_manager', 'coordinator', 'debriefer'])) { return next(); } else { return next('/login'); }
          }
        },
        { path: '/help', name: 'Help', component: Help },
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

  window.onpopstate = (event: any) => {
    return next(router.currentRoute.path.replace(router.currentRoute.params.id, ''));
  };

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
