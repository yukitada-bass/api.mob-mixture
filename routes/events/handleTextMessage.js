import { client } from "../../lib/line.js";
import { getLiveSchedules } from "../../functions/getLiveSchedules.js";
import { getCalendar } from "../../functions/googleCalendar.js";
import {
  selectSchedule,
  selectUserState,
  listTShirtStock,
  setTShirtStock,
  addTShirtStock,
  reserveTShirt,
} from "../../lib/db.js";

export default async function handleTextMessage(
  replyToken,
  userMessage,
  userId,
) {
  if (/^Tシャツ在庫\s*$/i.test(userMessage)) {
    const stocks = await listTShirtStock();
    const sizes = ["M", "L", "XL"];
    const stockMap = stocks.reduce((acc, item) => {
      acc[item.size] = item.stock;
      return acc;
    }, {});
    const replyText = sizes
      .map((size) => `${size}: ${stockMap[size] ?? 0}`)
      .join("\n");
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: "text",
          text: `Tシャツ在庫\n${replyText}`,
        },
      ],
    });
    return;
  }

  const reserveMatch = userMessage.match(/^Tシャツ予約\s*(M|L|XL)\s*(\d+)$/i);
  if (reserveMatch) {
    const size = reserveMatch[1].toUpperCase();
    const quantity = parseInt(reserveMatch[2], 10);
    try {
      await reserveTShirt(size, quantity);
      await client.replyMessage({
        replyToken,
        messages: [
          {
            type: "text",
            text: `Tシャツ(${size})を${quantity}枚予約しました。`,
          },
        ],
      });
    } catch (error) {
      await client.replyMessage({
        replyToken,
        messages: [
          {
            type: "text",
            text:
              error.message ||
              "在庫の更新に失敗しました。サイズと数を確認してください。",
          },
        ],
      });
    }
    return;
  }

  const updateMatch = userMessage.match(
    /^Tシャツ在庫更新\s*(M|L|XL)\s*(\d+)$/i,
  );
  if (updateMatch) {
    const size = updateMatch[1].toUpperCase();
    const quantity = parseInt(updateMatch[2], 10);
    await setTShirtStock(size, quantity);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: "text",
          text: `Tシャツ(${size})の在庫を${quantity}に更新しました。`,
        },
      ],
    });
    return;
  }

  const addMatch = userMessage.match(/^Tシャツ在庫追加\s*(M|L|XL)\s*(\d+)$/i);
  if (addMatch) {
    const size = addMatch[1].toUpperCase();
    const quantity = parseInt(addMatch[2], 10);
    await addTShirtStock(size, quantity);
    await client.replyMessage({
      replyToken,
      messages: [
        {
          type: "text",
          text: `Tシャツ(${size})の在庫を${quantity}追加しました。`,
        },
      ],
    });
    return;
  }

  const deductMatch = userMessage.match(
    /^Tシャツ在庫減少\s*(M|L|XL)\s*(\d+)$/i,
  );
  if (deductMatch) {
    const size = deductMatch[1].toUpperCase();
    const quantity = parseInt(deductMatch[2], 10);
    try {
      await reserveTShirt(size, quantity);
      await client.replyMessage({
        replyToken,
        messages: [
          {
            type: "text",
            text: `Tシャツ(${size})の在庫を${quantity}減らしました。`,
          },
        ],
      });
    } catch (error) {
      await client.replyMessage({
        replyToken,
        messages: [
          {
            type: "text",
            text:
              error.message ||
              "在庫の更新に失敗しました。サイズと数を確認してください。",
          },
        ],
      });
    }
    return;
  }

  if (userMessage.includes("取り置きリスト")) {
    const rows = await selectSchedule();
    const uniqueTickets = [
      ...new Set(rows.map((r) => r.tickets).filter(Boolean)),
    ];
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
    const row = userId ? await selectUserState(userId) : null;
    if (row && row.step) {
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
