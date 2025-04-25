import { createRouter, createWebHashHistory } from 'vue-router';

// 定义路由规则
const routes = [
  {
    path: "/",
    redirect: '/layout/project-list'
  },
  {
    path: '/layout',
    component: () => import('../components/Layout.vue'),
    name: "layout",
    children: [
      {
        path: 'project-list',
        name: 'ProjectList',
        component: () => import('../views/ProjectList.vue')
      },
      {
        path: 'create-project',
        name: 'CreateProject',
        component: () => import('../views/CreateProject.vue'),
      },
      {
        path: 'flow',
        name: 'flow',
        component: () => import('../views/Home.vue'),
      },
      {
        path: 'mindMap',
        name: 'mindMap',
        component: () => import('../views/MindMap.vue')
      },
      {
        path: 'station',
        name: 'station',
        component: () => import('../views/Station.vue')
      },
      {
        path: '/test',
        name: 'Test',
        component: () => import('../views/Station.vue'),
      },
      {
        path: 'project-list',
        name: 'ProjectList',
        component: () => import('../views/ProjectList.vue')
      }
    ]
  },
  
];

// 创建路由器实例
const router = createRouter({
  history: createWebHashHistory(),  // 使用 HTML5 历史模式
  routes,  // 传递路由规则
});
//@ts-ignore
window.router = router;
export default router;