import { WebhookClient } from "discord.js";

export function makeWebhookClient(url) {
  const webhook = new WebhookClient({ url });

  function sendMessage(payload) {
    webhook.send(payload);
  }

  return {
    sendMessage,
  };
}
