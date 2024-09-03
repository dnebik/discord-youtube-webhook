import { axiosInstance } from "./api";
import { readId, saveId } from "./store";

export const getVideoLink = (videoId: string) =>
  `https://www.youtube.com/watch?v=${videoId}`;

async function getChannelInfo(channelName: string) {
  const response = await axiosInstance.get("/search", {
    params: {
      q: channelName,
      part: "snippet",
      type: "channel",
    },
  });

  const items = response.data.items;
  if (items.length === 0) throw new Error("Channel not found");
  const closest = items[0];
  if (closest.snippet.title.toLowerCase() !== channelName.toLowerCase())
    throw new Error("Channel not found");

  return closest.snippet;
}

async function getUploadPlaylistId(channelId: string) {
  const url = `https://www.googleapis.com/youtube/v3/channels`;
  const response = await axiosInstance.get(url, {
    params: {
      part: "contentDetails",
      id: channelId,
    },
  });

  return response.data.items[0].contentDetails.relatedPlaylists.uploads;
}

async function getLastChannelVideos(
  channelPlaylistId: string,
  { count = 1, pageToken = undefined } = {},
) {
  const response = await axiosInstance.get("/playlistItems", {
    params: {
      part: "snippet, id",
      order: "date",
      maxResults: count,
      playlistId: channelPlaylistId,
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

interface IUseYoutubeChannelWatcherOptions {
  onNewVideosAdded?: (videoIds: string[], context) => void;
}

export function useYoutubeChannelWatcher(
  channelName: string,
  { onNewVideosAdded = undefined }: IUseYoutubeChannelWatcherOptions = {},
) {
  let channelInfo;
  let channelPlaylistId;
  let interval;
  let isStopped = false;

  async function getNewVideos() {
    const lastVideoFromChannel = (await getLastChannelVideos(channelPlaylistId))
      .ids[0];

    const lastVideoId = readId(channelName);
    console.log("Last video id:", lastVideoId);

    if (!lastVideoId) {
      saveId(channelName, lastVideoFromChannel);
      return null;
    }
    if (lastVideoId === lastVideoFromChannel) return null;

    const newVideos = [];
    let lastNextPageToken = null;

    async function getAllNewVideos() {
      const lastVidsData = await getLastChannelVideos(channelPlaylistId, {
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

    saveId(channelName, newVideos[0]);
    console.log("Saved id:", newVideos[0]);

    return newVideos;
  }

  async function worker() {
    console.log(`Checking for new videos from channel ${channelName}...`);
    try {
      const list = await getNewVideos();
      if (list && list.length > 0) {
        console.log(`Found ${list.length} new videos`);
        if (onNewVideosAdded) onNewVideosAdded(list, { channel: channelInfo });
      } else {
        console.log("No new videos found");
      }
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }

  function stopWatch() {
    clearInterval(interval);
    isStopped = true;
  }

  // Запуск
  getChannelInfo(channelName)
    .then((result) => {
      channelInfo = result;
      return getUploadPlaylistId(channelInfo.channelId);
    })
    .then((result) => {
      channelPlaylistId = result;

      // Не запускать если была совершена остановка до запуска
      if (isStopped) return;

      interval = setInterval(worker, 0.5 * 60 * 60 * 1000);
      worker();
    })
    .catch((err) => {
      console.error(err);
      console.info(
        `Не удалось начать отслеживание новых видео для канала ${channelName}`,
      );
    });

  return {
    stop: stopWatch,
  };
}
