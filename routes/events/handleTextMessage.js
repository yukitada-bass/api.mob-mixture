import { client } from "../../lib/line.js";
import { getLiveSchedules } from "../../functions/getLiveSchedules.js";
import { getCalendar } from "../../functions/googleCalendar.js";
import { selectSchedule, selectUserState } from "../../lib/db.js";

export default async function handleTextMessage(replyToken,userMessage) {
  if (userMessage.includes("取り置きリスト")) {
    const rows = selectSchedule.all();
    const uniqueTickets = [...new Set(rows.map((r) => r.tickets))];
    const items = uniqueTickets.map((ticket) => ({
      type: "action",
      action: {
        type: "postback",
        label: ticket,
        data: `select=${ticket}`,
        displayText: ticket,
      },
    }));
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: "text",
          text: "公演名を選んでください",
          quickReply: {
            items,
          },
        },
      ],
    });
  }
  if (userMessage.includes("スタジオいつ")) {
    const replyText = await getCalendar();
    replyText &&
      (await client.replyMessage({
        replyToken,
        messages: [
          {
            type: "text",
            text: replyText,
          },
        ],
      }));
  }
  if (userMessage === "#ライブスケジュール") {
    const flexMessage = await getLiveSchedules();
    flexMessage &&
      (await client.replyMessage({
        replyToken,
        messages: [
          {
            type: "flex",
            altText: "ライブスケジュール",
            contents: flexMessage,
          },
        ],
      }));
  }
  // 最終チェック
  setTimeout(async function () {
    const row = selectUserState.get(userId);
    if (row && row.step === 1) {
      await client.replyMessage({
        replyToken,
        messages: [
          {
            type: "text",
            text: "ご予約ありがとうございます。",
          },
        ],
      });
    }
  }, 1000);
}
