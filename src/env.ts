import fs from "node:fs";
import * as process from "node:process";

const FILENAME = ".env.json";

interface IJsonENV {
  APP_PROXY_HOST: null | string;
  APP_PROXY_PORT: null | number;
  APP_API_KEY: string;
  APP_CHANNELS: {
    NAME: string;
    DISCORD_WEBHOOK_URL: string;
  }[];
}

let jsonEnv: IJsonENV;

export function getEnvJson(): IJsonENV {
  if (jsonEnv) return jsonEnv;
  try {
    const value = fs.readFileSync(FILENAME, "utf8");
    jsonEnv = JSON.parse(value);

    if (!jsonEnv.APP_API_KEY) {
      console.error("APP_API_KEY not found");
      process.exit(10);
    }

    if (!Array.isArray(jsonEnv.APP_CHANNELS) || !jsonEnv.APP_CHANNELS.length) {
      console.error("APP_CHANNELS is empty");
      process.exit(11);
    }

    jsonEnv.APP_CHANNELS.forEach((entry) => {
      if (!entry.NAME) {
        console.error("NAME is not defined");
        process.exit(13);
      }
      if (!entry.DISCORD_WEBHOOK_URL) {
        console.error("DISCORD_WEBHOOK_URL is not defined");
        process.exit(14);
      }
    });

    return jsonEnv;
  } catch (e) {
    console.error(e);
    console.error("env not found");
    process.exit(12);
  }
}

export function getAppApiKey() {
  const json = getEnvJson();
  return json.APP_API_KEY;
}

export function getAppChannels() {
  const json = getEnvJson();
  return json.APP_CHANNELS;
}
