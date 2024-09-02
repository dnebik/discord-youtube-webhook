import axios from "axios";
import { getAppApiKey } from "./env";

export const axiosInstance = axios.create({
  baseURL: "https://content-youtube.googleapis.com/youtube/v3",
  params: {
    key: getAppApiKey(),
  },
});
