import Login from '../views/Login.vue';
import DefaultLayout from '../layouts/Default.vue';
import Trips from '../views/Trips.vue';

export const config = {
    login: {
        appName: 'ASHOP',
        statInfo: [
            {name: 'Last Software Update Date:', value: 'lastSoftwareUpdateDate'},
            {name: 'Last Login Date:', value: 'lastLoginDate'},
            {name: 'Quasar Version', value: 'quasarVersion'}
        ]
    },
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
                  { name: 'Trip'}
                ]
              }
            }
          ]
        }
      ]
};
