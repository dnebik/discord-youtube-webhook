import { axiosInstance } from "./api";
import retry from "async-retry";

export function makeWebhookClient(url) {
  function sendMessage(payload) {
    return retry(() => axiosInstance.post(url, payload)).catch((reason) =>
      console.error(reason?.message || "error"),
    );
  }

  return {
    sendMessage,
  };
}
