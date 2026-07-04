import { client } from "../../lib/line.js";
import { getTickets, insertUserState, updateUserState } from "../../lib/db.js";

export default async function handlePostback(replyToken, userId, data) {
  if (!userId) {
    return;
  }

  if (data.includes("reserve=")) {
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: "text",
          text: "予約枚数を選択してください",
          quickReply: {
            items: [
              {
                type: "action",
                action: {
                  type: "postback",
                  label: "1枚",
                  data: "number=1",
                  displayText: "1枚",
                },
              },
              {
                type: "action",
                action: {
                  type: "postback",
                  label: "2枚",
                  data: "number=2",
                  displayText: "2枚",
                },
              },
              {
                type: "action",
                action: {
                  type: "postback",
                  label: "3枚",
                  data: "number=3",
                  displayText: "3枚",
                },
              },
              {
                type: "action",
                action: {
                  type: "postback",
                  label: "4枚",
                  data: "number=4",
                  displayText: "4枚",
                },
              },
            ],
          },
        },
      ],
    });
    const tickets = data.split("=")[1];
    await insertUserState(userId, tickets);
  }
  if (data.includes("number=")) {
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: "text",
          text: "お名前を入力してください",
        },
      ],
    });
    const number = data.split("=")[1];
    const step = true; // ステップを有効に設定
    await updateUserState(parseInt(number, 10), step, userId);
  }
  if (data.includes("select=")) {
    const tickets = data.split("=")[1];
    const list = await getTickets(tickets);
    console.log(list);
  }
}
