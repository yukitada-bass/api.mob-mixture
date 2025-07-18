import { createClient } from "microcms-js-sdk";

export async function getLiveSchedules() {
  const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
    apiKey: process.env.MICROCMS_API_KEY,
  });

  const { contents } = await client.get({
    endpoint: "schedules",
  });

  if (!contents || contents.length === 0) {
    return null;
  }

  return generateFlexMessageFromSchedules(contents);
}

function generateFlexMessageFromSchedules(contents) {
  const bubbles = contents.map((item) => {
    const date = new Date(item.date);
    const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日 (${["日", "月", "火", "水", "木", "金", "土"][date.getDay()]}) ${item.start}開演`;

    const venue = item.venue?.[0] || "";
    const artists = item.with?.replace(/\n/g, " / ");
    const price = item.adv === item.door ? `前売/当日: ¥${item.adv}` : `前売: ¥${item.adv} / 当日: ¥${item.door}`;

    return {
      type: "bubble",
      hero: {
        type: "image",
        url: item.image?.url ?? "https://example.com/default-image.jpg",
        size: "full",
        aspectRatio: "3:4",
        aspectMode: "cover",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "text",
            text: item.title,
            weight: "bold",
            size: "lg",
            wrap: true,
          },
          {
            type: "text",
            text: `📍${venue}`,
            size: "sm",
            color: "#666666",
            wrap: true,
          },
          {
            type: "text",
            text: `🗓️ ${formattedDate}`,
            size: "sm",
            color: "#666666",
            wrap: true,
          },
          {
            type: "text",
            text: `🎤 ${artists}`,
            size: "sm",
            wrap: true,
          },
          {
            type: "text",
            text: `🎫 ${price}`,
            size: "sm",
            color: "#666666",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            action: {
              type: "postback",
              label: "チケット予約",
              data: `reserve=${item.title}`,
              displayText: "チケット予約",
            },
          },
        ],
      },
    };
  });

  return {
    type: "carousel",
    contents: bubbles,
  };
}
