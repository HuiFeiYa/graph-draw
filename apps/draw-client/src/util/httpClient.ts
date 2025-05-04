import axios from "axios";
const MODEL_SERVER_URL = "http://localhost:8003";
const httpConfig = {
  baseURL: MODEL_SERVER_URL,
  commonHeaders: {},
  postHeaders: {},
  getHeaders: {},
  requestInterceptors: [
    function setTip(config: any) {
      config.retryCount = 0;
      config.maxRetries = 3;
      return config;
    },
  ],
  responseInterceptors: [
    function tip(response: any) {
      return response;
    },
  ],
};

export class HttpClient {
  axios = axios.create({
    withCredentials: false,
  });
  constructor() {
    setupAxios(httpConfig, this.axios);
  }
  post<T>(url:string, data?:Object, config?:Object): Promise<T> {
    return this.axios.post(url, data, config);
  }
  get<T>(url:string, params?:Object, config?:Object): Promise<T> {
    return this.axios.get(url, { params, ...config });
  }
}
export const setupAxios = (
  {
    baseURL,
    commonHeaders,
    postHeaders,
    getHeaders,
    requestInterceptors,
    responseInterceptors,
  }:any,
  axiosInstance:any
) => {
  axiosInstance.defaults.baseURL = baseURL;
  commonHeaders &&
    (axiosInstance.defaults.headers.common = {
      ...axiosInstance.defaults.headers.common,
      ...commonHeaders,
    });
  postHeaders &&
    (axiosInstance.defaults.headers.post = {
      ...axiosInstance.defaults.headers.post,
      ...postHeaders,
    });
  getHeaders &&
    (axiosInstance.defaults.headers.get = {
      ...axiosInstance.defaults.headers.post,
      ...getHeaders,
    });
  requestInterceptors.reverse();
  requestInterceptors.forEach((interceptor: any) => {
    axiosInstance.interceptors.request.use(interceptor, (err: any) => {
      throw err;
    });
  });
  responseInterceptors.forEach((interceptor: any) => {
    axiosInstance.interceptors.response.use(interceptor, async (err: any) => {
      const config = err.config;
      if (!config || !config.retryCount || config.retryCount >= config.maxRetries) {
        throw err;
      }
      config.retryCount++;
      const retryDelay = config.retryCount * 1000;
      console.log(`请求失败，${config.retryCount}秒后重试...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return axiosInstance(config);
    });
  });
};

export const httpClient = new HttpClient();
