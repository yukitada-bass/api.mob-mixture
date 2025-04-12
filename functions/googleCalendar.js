import { google } from "googleapis";

const auth = await google.auth.getClient({
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

const calendar = google.calendar({ version: "v3", auth });
const calendarId =
  "93c3b3af2379df3c2f957ca9d48363502b1b996ad8a8b34e40636c28db8673b5@group.calendar.google.com";

export const getCalendar = async () => {
  const res = await calendar.events.list({
    calendarId: calendarId,
    timeMin: new Date().toISOString(),
    maxResults: 1,
    singleEvents: true,
    orderBy: "startTime",
  });
  const events = res.data.items;
  if (events.length) {
    const date = new Date(events[0].start.dateTime);
    const formattedDate = `${
      date.getMonth() + 1
    }月${date.getDate()}日 ${date.getHours()}時`;
    return `${events[0].summary}
${formattedDate}〜`;
  } else {
    console.log("予定なし");
    return "予定なし";
  }
};

export const createCalendar = async (obj) => {
  try {
    const res = await calendar.events.insert({
      calendarId: calendarId,
      requestBody: {
        summary: obj.summary,
        start: {
          dateTime: obj.start,
          timeZone: "Asia/Tokyo",
        },
        end: {
          dateTime: obj.end,
          timeZone: "Asia/Tokyo",
        },
      },
    });

    console.log("作成されたカレンダー：", res.data);
    return `予定に${obj.summary}を追加しました`;
  } catch (err) {
    console.error("カレンダー作成中にエラーが発生しました:", err);
    throw err;
  }
};
