import axios from "axios";
import { getAppApiKey, getEnvJson } from "./env";

export const axiosInstance = axios.create({
  baseURL: "https://content-youtube.googleapis.com/youtube/v3",
  params: {
    key: getAppApiKey(),
  },
});

const env = getEnvJson();
if (env.APP_PROXY_HOST && env.APP_PROXY_PORT) {
  axiosInstance.defaults.proxy = {
    host: env.APP_PROXY_HOST,
    port: env.APP_PROXY_PORT,
    protocol: "http",
  };
}
