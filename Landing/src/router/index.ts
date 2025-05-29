// index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/components/ValidarCedula.vue')
    },
    {
      path: '/user',
      name: 'UserInfo',
      component: () => import('@/components/UserInfo.vue')
    },
    {
      path: '/register',
      name: 'RegisterForm',
      component: () => import('@/components/RegisterForm.vue')
    }

  ]
})

export default router