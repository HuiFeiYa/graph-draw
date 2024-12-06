import { createRouter, createWebHashHistory } from 'vue-router';

// 定义路由规则
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('../views/Test.vue'),
  },
];

// 创建路由器实例
const router = createRouter({
  history: createWebHashHistory(),  // 使用 HTML5 历史模式
  routes,  // 传递路由规则
});

export default router;