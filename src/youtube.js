import { axiosInstance } from "./api.js";
import { readId, saveId } from "./store.js";

const channelName = process.env.APP_CHANNEL_NAME;
let channelInfo;
let channelPlaylistId;

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

async function getUploadPlaylistId() {
  if (channelPlaylistId) return channelPlaylistId;
  const channelId = await getChannelId(channelName);

  const url = `https://www.googleapis.com/youtube/v3/channels`;
  const response = await axiosInstance.get(url, {
    params: {
      part: "contentDetails",
      id: channelId,
    },
  });

  return response.data.items[0].contentDetails.relatedPlaylists.uploads;
}

export async function getLastChannelVideos({
  count = 1,
  pageToken = undefined,
} = {}) {
  const playListId = await getUploadPlaylistId();

  const response = await axiosInstance.get("/playlistItems", {
    params: {
      part: "snippet, id",
      order: "date",
      maxResults: count,
      playlistId: playListId,
      pageToken,
    },
  });
  const ids = response.data.items.map(
    (item) => item.snippet.resourceId.videoId,
  );
  // console.log("Fetched channel:", response.data.items);
  console.log("Fetched videos:", ids);
  return {
    ids,
    nextPageToken: response.data.nextPageToken,
  };
}

export async function getNewVideos() {
  const lastVideoFromChannel = (await getLastChannelVideos()).ids[0];

  const lastVideoId = readId();
  console.log("Last video id:", lastVideoId);

  if (!lastVideoId) return saveId(lastVideoFromChannel);
  if (lastVideoId === lastVideoFromChannel) return;

  const newVideos = [];
  let lastNextPageToken = null;

  async function getAllNewVideos() {
    const lastVidsData = await getLastChannelVideos({
      count: 5,
      pageToken: lastNextPageToken,
    });
    lastNextPageToken = lastVidsData.nextPageToken;
    let isFindLastVideo = false;

    for (const videoId of lastVidsData.ids) {
      if (videoId !== lastVideoId) newVideos.push(videoId);
      else {
        isFindLastVideo = true;
        break;
      }
    }

    if (!isFindLastVideo && lastNextPageToken) await getAllNewVideos();
  }
  await getAllNewVideos();
  console.log("newVideos:", newVideos);

  saveId(newVideos[0]);
  console.log("Saved id:", newVideos[0]);

  return newVideos;
}
