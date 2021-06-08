import Vue from 'vue'
import Router from 'vue-router'
import BaseLayout from './layout/BaseLayout'
Vue.use(Router)

const router = new Router({
  mode: 'history',
  linkExactActiveClass: 'active',
  routes: [
    {
      path: '/',
      redirect: 'devices',
      component: BaseLayout,
      children: [
        {
          path: '/devices',
          name: 'devices',
          component: () => import('./views/Devices.vue'),
          meta: {
            forGuest: true
          }
        },
          {
              path: '/devices/:deviceUUID',
              name: 'devicesDetails',
              component: () => import('./views/DeviceDetails.vue'),
              meta: {
                  forGuest: true
              }
          },
          {
              path: '/twin/:twinUUID',
              name: 'twinDetails',
              component: () => import('./views/TwinDetails.vue'),
              meta: {
                  forGuest: true
              }
          },
        {
          path: '/charts',
          name: 'charts',
          component: () => import('./views/Charts.vue'),
          meta: {
            forGuest: true
          }
        }
      ]
    }
  ]
})

export default router
