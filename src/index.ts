import { getVideoLink, useYoutubeChannelWatcher } from "./youtube";
import { makeWebhookClient } from "./discord";
import { getAppChannels } from "./env";

console.log("Starting...");

const channels = getAppChannels();

channels.forEach((channel) => {
  const { sendMessage } = makeWebhookClient(channel.DISCORD_WEBHOOK_URL);

  function handleNewVideos(list: string[], { channel }) {
    const sendRequest = (videoId) =>
      sendMessage({
        content: getVideoLink(videoId),
        username: channel.title,
        avatarURL: channel.thumbnails.default.url,
      });

    list.reduce(
      (promise, videoId) =>
        promise.catch(() => false).finally(() => sendRequest(videoId)),
      Promise.resolve(),
    );
  }

  useYoutubeChannelWatcher(channel.NAME, {
    onNewVideosAdded: handleNewVideos,
  });
});
