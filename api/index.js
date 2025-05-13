import * as line from "@line/bot-sdk";
import express from "express";
import dotenv from "dotenv";
import { getImageUrl } from "../functions/getImageUrl.js";
import { detectTextFromImage } from "../functions/detectTextFromImage.js";
import { getCalendar, createCalendar } from "../functions/googleCalendar.js";
dotenv.config();

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_ACCESS_TOKEN,
});

const app = express();

app.get("/", (req, res) => res.send("Express on Vercel"));

app.post("/", line.middleware(config), async (req, res) => {
  const event = req.body.events[0];
  console.log(event);
  // テスト用
  if (event === undefined) return res.status(200).end();
  // テキストメッセージ
  if (event.type === "message" && event.message.type === "text") {
    const userMessage = event.message.text;
    if (userMessage.includes("#スタジオ")) {
      const replyText = await getCalendar();
      await client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: "text",
            text: replyText,
          },
        ],
      });
    }
  }
  // 画像メッセージ
  if (
    event.type === "message" &&
    event.message.type === "image" &&
    event.source.groupId === process.env.LINE_GROUP_ID
  ) {
    const imageId = event.message.id;
    const base64Data = await getImageUrl(
      imageId,
      process.env.LINE_ACCESS_TOKEN
    );
    const detectText = await detectTextFromImage(base64Data);
    console.log(detectText);
    // createCalendar関数に渡す引数の初期化
    let obj = {};

    if (detectText.includes("トリゴロ")) {
      // 日付パース
      const dateMatch = detectText.match(/(\d{4})年(\d{2})月(\d{2})日/);
      const year = dateMatch[1];
      const month = dateMatch[2];
      const day = dateMatch[3];

      // 時刻パース
      const timeMatch = detectText.match(/(\d{2}):(\d{2}) ?(\d{2}):(\d{2})/);
      const startHour = timeMatch[1];
      const startMinute = timeMatch[2];
      const endHour = timeMatch[3];
      const endMinute = timeMatch[4];

      // ISO形式で文字列を組み立て
      const startISO = `${year}-${month}-${day}T${startHour}:${startMinute}:00+09:00`;
      const endISO = `${year}-${month}-${day}T${endHour}:${endMinute}:00+09:00`;

      obj = {
        summary: "トリゴロ",
        start: startISO,
        end: endISO,
      };
    }

    if (detectText.includes("shibutani") || detectText.includes("5850")) {
      // 日時パース
      const match = detectText.match(
        /(\d{4})年(\d{1,2})月(\d{1,2})日 \([^\)]+\) (\d{2}):(\d{2}) ~/
      );
      const year = match[1];
      const month = String(match[2]).padStart(2, "0"); // 月を2桁に
      const day = String(match[3]).padStart(2, "0"); // 日を2桁に
      const hour = match[4];
      const minute = match[5];

      const endHour = parseInt(match[4], 10) + 1;

      // ISO形式で文字列を組み立て
      const startISO = `${year}-${month}-${day}T${hour}:${minute}:00+09:00`;
      const endISO = `${year}-${month}-${day}T${endHour}:${minute}:00+09:00`;

      obj = {
        summary: "アプローズ",
        start: startISO,
        end: endISO,
      };
    }
    // オブジェクトが空かどうか
    if (Object.keys(obj).length > 0) {
      const res = await createCalendar(obj);
      await client.replyMessage({
        replyToken: event.replyToken,
        messages: [
          {
            type: "text",
            text: res,
          },
        ],
      });
    }
  }
  res.status(200).end();
});

const port = 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

export default app;
