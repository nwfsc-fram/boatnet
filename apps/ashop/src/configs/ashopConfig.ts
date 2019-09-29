import Login from '../views/Login.vue';
import DefaultLayout from '../layouts/Default.vue';
import TripDetails from '../views/TripDetails.vue';
import Hauls from '../views/Hauls.vue';
import Settings from '../views/Settings.vue';
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
                { name: 'tripIdPlaceholder', link: ''}
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
                { name: 'tripIdPlaceholder', link: ''},
                { name: 'Hauls', link: ''}
              ]
            }
          }
        ]
      }
    ]
};
