import { getTickets, insertUserState, updateUserState } from "../../lib/db.js";

export default async function handlePostback(replyToken, userId, data) {
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
    insertUserState.run(userId, tickets);
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
    const step = 1; // ステップを1に設定
    updateUserState.run(parseInt(number, 10), step, userId);
  }
  if (data.includes("select=")) {
    const tickets = data.split("=")[1];
    const list = getTickets.all(tickets);
    console.log(list);
  }
}
