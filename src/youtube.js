import { axiosInstance } from "./api.js";
import { readId, saveId } from "./store.js";

const channelName = process.env.APP_CHANNEL_NAME;
let channelInfo = null;

export const getVideoLink = (videoId) =>
  `https://www.youtube.com/watch?v=${videoId}`;

export function getChannelInfo() {
  return channelInfo;
}

export async function getChannelId(username) {
  if (channelInfo) return channelInfo.channelId;

  const response = await axiosInstance.get("/search", {
    params: {
      q: username,
      part: "snippet",
      type: "channel",
    },
  });

  const items = response.data.items;
  if (items.length === 0) throw new Error("Channel not found");
  const closest = items[0];
  if (closest.snippet.title.toLowerCase() !== username.toLowerCase())
    throw new Error("Channel not found");

  channelInfo = closest.snippet;

  return closest.snippet.channelId;
}

export async function getChannelVideos(channelId) {
  const response = await axiosInstance.get("/search", {
    params: {
      channelId: channelId,
      part: "snippet, id",
      order: "date",
    },
  });
  console.log(
    "Fetched videos:",
    response.data.items.map((v) => v.id.videoId),
  );
  return response.data.items;
}

export async function getNewVideos() {
  const channelId = await getChannelId(channelName);
  const videos = await getChannelVideos(channelId);
  const lastVideoId = readId();
  const newVideos = [];

  if (lastVideoId) {
    for (const video of videos) {
      if (video.id.videoId !== lastVideoId) newVideos.push(video);
      else break;
    }
  }

  saveId(videos[0].id.videoId);

  return newVideos;
}
