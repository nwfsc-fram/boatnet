import Vue from 'vue';
import Router from 'vue-router';
import DefaultLayout from './layouts/Default.vue';
import Home from './views/Home.vue';
import About from './views/About.vue';
import Trips from './views/Trips.vue';
import TripDetail from './views/TripDetail.vue';
import Permits from './views/Permits.vue';
import OTSManagement from './views/OTSManagement.vue';
import UserConfig from './views/UserConfig.vue';
import ManageUsers from './views/ManageUsers.vue';
import PermitDetails from './views/PermitDetails.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        { path: '', name: 'Home', component: Home },
        { path: '/about', name: 'About', component: About },
        { path: '/trips', name: 'Trips', component: Trips},
        { path: '/trips/:id', name: 'Trip Detail', component: TripDetail },
        { path: '/debriefer', redirect: '' },
        { path: '/permits', name: 'Permits', component: Permits},
        { path: 'permits/:id', name: 'Permit Details', component: PermitDetails },
        { path: '/ots-management', name: 'OTS Management', component: OTSManagement },
        { path: 'user-config', name: 'User Config', component: UserConfig },        
        { path: '/manage-users', name: 'Manage Users', component: ManageUsers },
      ]
    }
  ],
  mode: 'history'
});
