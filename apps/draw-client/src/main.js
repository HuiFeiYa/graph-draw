import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';  // 引入全局样式
import './assets/css/app.scss';
const app = createApp(App)
app.use(router);
app.use(ElementPlus);
app.mount("#app");
