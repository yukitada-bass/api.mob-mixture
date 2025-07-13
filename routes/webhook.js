import express from "express";
import { config, client, line } from "../lib/line.js";
import handleImageMessage from "./events/handleImageMessage.js";
import handleTextMessage from "./events/handleTextMessage.js";
import handlePostback from "./events/handlePostback.js";

const router = express.Router();

router.post("/", line.middleware(config), async (req, res) => {
  const event = req.body.events[0];
  console.log(event);

  // リプライトークン
  const { replyToken } = event;

  switch (event?.type) {
    case "message":
      if (event.message.type === "text") {
        const userMessage = event.message.text;
        await handleTextMessage(replyToken, userMessage);
      }
      if (event.message.type === "image") {
        const imageId = event.message.id;
        const groupId = event.source.groupId;
        const res = await handleImageMessage(replyToken, imageId, groupId);
      }
      break;
    case "postback":
      const userId = event.source.userId;
      const data = event.postback.data;
      await handlePostback(replyToken, userId, data);
      break;
    default:
      return res.status(200).end();
  }
});

export default router;
