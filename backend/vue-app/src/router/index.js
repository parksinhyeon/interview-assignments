// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import SignUpForm from '../components/SignUpForm.vue';
import MainPage from '../components/MainPage.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginForm
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUpForm
  },
  {
    path: '/',
    name: 'MainPage',
    component: MainPage
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
