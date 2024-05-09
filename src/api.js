import axios from 'axios';
import 'dotenv/config'

if (!process.env.APP_API_KEY) {
  throw new Error('APP_API_KEY is not defined')
}

export const axiosInstance = axios.create({
  baseURL: 'https://content-youtube.googleapis.com/youtube/v3',
  params: {
    key: process.env.APP_API_KEY,
  },
});
