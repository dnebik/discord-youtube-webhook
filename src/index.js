import { getChannelInfo, getNewVideos, getVideoLink } from "./youtube.js";
import { sendMessage } from "./discord.js";

const requiredEnvVars = ["APP_API_KEY", "APP_CHANNEL_NAME", "APP_DISCORD_WEBHOOK_URL"];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(new Error(`${varName} is not defined`));
    process.exit(1);
  }
});

async function worker() {
  try {
    const list = await getNewVideos();
    if (list.length > 0) {
      const channelInfo = getChannelInfo();
      list.forEach((video) => {
        sendMessage({
          content: getVideoLink(video.id.videoId),
          username: channelInfo.title,
          avatarURL: channelInfo.thumbnails.default.url,
        });
      });
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

setInterval(worker, 5 * 60 * 1000);
worker();
