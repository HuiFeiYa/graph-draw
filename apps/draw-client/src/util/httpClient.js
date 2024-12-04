import axios from "axios";
const MODEL_SERVER_URL = "http://localhost:8003";
const httpConfig = {
  baseURL: MODEL_SERVER_URL,
  commonHeaders: {},
  postHeaders: {},
  getHeaders: {},
  requestInterceptors: [
    function setTip(config) {
      return config;
    },
  ],
  responseInterceptors: [
    function tip(response) {
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
  post(url, data, config) {
    return this.axios.post(url, data, config);
  }
  get(url, params, config) {
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
  },
  axiosInstance
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
  requestInterceptors.forEach((interceptor) => {
    axiosInstance.interceptors.request.use(interceptor, (err) => {
      throw err;
    });
  });
  responseInterceptors.forEach((interceptor) => {
    axiosInstance.interceptors.response.use(interceptor, (err) => {
      throw err;
    });
  });
};

export const httpClient = new HttpClient();
