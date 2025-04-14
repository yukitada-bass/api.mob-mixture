import { google } from "googleapis";
import { DateTime } from "luxon";
import dotenv from "dotenv";
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: "v3", auth: oauth2Client });
const calendarId = process.env.GOOGLE_CALENDAR_ID;

export const getCalendar = async () => {
  const res = await calendar.events.list({
    calendarId: calendarId,
    timeMin: DateTime.now().setZone("Asia/Tokyo").toISO(),
    maxResults: 1,
    singleEvents: true,
    orderBy: "startTime",
  });
  const events = res.data.items;
  if (events.length) {
    const date = DateTime.fromISO(events[0].start.dateTime).setZone(
      "Asia/Tokyo"
    );
    const formattedDate = date.toFormat("M月d日 H時");
    return `${events[0].summary}
${formattedDate}〜`;
  } else {
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
    return `予定に${obj.summary}を追加しました`;
  } catch (err) {
    return "カレンダー作成中にエラーが発生しました";
  }
};
