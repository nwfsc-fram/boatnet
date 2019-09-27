import Vue from 'vue';
import Router from 'vue-router';
import { config } from './configs/ashopConfig';

import { authService } from '@boatnet/bn-auth';

Vue.use(Router);

const router = new Router({
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
