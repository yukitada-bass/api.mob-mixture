import express from "express";
import { client } from "../lib/line.js";
import transporter from "../lib/mail.js";
const router = express.Router();

router.post("/", async (req, res) => {
  const reserve = `ホームページから予約がありました。
日時: ${req.body.formattedDate}
予約枚数: ${req.body.sheetCount}
お名前: ${req.body.name}
メールアドレス: ${req.body.email}`;

  try {
    // await client.pushMessage(process.env.LINE_GROUP_ID, [
    //   {
    //     type: "text",
    //     text: reserve,
    //   },
    // ]);
    await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: process.env.LINE_GROUP_ID,
        messages: [
          {
            type: "text",
            text: reserve,
          },
        ],
      }),
    });
    // 2. メール送信
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: req.body.email,
      subject: "ご予約ありがとうございます",
      text: reserve,
    };

    await transporter.sendMail(mailOptions);

    res.send("OK");
  } catch (err) {
    res.send("Error");
  }
});

export default router;
