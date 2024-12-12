import { createRouter, createWebHashHistory } from 'vue-router';

// 定义路由规则
const routes = [
  {
    path: "/",
    name: "index",
    redirect: "/layout/home",
  },
  {
    path: '/layout',
    component: () => import('../components/Layout.vue'),
    name: "layout",
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/Home.vue'),
      },
      {
        path: 'station',
        name: 'station',
        component: () => import('../views/Station.vue')
      },
      {
        path: '/test',
        name: 'Test',
        component: () => import('../views/Test.vue'),
      }
    ]
  },
  
];

// 创建路由器实例
const router = createRouter({
  history: createWebHashHistory(),  // 使用 HTML5 历史模式
  routes,  // 传递路由规则
});

export default router;