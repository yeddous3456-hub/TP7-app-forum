// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/loginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/events',
    name: 'events',
    component: () => import('@/views/EventsView.vue'),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Garde de navigation
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Initialiser l'auth si pas encore fait
  if (authStore.loading) {
    authStore.init();
  }

  if (to.meta.requiresAuth && !authStore.user) {
    next('/login');
  } else if (to.meta.requiresGuest && authStore.user) {
    next('/events');
  } else {
    next();
  }
});

export default router;
