import fs from "node:fs";

const FILENAME = ".env.json";

interface IJsonENV {
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
    console.log(value);
    jsonEnv = JSON.parse(value);

    if (!jsonEnv.APP_API_KEY) {
      console.error("APP_API_KEY not found");
      process.exit(10);
    }

    if (!Array.isArray(jsonEnv.APP_CHANNELS) || !jsonEnv.APP_CHANNELS.length) {
      console.error("APP_CHANNELS is empty");
      process.exit(11);
    }

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
