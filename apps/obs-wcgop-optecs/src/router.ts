import Vue from 'vue';
import Router from 'vue-router';
import DefaultLayout from './layouts/Default.vue';
import Home from './views/Home.vue';
import Settings from './views/Settings.vue';
import Login from './views/Login.vue';
import Hauls from './views/Hauls.vue';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/login',
      component: Login,
    },
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
          path: '/hauls',
          name: 'hauls',
          component: Hauls
        }
        // },
        // {
        //   path: '/login',
        //   name: 'login',
        //   component: Login
        // }
      ]
    }, // otherwise redirect to home
    { path: '*', redirect: '/' }
  ]
});

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('user');

  if (authRequired && !loggedIn) {
    return next('/login');
  }
  next();
});

export default router;
