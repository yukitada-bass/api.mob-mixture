import * as line from "@line/bot-sdk";
import dotenv from "dotenv";
dotenv.config();

export const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

export const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
});

export { line };