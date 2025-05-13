import { createClient } from "microcms-js-sdk";
import dotenv from "dotenv";
dotenv.config();

export async function getLive() {
  const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
  });

  const { contents } = await client.get({
    endpoint: "schedules",
  });

  if(!contents || contents.length === 0) {
    return null;
  }

  // 日付だけを取り出す（YYYY-MM-DD形式）
  const dateOnly = new Date(contents[0].date).toISOString().split("T")[0];

  const extracted = [contents[0].title, dateOnly, contents[0].with];
  return extracted;
}
