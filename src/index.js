import { getChannelInfo, getNewVideos, getVideoLink } from "./youtube.js";
import { sendMessage } from "./discord.js";

const requiredEnvVars = [
  "APP_API_KEY",
  "APP_CHANNEL_NAME",
  "APP_DISCORD_WEBHOOK_URL",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(new Error(`${varName} is not defined`));
    process.exit(1);
  }
});

console.log("Starting...");

async function worker() {
  console.log("Checking for new videos...");
  try {
    const list = await getNewVideos();
    if (list && list.length > 0) {
      console.log(`Found ${list.length} new videos`);
      const channelInfo = getChannelInfo();
      list.forEach((videoId) => {
        sendMessage({
          content: getVideoLink(videoId),
          username: channelInfo.title,
          avatarURL: channelInfo.thumbnails.default.url,
        });
      });
    } else {
      console.log("No new videos found");
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

setInterval(worker, 1.5 * 60 * 60 * 1000);
worker();
