import { WebhookClient } from "discord.js";

const url = process.env.APP_DISCORD_WEBHOOK_URL;

const webhook = new WebhookClient({ url });

export function sendMessage(payload) {
  webhook.send(payload);
}
