import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index";
import ElementPlus from 'element-plus';
import { createPinia } from "pinia";
import 'element-plus/dist/index.css';  // 引入全局样式
import './assets/css/app.scss';
import "./socket/SocketService";
const app = createApp(App)
const pinia = createPinia()
// @ts-ignore
window.router = router;
app.use(router);
app.use(pinia)
app.use(ElementPlus);
app.mount("#app");
