import Vue from 'vue';
import Router from 'vue-router';
import DefaultLayout from './layouts/Default.vue';
import Home from './views/Home.vue';
import Settings from './views/Settings.vue';
import Login from './views/Login.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: Home
        },
        {
          path: '/settings',
          name: 'settings',
          component: Settings
        },
        {
          path: '/login',
          name: 'login',
          component: Login
        }
      ]
    }
  ]
});
