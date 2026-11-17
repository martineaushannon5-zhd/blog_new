import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const About = () => import('../views/About.vue')
const Posts = () => import('../views/Posts.vue')
const PostDetail = () => import('../views/PostDetail.vue')
const Sponsor = () => import('../views/Sponsor.vue')
const Cooperation = () => import('../views/Cooperation.vue')
const AdminLogin = () => import('../views/admin/AdminLogin.vue')
const AdminDashboard = () => import('../views/admin/AdminDashboard.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/about',
      name: 'About',
      component: About
    },
    {
      path: '/posts',
      name: 'Posts',
      component: Posts
    },
    {
      path: '/posts/:id',
      name: 'PostDetail',
      component: PostDetail
    },
    {
      path: '/sponsor',
      name: 'Sponsor',
      component: Sponsor
    },
    {
      path: '/cooperation',
      name: 'Cooperation',
      component: Cooperation
    },
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: AdminLogin
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: AdminDashboard,
      meta: {
        requiresAuth: true
      }
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  const isAuthenticated = Boolean(localStorage.getItem('admin-token'))

  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      path: '/admin/login',
      query: {
        redirect: to.fullPath
      }
    }
  }

  if (to.path === '/admin/login' && isAuthenticated) {
    return '/admin'
  }
})

export default router
