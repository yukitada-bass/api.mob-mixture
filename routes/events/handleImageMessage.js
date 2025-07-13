import { client } from "../../lib/line.js";
import { getImageUrl } from "../../functions/getImageUrl.js";
import { detectTextFromImage } from "../../functions/detectTextFromImage.js";
import { createCalendar } from "../../functions/googleCalendar.js";

export default async function handleImageMessage(replyToken, imageId, groupId) {
  if (groupId === process.env.LINE_GROUP_ID) {
    const base64Data = await getImageUrl(
      imageId,
      process.env.LINE_ACCESS_TOKEN
    );
    const detectText = await detectTextFromImage(base64Data);

    // createCalendar関数に渡す引数の初期化
    let obj = {};

    if (detectText.includes(process.env.studioA)) {
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

    if (detectText.includes(process.env.studioB)) {
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
        replyToken,
        messages: [
          {
            type: "text",
            text: res,
          },
        ],
      });
    }
  }
}
