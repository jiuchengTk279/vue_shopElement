import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: () => import('../components/Login.vue')
    },
    {
      path: '/home',
      component: () => import('../components/Home.vue'),
      redirect: '/welcome',
      children: [
        {
          path: '/welcome',
          component: () => import('../components/Welcome.vue')
        },
        {
          path: '/users',
          component: () => import('../components/User/Users.vue')
        },
        {
          path: '/rights',
          component: () => import('../components/power/Rights.vue')
        },
        {
          path: '/roles',
          component: () => import('../components/power/Roles.vue')
        },
        {
          path: '/categories',
          component: () => import('../components/goods/Categories.vue')
        },
        {
          path: '/orders',
          component: () => import('../components/order/Order.vue')
        },
        {
          path: '/reports',
          component: () => import('../components/report/Report.vue')
        },
        {
          path: '/goods',
          component: () => import('../components/goods/List.vue')
        },
        {
          path: '/goods/addGoods',
          component: () => import('../components/goods/Add.vue')
        },
        {
          path: '/params',
          component: () => import('../components/goods/Params.vue')
        }
      ]
    }
  ]
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来的
  // next 是一个函数，表示放行
  // next() 放行  next('/login) 强制跳转到登录页
  // 如果用户访问的是登录页，直接放行
  if (to.path === '/login') return next()
  // 从sessionStorage中获取保存的token值
  const tokenStr = window.sessionStorage.getItem('token')
  // 如果token的值不存在，强制跳转到登录页
  if (!tokenStr) return next('/login')
  // 存在token，那么就放行
  next()
})

export default router
